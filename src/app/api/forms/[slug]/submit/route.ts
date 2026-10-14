import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { createLocalReq, getPayload, type PayloadRequest } from 'payload'

import {
  PUBLIC_JSON_BODY_MAX_BYTES,
  RequestBodyError,
  readBoundedJSON,
} from '@/domains/forms/requestLimits'
import {
  getClientIPAddress,
  isRateLimited,
  isSpamHoneypotTriggered,
  recordSubmissionAttempt,
} from '@/lib/formSpamProtection'
import {
  buildFormNotificationEmail,
  buildSubmitterConfirmationEmail,
  getNotificationRecipients,
} from '@/lib/formNotifications'
import { emitFormSubmissionEvent } from '@/lib/formSubmissionEvents'
import {
  findSubmissionReceipt,
  hasSubmissionKeyIndex,
  submissionIdentity,
} from '@/lib/formSubmissionIdempotency.server'
import {
  claimFormAttachments,
  FormAttachmentValidationError,
  type CapturedFormAttachment,
} from '@/lib/formAttachments.server'
import { attachmentStorageAvailable } from '@/lib/formAttachmentStorage.server'
import { runtimeConfig } from '@/config/runtime.server'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import { projectFormFields } from '@/lib/genericFormShared'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'
import {
  getSubmissionContactMetadata,
  isFormSubmissionValues,
  isReviewFormSubmissionIntent,
  normalizeFormSubmissionIntent,
  REVIEW_SUBMISSION_FIELD_NAMES,
  validateFormSubmissionMetadata,
  validateFormSubmission,
  type FormSubmissionValues,
} from '@/lib/forms'
import { upsertReviewFromSubmission } from '@/lib/reviewPromotion'
import { validateReviewSubmission } from '@/lib/reviews'
import { normalizeSiteTimeZone, type SiteTimeZone } from '@/lib/siteTimeZone'

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const payload = await getPayload({
    config: configPromise,
  })

  let payloadBody: {
    metadata?: unknown
    values?: FormSubmissionValues
    formRevision?: unknown
    submissionKey?: unknown
  } | null = null

  try {
    payloadBody = await readBoundedJSON(request, {
      maxBytes: PUBLIC_JSON_BODY_MAX_BYTES,
    })
  } catch (error) {
    const status =
      error instanceof RequestBodyError
        ? {
            body_too_large: 413,
            invalid_json: 400,
            unsupported_media_type: 415,
          }[error.code]
        : 400

    return NextResponse.json(
      {
        message: 'Invalid form submission payload.',
      },
      { status },
    )
  }

  const identity =
    payloadBody?.submissionKey === undefined
      ? null
      : submissionIdentity(
          slug,
          payloadBody.submissionKey,
          payloadBody.values,
          payloadBody.formRevision,
        )
  if (payloadBody?.submissionKey !== undefined && !identity) {
    return NextResponse.json({ message: 'Invalid submission request.' }, { status: 400 })
  }
  const receiptResponse = (
    receipt: NonNullable<Awaited<ReturnType<typeof findSubmissionReceipt>>>,
  ) => {
    if (receipt.submissionRequestHash !== identity?.submissionRequestHash) {
      return NextResponse.json(
        {
          code: 'SUBMISSION_KEY_REUSED',
          message:
            'An earlier response was already received. Start a new response to send these answers.',
        },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      )
    }
    return NextResponse.json(
      { message: receipt.submissionConfirmation ?? 'Your response was received.' },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
  if (identity) {
    const receipt = await findSubmissionReceipt(payload, identity.submissionKeyHash)
    if (receipt) return receiptResponse(receipt)
    if (!(await hasSubmissionKeyIndex(payload))) {
      return NextResponse.json(
        { message: 'Submission service is temporarily unavailable.' },
        { status: 503 },
      )
    }
  }

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

  // Revisionless legacy Contact33/Review clients retain their existing protocol.
  // Generic clients always send the revision delivered with their published definition.
  if (payloadBody?.formRevision !== undefined) {
    if (
      typeof payloadBody.formRevision !== 'string' ||
      !/^[a-f0-9]{64}$/.test(payloadBody.formRevision)
    ) {
      return NextResponse.json({ message: 'Invalid form revision.' }, { status: 400 })
    }
    const published = projectPublishedGenericForm(form)
    if (!published || published.revision !== payloadBody.formRevision) {
      return NextResponse.json(
        {
          code: 'FORM_CHANGED',
          message: 'The questions have changed. Review the updated form before submitting again.',
          form: published,
        },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      )
    }
  }

  const submissionValues = payloadBody?.values ?? {}
  const { errors: metadataErrors, normalizedMetadata: submissionMetadata } =
    validateFormSubmissionMetadata(payloadBody?.metadata)

  if (isFormSubmissionValues(submissionValues) && isSpamHoneypotTriggered(submissionValues)) {
    return NextResponse.json({
      message: form.successMessage,
    })
  }

  const ipAddress = getClientIPAddress(request)

  const rateLimitDecision = isRateLimited({ formSlug: slug, ipAddress })

  if (rateLimitDecision.limited) {
    return NextResponse.json(
      {
        message: 'Too many submissions from this device. Please wait a few minutes and try again.',
      },
      {
        headers: {
          'Retry-After': String(rateLimitDecision.retryAfterSeconds),
        },
        status: 429,
      },
    )
  }

  recordSubmissionAttempt({
    formSlug: slug,
    ipAddress,
  })

  const submissionIntent = normalizeFormSubmissionIntent(form.submissionIntent)
  const isReviewSubmission = isReviewFormSubmissionIntent(submissionIntent)
  const formFields = projectFormFields(form)
  if (formFields.some((field) => field.type === 'file') && !attachmentStorageAvailable())
    return NextResponse.json({ message: 'This form is temporarily unavailable.' }, { status: 503 })
  const validationFields = isReviewSubmission
    ? formFields.map((field) =>
        field.name === 'isGenuineExperience' ||
        field.name === 'reviewTitle' ||
        field.name === 'reviewerEmail'
          ? { ...field, required: false }
          : field,
      )
    : formFields
  const { errors, normalizedData } = validateFormSubmission({
    additionalFieldNames: isReviewSubmission ? REVIEW_SUBMISSION_FIELD_NAMES : [],
    fields: validationFields,
    values: submissionValues,
  })
  const reviewValidation = isReviewSubmission
    ? validateReviewSubmission({
        values: {
          ...submissionValues,
          ...normalizedData,
        },
      })
    : null
  const combinedErrors = reviewValidation
    ? {
        ...errors,
        ...metadataErrors,
        ...reviewValidation.errors,
      }
    : {
        ...errors,
        ...metadataErrors,
      }

  if (Object.keys(combinedErrors).length > 0) {
    return NextResponse.json(
      {
        errors: combinedErrors,
        message: 'Please correct the highlighted fields and try again.',
      },
      { status: 400 },
    )
  }

  const submissionData = reviewValidation
    ? {
        ...normalizedData,
        ...reviewValidation.normalizedData,
      }
    : normalizedData
  const {
    email: submitterEmail,
    name: submitterName,
    phone: submitterPhone,
  } = getSubmissionContactMetadata(submissionData, formFields)
  const submittedAt = new Date()
  let submission
  let attachments: CapturedFormAttachment[] = []
  let transactionID: string | number | null | undefined
  let submissionReq: PayloadRequest | undefined
  try {
    if (formFields.some((field) => field.type === 'file')) {
      if (!identity || !payloadBody?.formRevision)
        return NextResponse.json(
          { message: 'File forms require a current revision and submission key.' },
          { status: 400 },
        )
      transactionID = await payload.db.beginTransaction()
      if (!transactionID)
        throw new Error('Private attachment submissions require database transactions.')
      submissionReq = await createLocalReq({ req: { transactionID } }, payload)
      attachments = await claimFormAttachments({
        payload,
        fields: formFields,
        values: submissionData,
        keyHash: identity.submissionKeyHash,
        formID: String(form.id),
        req: submissionReq,
      })
    }
    submission = await payload.create({
      collection: 'form-submissions',
      data: {
        ...(identity ? { ...identity, submissionConfirmation: form.successMessage } : {}),
        ...buildFormSubmissionSnapshot(
          { ...form, fields: formFields },
          submissionData,
          attachments,
        ),
        ...(attachments.length ? { attachments } : {}),
        data: submissionData,
        campaign: submissionMetadata.campaign,
        email: submitterEmail,
        form: form.id,
        landingPage: submissionMetadata.landingPage,
        source: submissionMetadata.source,
        status: 'new',
        submissionIntent,
        submittedAt: submittedAt.toISOString(),
        submitterEmail,
        submitterName,
        submitterPhone,
      },
      overrideAccess: true,
      req: submissionReq,
    })
    if (transactionID) {
      await payload.db.commitTransaction(transactionID)
      transactionID = undefined
    }
  } catch (error) {
    if (transactionID) await payload.db.rollbackTransaction(transactionID)
    if (error instanceof FormAttachmentValidationError)
      return NextResponse.json({ message: error.message }, { status: 400 })
    // A concurrent request may have committed while this request was creating.
    if (identity) {
      const receipt = await findSubmissionReceipt(payload, identity.submissionKeyHash)
      if (receipt) return receiptResponse(receipt)
      payload.logger.error({ err: error, msg: 'Unable to confirm form submission storage.' })
      return NextResponse.json(
        { message: 'Unable to confirm submission storage.' },
        { status: 503 },
      )
    }
    throw error
  }

  if (reviewValidation) {
    try {
      const linkedReviewID = await upsertReviewFromSubmission({
        existingReview: submission.linkedReview,
        payload,
        sourceSubmissionID: submission.id,
        values: reviewValidation.normalizedData,
      })

      await payload.update({
        collection: 'form-submissions',
        data: {
          linkedReview: linkedReviewID,
          promotionError: null,
        },
        id: submission.id,
        overrideAccess: true,
      })
    } catch (error) {
      const promotionError =
        error instanceof Error ? error.message : 'Failed to create the linked review draft.'

      payload.logger.error({
        err: error,
        msg: `Failed to promote review submission for form "${form.slug}".`,
      })

      await payload.update({
        collection: 'form-submissions',
        data: {
          promotionError,
        },
        id: submission.id,
        overrideAccess: true,
      })
    }
  }

  try {
    await emitFormSubmissionEvent({
      campaign: submissionMetadata.campaign,
      formId: form.id,
      formSlug: form.slug,
      landingPage: submissionMetadata.landingPage,
      owner: undefined,
      submissionId: submission.id,
      source: submissionMetadata.source,
      status: 'new',
      submissionIntent,
      submitterEmail,
      submitterName,
      submitterPhone,
      values: submissionData,
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Failed to emit form submission event for form "${form.slug}".`,
    })
  }

  const notificationRecipients = getNotificationRecipients(form)
  let emailSiteName: string | undefined
  let emailTimeZone: SiteTimeZone | undefined

  if (notificationRecipients.length > 0 || (form.submitterReply?.enabled && submitterEmail)) {
    try {
      const siteSettings = await payload.findGlobal({
        slug: 'site-settings',
        depth: 0,
        draft: false,
        overrideAccess: true,
      })
      emailSiteName = siteSettings.siteName?.trim() || undefined
      emailTimeZone = normalizeSiteTimeZone(siteSettings.timeZone)
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Failed to load site identity for form email branding.',
      })
    }
  }

  if (notificationRecipients.length > 0) {
    const emailContent = buildFormNotificationEmail({
      form,
      siteName: emailSiteName,
      submittedAt,
      timeZone: emailTimeZone,
      values: submissionData,
      attachments,
      submissionURL: new URL(
        `/admin/collections/form-submissions/${submission.id}`,
        runtimeConfig.application.origin,
      ).toString(),
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

  if (form.submitterReply?.enabled && submitterEmail) {
    const replyEmail = buildSubmitterConfirmationEmail({
      form,
      siteName: emailSiteName,
      submitterName,
    })
    try {
      await payload.sendEmail({
        html: replyEmail.html,
        subject: replyEmail.subject,
        text: replyEmail.text,
        to: submitterEmail,
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Failed to send submitter confirmation email for form "${form.slug}".`,
      })
    }
  }

  return NextResponse.json({
    message: form.successMessage,
  })
}
