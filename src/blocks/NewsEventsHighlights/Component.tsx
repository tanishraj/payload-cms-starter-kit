import {
  NewsEventsHighlightsBlockPresentation,
  type NewsEventsHighlightsBlockLike,
} from '@/blocks/NewsEventsHighlights/Presentation'
import { getNewsEventsHighlights } from '@/lib/newsEvents'
import { normalizeHighlightsItemCount } from '@/lib/newsEventsShared'

export type { NewsEventsHighlightsBlockLike } from '@/blocks/NewsEventsHighlights/Presentation'

export async function NewsEventsHighlightsBlockComponent(props: NewsEventsHighlightsBlockLike) {
  const itemCount = normalizeHighlightsItemCount(props.itemCount)
  const nowISO = new Date().toISOString()
  const items = await getNewsEventsHighlights(itemCount, nowISO).catch(() => [])

  return <NewsEventsHighlightsBlockPresentation {...props} items={items} />
}
