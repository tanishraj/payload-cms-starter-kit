import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ReviewFeed, type ReviewFeedSize } from '@/components/review-feed'
import {
  getPublishedReviewFeedPage,
  REVIEW_FEED_DEFAULT_PAGE_SIZE,
  REVIEW_FEED_MAX_PAGE_SIZE,
} from '@/lib/reviewFeed'
import { getPublishedReviewRatingDistribution } from '@/lib/reviewRatingSummary'

export type ReviewFeedBlockLike = {
  appearance?: BlockAppearance | null
  description?: string | null
  emptyStateMessage?: string | null
  eyebrow?: string | null
  loadMoreLabel?: string | null
  pageSize?: number | null
  size?: ReviewFeedSize | null
  title?: string | null
}

const normalizePageSize = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isInteger(value)
    ? Math.min(REVIEW_FEED_MAX_PAGE_SIZE, Math.max(1, value))
    : REVIEW_FEED_DEFAULT_PAGE_SIZE

export async function ReviewFeedBlockComponent({
  appearance,
  description,
  emptyStateMessage,
  eyebrow,
  loadMoreLabel,
  pageSize,
  size,
  title,
}: ReviewFeedBlockLike) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  const resolvedPageSize = normalizePageSize(pageSize)
  const pagePromise = getPublishedReviewFeedPage(1, resolvedPageSize).catch(() => ({
    docs: [],
    hasNextPage: false,
    page: 1,
    totalPages: 0,
  }))
  const summaryPromise = getPublishedReviewRatingDistribution()
  const [initialPage, summary] = await Promise.all([pagePromise, summaryPromise])

  return (
    <ReviewFeed
      appearance={appearance}
      description={description?.trim()}
      emptyStateMessage={emptyStateMessage?.trim() || 'No published reviews yet.'}
      eyebrow={eyebrow?.trim()}
      initialPage={initialPage}
      loadMoreLabel={loadMoreLabel?.trim() || 'Load More Reviews'}
      pageSize={resolvedPageSize}
      size={size ?? 'default'}
      summary={summary}
      title={resolvedTitle}
    />
  )
}
