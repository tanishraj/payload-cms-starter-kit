import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

export type PublishedReviewRatingSummary = {
  average: number
  count: number
}

export type PublishedReviewRatingDistribution = PublishedReviewRatingSummary & {
  counts: readonly [number, number, number, number, number]
}

export type ReviewRatingPayload = Pick<Payload, 'count' | 'logger'>

const ratingValues = ['1', '2', '3', '4', '5'] as const

const toRatingCounts = (counts: readonly number[]): PublishedReviewRatingDistribution['counts'] => [
  counts[0] ?? 0,
  counts[1] ?? 0,
  counts[2] ?? 0,
  counts[3] ?? 0,
  counts[4] ?? 0,
]

export function calculatePublishedReviewRatingDistribution(
  counts: readonly number[],
): PublishedReviewRatingDistribution | null {
  const normalizedCounts = toRatingCounts(counts)
  const count = normalizedCounts.reduce((total, current) => total + current, 0)

  if (count === 0) {
    return null
  }

  const weightedTotal = normalizedCounts.reduce(
    (total, current, index) => total + current * (index + 1),
    0,
  )

  return {
    average: weightedTotal / count,
    count,
    counts: normalizedCounts,
  }
}

export function calculatePublishedReviewRatingSummary(
  counts: readonly number[],
): PublishedReviewRatingSummary | null {
  const distribution = calculatePublishedReviewRatingDistribution(counts)

  if (!distribution) {
    return null
  }

  return {
    average: distribution.average,
    count: distribution.count,
  }
}

export async function fetchPublishedReviewRatingDistribution(
  payload: ReviewRatingPayload,
): Promise<PublishedReviewRatingDistribution | null> {
  try {
    const buckets = await Promise.all(
      ratingValues.map((rating) =>
        payload.count({
          collection: 'reviews',
          overrideAccess: true,
          where: {
            and: [{ _status: { equals: 'published' } }, { rating: { equals: rating } }],
          },
        }),
      ),
    )

    return calculatePublishedReviewRatingDistribution(buckets.map(({ totalDocs }) => totalDocs))
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: 'Failed to aggregate published review ratings.',
    })
    return null
  }
}

export async function fetchPublishedReviewRatingSummary(
  payload: ReviewRatingPayload,
): Promise<PublishedReviewRatingSummary | null> {
  const distribution = await fetchPublishedReviewRatingDistribution(payload)

  return distribution ? { average: distribution.average, count: distribution.count } : null
}

export const getPublishedReviewRatingDistribution = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  return fetchPublishedReviewRatingDistribution(payload)
})

export const getPublishedReviewRatingSummary = cache(async () => {
  const distribution = await getPublishedReviewRatingDistribution()

  return distribution ? { average: distribution.average, count: distribution.count } : null
})
