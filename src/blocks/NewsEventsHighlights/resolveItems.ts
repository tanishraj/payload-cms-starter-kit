import type { FeaturedHighlightItem } from '@/components/news-events/featuredHighlightsShared'
import { formatNewsEventDateRange, type PublicNewsEventCard } from '@/lib/newsEventsShared'

export function toAutomaticFeaturedHighlightItems(
  entries: PublicNewsEventCard[],
): FeaturedHighlightItem[] {
  return entries.map((entry) => ({
    action: {
      href: entry.href,
      label: 'Read more',
    },
    classification: entry.classification,
    dateISO: entry.dateISO,
    dateLabel:
      entry.behavior === 'event'
        ? formatNewsEventDateRange(entry.eventStart ?? entry.dateISO, entry.eventEnd)
        : entry.dateLabel,
    description: entry.excerpt?.trim() || undefined,
    id: entry.id,
    image: entry.image,
    title: entry.title,
  }))
}
