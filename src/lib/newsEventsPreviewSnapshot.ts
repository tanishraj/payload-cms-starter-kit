import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import {
  getNewsEventGroups,
  getNewsEventsHighlights,
  getNewsGridItems,
  resolveActiveNewsEventClassifications,
} from '@/lib/newsEvents'
import {
  getNewsEventsPreviewItemCounts,
  getNewsEventsTabsPreviewGroupScopes,
  getNewsGridPreviewItemCounts,
  type NewsEventsPreviewSnapshot,
} from '@/lib/newsEventsPreviewShared'
import type { Page } from '@/payload-types'

export async function loadNewsEventsPreviewSnapshot(
  layout?: Page['layout'] | null,
): Promise<NewsEventsPreviewSnapshot> {
  const nowISO = new Date().toISOString()
  const payload = await getPayload({ config: configPromise })
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
    getNewsEventsTabsPreviewGroupScopes(layout).map(async ({ classificationIDs, key, limit }) => {
      const [groups, classifications] = await Promise.all([
        getNewsEventGroups(classificationIDs, limit, nowISO),
        resolveActiveNewsEventClassifications(payload, classificationIDs),
      ])

      return [key, { classifications, groups }] as const
    }),
  )

  return {
    classificationsByScope: Object.fromEntries(
      groupEntries.map(([key, { classifications }]) => [key, classifications]),
    ),
    groupsByScope: Object.fromEntries(groupEntries.map(([key, { groups }]) => [key, groups])),
    highlightsByCount: Object.fromEntries(highlightEntries),
    newsGridByCount: Object.fromEntries(newsGridEntries),
  }
}
