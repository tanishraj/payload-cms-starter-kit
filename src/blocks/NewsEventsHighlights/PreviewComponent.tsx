import {
  NewsEventsHighlightsBlockPresentation,
  type NewsEventsHighlightsBlockLike,
} from '@/blocks/NewsEventsHighlights/Presentation'
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

  return (
    <NewsEventsHighlightsBlockPresentation
      {...props}
      items={snapshot.highlightsByCount[String(itemCount)] ?? []}
    />
  )
}
