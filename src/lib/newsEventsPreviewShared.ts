import { normalizeHighlightsItemCount, type PublicNewsEventCard } from '@/lib/newsEventsShared'
import type { Page } from '@/payload-types'

export type NewsEventsPreviewSnapshot = {
  highlightsByCount: Record<string, PublicNewsEventCard[]>
}

export const EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT: NewsEventsPreviewSnapshot = {
  highlightsByCount: {},
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
