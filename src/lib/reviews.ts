import type { Review } from '@/payload-types'

export const reviewRatingOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
] as const

export type ReviewSubmissionValues = Record<string, unknown>

export type ReviewSubmissionErrors = Record<string, string>

export type RequiredReviewSubmissionValues = {
  isGenuineExperience: boolean
  rating: (typeof reviewRatingOptions)[number]['value']
  reviewBody: string
  reviewerEmail: string
  reviewerName: string
  reviewTitle: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeReviewCheckboxValue = (value: unknown): boolean => {
  return value === true || value === 'true' || value === 'on' || value === '1' || value === 1
}

const normalizeReviewTextValue = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

export const getReviewDisplayName = (
  review: Pick<Review, 'displayName' | 'reviewerName'>,
): string => {
  const explicitName = review.displayName?.trim()

  if (explicitName) {
    return explicitName
  }

  const normalizedReviewerName = review.reviewerName.trim()

  if (!normalizedReviewerName) {
    return 'Anonymous'
  }

  const [firstName = 'Anonymous', lastName = ''] = normalizedReviewerName.split(/\s+/)

  return lastName ? `${firstName} ${lastName[0]}.` : firstName
}

export const validateReviewSubmission = ({
  values,
}: {
  values: ReviewSubmissionValues
}): {
  errors: ReviewSubmissionErrors
  normalizedData: RequiredReviewSubmissionValues
} => {
  const errors: ReviewSubmissionErrors = {}
  const normalizedData: RequiredReviewSubmissionValues = {
    isGenuineExperience: normalizeReviewCheckboxValue(values.isGenuineExperience),
    rating: normalizeReviewTextValue(values.rating) as RequiredReviewSubmissionValues['rating'],
    reviewBody: normalizeReviewTextValue(values.reviewBody),
    reviewerEmail: normalizeReviewTextValue(values.reviewerEmail).toLowerCase(),
    reviewerName: normalizeReviewTextValue(values.reviewerName),
    reviewTitle: normalizeReviewTextValue(values.reviewTitle),
  }

  const allowedRatings = new Set(reviewRatingOptions.map((option) => option.value))

  if (!allowedRatings.has(normalizedData.rating)) {
    errors.rating = 'Rating contains an invalid option.'
  }

  if (!normalizedData.reviewTitle) {
    errors.reviewTitle = 'Review title is required.'
  }

  if (!normalizedData.reviewBody) {
    errors.reviewBody = 'Review body is required.'
  }

  if (!normalizedData.reviewerName) {
    errors.reviewerName = 'Reviewer name is required.'
  }

  if (!normalizedData.reviewerEmail) {
    errors.reviewerEmail = 'Reviewer email is required.'
  } else if (!emailPattern.test(normalizedData.reviewerEmail)) {
    errors.reviewerEmail = 'Reviewer email must be a valid email address.'
  }

  if (!normalizedData.isGenuineExperience) {
    errors.isGenuineExperience = 'Genuine experience must be accepted.'
  }

  return {
    errors,
    normalizedData,
  }
}
