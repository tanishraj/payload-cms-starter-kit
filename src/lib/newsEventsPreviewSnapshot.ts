import 'server-only'

import { getNewsEventGroups, getNewsEventsHighlights, getNewsGridItems } from '@/lib/newsEvents'
import {
  getNewsEventsPreviewItemCounts,
  getNewsEventsTabsPreviewGroupCounts,
  getNewsGridPreviewItemCounts,
  type NewsEventsPreviewSnapshot,
} from '@/lib/newsEventsPreviewShared'
import type { Page } from '@/payload-types'

export async function loadNewsEventsPreviewSnapshot(
  layout?: Page['layout'] | null,
): Promise<NewsEventsPreviewSnapshot> {
  const nowISO = new Date().toISOString()
  const highlightEntries = await Promise.all(
    getNewsEventsPreviewItemCounts(layout).map(async (count) => {
      const items = await getNewsEventsHighlights(count, nowISO).catch(() => [])

      return [String(count), items] as const
    }),
  )
  const newsGridEntries = await Promise.all(
    getNewsGridPreviewItemCounts(layout).map(async (count) => {
      const items = await getNewsGridItems(count, nowISO).catch(() => [])

      return [String(count), items] as const
    }),
  )
  const groupEntries = await Promise.all(
    getNewsEventsTabsPreviewGroupCounts(layout).map(async (count) => {
      const groups = await getNewsEventGroups(count, nowISO)

      return [String(count), groups] as const
    }),
  )

  return {
    groupsByCount: Object.fromEntries(groupEntries),
    highlightsByCount: Object.fromEntries(highlightEntries),
    newsGridByCount: Object.fromEntries(newsGridEntries),
  }
}
