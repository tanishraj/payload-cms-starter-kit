import type { Payload } from 'payload'

import type { RequiredReviewSubmissionValues } from '@/lib/reviews'

const normalizeRelationshipID = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const relationshipID = (value as { id?: unknown }).id

    if (typeof relationshipID === 'number' && Number.isFinite(relationshipID)) {
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
  sourceSubmissionID: number
  values: RequiredReviewSubmissionValues
}): Promise<number> => {
  const existingReviewID = normalizeRelationshipID(existingReview)
  const reviewData = {
    _status: 'draft' as const,
    isGenuineExperience: values.isGenuineExperience,
    rating: values.rating,
    reviewBody: values.reviewBody,
    reviewerEmail: values.reviewerEmail,
    reviewerName: values.reviewerName,
    reviewTitle: values.reviewTitle,
    sourceSubmission: sourceSubmissionID,
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

    return updatedReview.id
  }

  const createdReview = await payload.create({
    collection: 'reviews',
    data: reviewData,
    overrideAccess: true,
  })

  return createdReview.id
}
