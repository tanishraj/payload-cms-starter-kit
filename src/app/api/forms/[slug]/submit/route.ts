import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  getClientIPAddress,
  isRateLimited,
  isSpamHoneypotTriggered,
  recordSubmissionAttempt,
} from '@/lib/formSpamProtection'
import {
  buildFormNotificationEmail,
  getNotificationRecipients,
} from '@/lib/formNotifications'
import { validateFormSubmission, type FormSubmissionValues, type SimpleFormField } from '@/lib/forms'
import type { Form } from '@/payload-types'

const toSimpleFields = (form: Form): SimpleFormField[] => {
  return (form.fields ?? []).map((field) => ({
    label: field.label,
    name: field.name,
    options:
      field.options?.map((option) => ({
        label: option.label,
        value: option.value,
      })) ?? null,
    placeholder: field.placeholder ?? null,
    required: field.required ?? false,
    type: field.type,
  }))
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'forms',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const form = result.docs[0] ?? null

  if (!form) {
    return NextResponse.json(
      {
        message: 'The requested form is not available.',
      },
      { status: 404 },
    )
  }

  let payloadBody: { values?: FormSubmissionValues } | null = null

  try {
    payloadBody = (await request.json()) as { values?: FormSubmissionValues }
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid form submission payload.',
      },
      { status: 400 },
    )
  }

  const submissionValues =
    payloadBody?.values && typeof payloadBody.values === 'object' ? payloadBody.values : {}

  if (isSpamHoneypotTriggered(submissionValues)) {
    return NextResponse.json({
      message: form.successMessage,
    })
  }

  const ipAddress = getClientIPAddress(request)

  if (isRateLimited({ formSlug: slug, ipAddress })) {
    return NextResponse.json(
      {
        message: 'Too many submissions from this device. Please wait a few minutes and try again.',
      },
      { status: 429 },
    )
  }

  recordSubmissionAttempt({
    formSlug: slug,
    ipAddress,
  })

  const { errors, normalizedData } = validateFormSubmission({
    fields: toSimpleFields(form),
    values: submissionValues,
  })

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        errors,
        message: 'Please correct the highlighted fields and try again.',
      },
      { status: 400 },
    )
  }

  const submission = await payload.create({
    collection: 'form-submissions',
    data: {
      data: normalizedData,
      form: form.id,
    },
    overrideAccess: true,
  })

  const notificationRecipients = getNotificationRecipients(form)

  if (notificationRecipients.length > 0) {
    const submittedAt = submission.createdAt ? new Date(submission.createdAt) : new Date()
    const emailContent = buildFormNotificationEmail({
      form,
      submittedAt,
      values: normalizedData,
    })

    try {
      await payload.sendEmail({
        html: emailContent.html,
        subject: emailContent.subject,
        text: emailContent.text,
        to: notificationRecipients,
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Failed to send form notification email for form "${form.slug}".`,
      })
    }
  }

  return NextResponse.json({
    message: form.successMessage,
  })
}
