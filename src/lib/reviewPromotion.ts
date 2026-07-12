import type { Payload } from 'payload'

import type { RequiredReviewSubmissionValues } from '@/lib/reviews'

const normalizeRelationshipID = (value: unknown): string | number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const relationshipID = (value as { id?: unknown }).id

    if (typeof relationshipID === 'number' && Number.isFinite(relationshipID)) {
      return relationshipID
    }

    if (typeof relationshipID === 'string' && relationshipID.length > 0) {
      return relationshipID
    }
  }

  return null
}

export const upsertReviewFromSubmission = async ({
  existingReview,
  payload,
  sourceSubmissionID,
  values,
}: {
  existingReview?: unknown
  payload: Payload
  sourceSubmissionID: string | number
  values: RequiredReviewSubmissionValues
}): Promise<string> => {
  const existingReviewID = normalizeRelationshipID(existingReview)
  const reviewData = {
    _status: 'draft' as const,
    isGenuineExperience: values.isGenuineExperience,
    rating: values.rating,
    reviewBody: values.reviewBody,
    reviewerEmail: values.reviewerEmail,
    reviewerName: values.reviewerName,
    reviewTitle: values.reviewTitle,
    sourceSubmission: String(sourceSubmissionID),
    title: values.reviewTitle,
    workflowState: 'in_review' as const,
  }

  if (existingReviewID) {
    const updatedReview = await payload.update({
      collection: 'reviews',
      data: reviewData,
      id: existingReviewID,
      overrideAccess: true,
    })

    return String(updatedReview.id)
  }

  const createdReview = await payload.create({
    collection: 'reviews',
    data: reviewData,
    draft: true,
    overrideAccess: true,
  })

  return String(createdReview.id)
}
