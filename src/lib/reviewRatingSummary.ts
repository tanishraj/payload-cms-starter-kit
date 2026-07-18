import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

export type PublishedReviewRatingSummary = {
  average: number
  count: number
}

export type ReviewRatingPayload = Pick<Payload, 'count' | 'logger'>

const ratingValues = ['1', '2', '3', '4', '5'] as const

export function calculatePublishedReviewRatingSummary(
  counts: readonly number[],
): PublishedReviewRatingSummary | null {
  const count = counts.reduce((total, current) => total + current, 0)

  if (count === 0) {
    return null
  }

  const weightedTotal = counts.reduce((total, current, index) => total + current * (index + 1), 0)

  return {
    average: weightedTotal / count,
    count,
  }
}

export async function fetchPublishedReviewRatingSummary(
  payload: ReviewRatingPayload,
): Promise<PublishedReviewRatingSummary | null> {
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

    return calculatePublishedReviewRatingSummary(buckets.map(({ totalDocs }) => totalDocs))
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: 'Failed to aggregate published review ratings.',
    })
    return null
  }
}

export const getPublishedReviewRatingSummary = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  return fetchPublishedReviewRatingSummary(payload)
})
