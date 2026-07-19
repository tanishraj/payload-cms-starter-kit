import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ReviewFeed, type ReviewFeedSize } from '@/components/review-feed'
import { normalizeReviewFeedPageSize, type PublicReviewFeedPage } from '@/lib/reviewFeedShared'
import type { PublishedReviewRatingDistribution } from '@/lib/reviewRatingShared'

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

export type ReviewFeedBlockPresentationProps = ReviewFeedBlockLike & {
  initialPage: PublicReviewFeedPage
  summary: PublishedReviewRatingDistribution | null
}

export function ReviewFeedBlockPresentation({
  appearance,
  description,
  emptyStateMessage,
  eyebrow,
  initialPage,
  loadMoreLabel,
  pageSize,
  size,
  summary,
  title,
}: ReviewFeedBlockPresentationProps) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  return (
    <ReviewFeed
      appearance={appearance}
      description={description?.trim()}
      emptyStateMessage={emptyStateMessage?.trim() || 'No published reviews yet.'}
      eyebrow={eyebrow?.trim()}
      initialPage={initialPage}
      loadMoreLabel={loadMoreLabel?.trim() || 'Load More Reviews'}
      pageSize={normalizeReviewFeedPageSize(pageSize)}
      size={size ?? 'default'}
      summary={summary}
      title={resolvedTitle}
    />
  )
}
