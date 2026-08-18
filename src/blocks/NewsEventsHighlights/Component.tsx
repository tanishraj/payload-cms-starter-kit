import {
  NewsEventsHighlightsBlockPresentation,
  type NewsEventsHighlightsBlockLike,
} from '@/blocks/NewsEventsHighlights/Presentation'
import { toAutomaticFeaturedHighlightItems } from '@/blocks/NewsEventsHighlights/resolveItems'
import { getNewsEventsHighlights } from '@/lib/newsEvents'
import { normalizeHighlightsItemCount } from '@/lib/newsEventsShared'

export type { NewsEventsHighlightsBlockLike } from '@/blocks/NewsEventsHighlights/Presentation'

export async function NewsEventsHighlightsBlockComponent(props: NewsEventsHighlightsBlockLike) {
  const items = toAutomaticFeaturedHighlightItems(
    await getNewsEventsHighlights(
      normalizeHighlightsItemCount(props.itemCount),
      new Date().toISOString(),
    ).catch(() => []),
  )

  return <NewsEventsHighlightsBlockPresentation {...props} items={items} />
}
