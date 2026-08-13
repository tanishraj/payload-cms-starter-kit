import { getNewsGridCollectionItemCount } from '@/blocks/NewsGrid/newsGridShared'
import { normalizeHighlightsItemCount, type PublicNewsEventCard } from '@/lib/newsEventsShared'
import type { Page } from '@/payload-types'

export type NewsEventsPreviewSnapshot = {
  highlightsByCount: Record<string, PublicNewsEventCard[]>
  newsGridByCount: Record<string, PublicNewsEventCard[]>
}

export const EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT: NewsEventsPreviewSnapshot = {
  highlightsByCount: {},
  newsGridByCount: {},
}

export function getNewsEventsPreviewItemCounts(layout?: Page['layout'] | null): number[] {
  const counts = new Set<number>()

  for (const block of layout ?? []) {
    if (block.blockType === 'newsEventsHighlights') {
      counts.add(normalizeHighlightsItemCount(block.itemCount))
    }
  }

  return [...counts].sort((left, right) => left - right)
}

export function getNewsGridPreviewItemCounts(layout?: Page['layout'] | null): number[] {
  const counts = new Set<number>()

  for (const block of layout ?? []) {
    if (block.blockType === 'newsGrid') {
      const itemCount = getNewsGridCollectionItemCount(block.totalCards, block.featureCard)
      // A feature-only grid needs no collection snapshot.
      if (itemCount > 0) counts.add(itemCount)
    }
  }

  return [...counts].sort((left, right) => left - right)
}
