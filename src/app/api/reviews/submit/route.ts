import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  getClientIPAddress,
  isRateLimited,
  isSpamHoneypotTriggered,
  recordSubmissionAttempt,
} from '@/lib/formSpamProtection'
import { validateReviewSubmission, type ReviewSubmissionValues } from '@/lib/reviews'

const successMessage = 'Thanks for your review.'

export async function POST(request: Request) {
  const payload = await getPayload({
    config: configPromise,
  })

  let payloadBody: { values?: ReviewSubmissionValues } | null = null

  try {
    payloadBody = (await request.json()) as { values?: ReviewSubmissionValues }
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid review submission payload.',
      },
      { status: 400 },
    )
  }

  const submissionValues =
    payloadBody?.values && typeof payloadBody.values === 'object' ? payloadBody.values : {}

  if (isSpamHoneypotTriggered(submissionValues)) {
    return NextResponse.json({
      message: successMessage,
    })
  }

  const ipAddress = getClientIPAddress(request)

  if (isRateLimited({ formSlug: 'reviews', ipAddress })) {
    return NextResponse.json(
      {
        message: 'Too many submissions from this device. Please wait a few minutes and try again.',
      },
      { status: 429 },
    )
  }

  recordSubmissionAttempt({
    formSlug: 'reviews',
    ipAddress,
  })

  const { errors, normalizedData } = validateReviewSubmission({
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

  await payload.create({
    collection: 'reviews',
    data: {
      _status: 'draft',
      isGenuineExperience: normalizedData.isGenuineExperience,
      rating: normalizedData.rating,
      reviewBody: normalizedData.reviewBody,
      reviewerEmail: normalizedData.reviewerEmail,
      reviewerName: normalizedData.reviewerName,
      reviewTitle: normalizedData.reviewTitle,
      title: normalizedData.reviewTitle,
      workflowState: 'in_review',
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    message: successMessage,
  })
}
