import { getNewsGridCollectionItemCount } from '@/blocks/NewsGrid/newsGridShared'
import {
  getNewsEventsTabsClassificationRelationshipIDs,
  normalizeNewsEventsTabsItemsPerTab,
} from '@/blocks/NewsEventsTabs/newsEventsTabsShared'
import type { ResolvedNewsEventClassification } from '@/lib/newsEventClassifications'
import {
  normalizeHighlightsItemCount,
  type PublicNewsEventCard,
  type PublicNewsEventGroups,
} from '@/lib/newsEventsShared'
import type { Page } from '@/payload-types'

export type NewsEventsPreviewSnapshot = {
  classificationsByScope: Record<string, ResolvedNewsEventClassification[]>
  groupsByScope: Record<string, PublicNewsEventGroups>
  highlightsByCount: Record<string, PublicNewsEventCard[]>
  newsGridByCount: Record<string, PublicNewsEventCard[]>
}

export const EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT: NewsEventsPreviewSnapshot = {
  classificationsByScope: {},
  groupsByScope: {},
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

export type NewsEventsTabsPreviewScope = {
  classificationIDs: string[]
  key: string
  limit: number
}

const MAX_NEWS_EVENTS_PREVIEW_DEPTH = 10

export const getNewsEventsTabsPreviewGroupKey = (
  classificationIDs: readonly string[],
  limit: number,
): string => JSON.stringify([limit, ...classificationIDs])

export function getNewsEventsTabsPreviewClassificationIDs(block: unknown): string[] {
  if (!block || typeof block !== 'object') return []

  const record = block as Record<string, unknown>

  return getNewsEventsTabsClassificationRelationshipIDs(record.classifications)
}

export function getNewsEventsTabsPreviewGroupScopes(
  layout?: Page['layout'] | null,
): NewsEventsTabsPreviewScope[] {
  const scopes = new Map<string, NewsEventsTabsPreviewScope>()
  const visitedLayouts = new WeakSet<object>()

  const visitLayout = (value: unknown, depth: number): void => {
    if (
      !Array.isArray(value) ||
      depth > MAX_NEWS_EVENTS_PREVIEW_DEPTH ||
      visitedLayouts.has(value)
    ) {
      return
    }

    visitedLayouts.add(value)

    for (const block of value) {
      if (!block || typeof block !== 'object' || !('blockType' in block)) continue

      const record = block as Record<string, unknown>

      if (record.blockType === 'newsEventsTabs') {
        const classificationIDs = getNewsEventsTabsPreviewClassificationIDs(record)

        const limit = normalizeNewsEventsTabsItemsPerTab(record.itemsPerTab as string | number)
        const key = getNewsEventsTabsPreviewGroupKey(classificationIDs, limit)

        scopes.set(key, { classificationIDs, key, limit })
      }

      if (
        record.blockType === 'reusableSection' &&
        record.section &&
        typeof record.section === 'object' &&
        'layout' in record.section
      ) {
        visitLayout((record.section as { layout?: unknown }).layout, depth + 1)
      }
    }
  }

  visitLayout(layout, 0)
  return [...scopes.values()]
}

/** @deprecated Use getNewsEventsTabsPreviewGroupScopes so equal counts cannot collide. */
export function getNewsEventsTabsPreviewGroupCounts(layout?: Page['layout'] | null): number[] {
  return [...new Set(getNewsEventsTabsPreviewGroupScopes(layout).map(({ limit }) => limit))].sort(
    (left, right) => left - right,
  )
}
