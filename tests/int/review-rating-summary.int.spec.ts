import { describe, expect, it, vi } from 'vitest'

import {
  calculatePublishedReviewRatingSummary,
  fetchPublishedReviewRatingSummary,
  type ReviewRatingPayload,
} from '@/lib/reviewRatingSummary'

describe('published review rating summary', () => {
  it('calculates a weighted average and total from five rating buckets', () => {
    expect(calculatePublishedReviewRatingSummary([1, 2, 3, 4, 10])).toEqual({
      average: 4,
      count: 20,
    })
    expect(calculatePublishedReviewRatingSummary([0, 0, 0, 0, 0])).toBeNull()
  })

  it('counts all five published rating buckets concurrently', async () => {
    const resolvers: Array<(value: { totalDocs: number }) => void> = []
    const count = vi.fn(
      (_request: { where: unknown }) =>
        new Promise<{ totalDocs: number }>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const logger = { error: vi.fn() }
    const payload = { count, logger } as unknown as ReviewRatingPayload
    const summaryPromise = fetchPublishedReviewRatingSummary(payload)

    expect(count).toHaveBeenCalledTimes(5)
    expect(count.mock.calls.map(([request]) => request.where)).toEqual(
      ['1', '2', '3', '4', '5'].map((rating) => ({
        and: [{ _status: { equals: 'published' } }, { rating: { equals: rating } }],
      })),
    )

    ;[1, 2, 3, 4, 10].forEach((totalDocs, index) => resolvers[index]?.({ totalDocs }))

    await expect(summaryPromise).resolves.toEqual({ average: 4, count: 20 })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('returns null and logs when a count query fails', async () => {
    const failure = new Error('database unavailable')
    const logger = { error: vi.fn() }
    const count = vi.fn().mockRejectedValue(failure)
    const payload = { count, logger } as unknown as ReviewRatingPayload

    await expect(fetchPublishedReviewRatingSummary(payload)).resolves.toBeNull()
    expect(logger.error).toHaveBeenCalledWith({
      err: failure,
      msg: 'Failed to aggregate published review ratings.',
    })
  })
})
