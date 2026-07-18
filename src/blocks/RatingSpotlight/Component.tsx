import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import {
  RatingSpotlight,
  type RatingSpotlightAlignment,
  type RatingSpotlightPresentationProps,
  type RatingSpotlightSize,
} from '@/components/rating-spotlight'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import {
  getPublishedReviewRatingSummary,
  type PublishedReviewRatingSummary,
} from '@/lib/reviewRatingSummary'

export type RatingSpotlightBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: RatingSpotlightAlignment | null
  description?: string | null
  eyebrow?: string | null
  ratingData?: {
    dataMode?: 'live' | 'manual' | null
    manualRating?: number | null
    manualReviewCount?: number | null
  } | null
  size?: RatingSpotlightSize | null
  title?: string | null
}

const resolveManualSummary = (
  ratingData: RatingSpotlightBlockLike['ratingData'],
): PublishedReviewRatingSummary | null => {
  const average = ratingData?.manualRating
  const count = ratingData?.manualReviewCount

  if (
    typeof average !== 'number' ||
    !Number.isFinite(average) ||
    average < 0 ||
    average > 5 ||
    typeof count !== 'number' ||
    !Number.isInteger(count) ||
    count < 0
  ) {
    return null
  }

  return { average, count }
}

export async function LiveRatingSpotlight(
  props: Omit<RatingSpotlightPresentationProps, 'summary'>,
) {
  const summary = await getPublishedReviewRatingSummary()

  return <RatingSpotlight {...props} summary={summary} />
}

export function RatingSpotlightBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  eyebrow,
  ratingData,
  size = 'default',
  title,
}: RatingSpotlightBlockLike) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedSize = size ?? 'default'
  const resolvedActionMode = actionMode ?? 'link'
  const resolvedActions = resolveCmsActions(actions)
  const presentationProps: Omit<RatingSpotlightPresentationProps, 'summary'> = {
    actions: resolvedActions.length ? (
      <ContentActions
        actions={resolvedActions}
        alignment={resolvedAlignment}
        className="lg:w-auto lg:justify-end"
        mode={resolvedActionMode}
      />
    ) : undefined,
    alignment: resolvedAlignment,
    appearance,
    description: description?.trim(),
    eyebrow: eyebrow?.trim(),
    size: resolvedSize,
    title: resolvedTitle,
  }

  if (ratingData?.dataMode === 'manual') {
    return <RatingSpotlight {...presentationProps} summary={resolveManualSummary(ratingData)} />
  }

  return <LiveRatingSpotlight {...presentationProps} />
}
