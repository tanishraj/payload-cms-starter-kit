import {
  NewsEventsHighlightsBlockPresentation,
  type NewsEventsHighlightsBlockLike,
} from '@/blocks/NewsEventsHighlights/Presentation'
import { toAutomaticFeaturedHighlightItems } from '@/blocks/NewsEventsHighlights/resolveItems'
import type { NewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewShared'
import { normalizeHighlightsItemCount } from '@/lib/newsEventsShared'

type NewsEventsHighlightsPreviewBlockProps = NewsEventsHighlightsBlockLike & {
  snapshot: NewsEventsPreviewSnapshot
}

export function NewsEventsHighlightsPreviewBlockComponent({
  snapshot,
  ...props
}: NewsEventsHighlightsPreviewBlockProps) {
  const itemCount = normalizeHighlightsItemCount(props.itemCount)
  const items = toAutomaticFeaturedHighlightItems(
    snapshot.highlightsByCount[String(itemCount)] ?? [],
  )

  return <NewsEventsHighlightsBlockPresentation {...props} items={items} />
}
