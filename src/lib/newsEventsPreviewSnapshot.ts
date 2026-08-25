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
  getCalendarPreviewScopes,
  getNewsEventsHighlightsPreviewScopes,
  getNewsEventsTabsPreviewGroupScopes,
  getNewsGridPreviewItemCounts,
  type NewsEventsPreviewSnapshot,
} from '@/lib/newsEventsPreviewShared'
import { getDraftCalendarInitialSnapshot } from '@/lib/calendarEvents'
import type { Page, User } from '@/payload-types'

export async function loadNewsEventsPreviewSnapshot(
  layout?: Page['layout'] | null,
  user?: User,
): Promise<NewsEventsPreviewSnapshot> {
  const nowISO = new Date().toISOString()
  const payload = await getPayload({ config: configPromise })
  const highlightEntries = await Promise.all(
    getNewsEventsHighlightsPreviewScopes(layout).map(async ({ classificationIDs, key, limit }) => {
      const items = await getNewsEventsHighlights(classificationIDs, limit, nowISO).catch(() => [])

      return [key, items] as const
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
  const calendarEntries = user
    ? await Promise.all(
        getCalendarPreviewScopes(layout).map(async ({ classificationIDs, key }) => {
          const initial = await getDraftCalendarInitialSnapshot(classificationIDs, user)
          return [key, initial] as const
        }),
      )
    : []

  return {
    calendarByScope: Object.fromEntries(calendarEntries),
    classificationsByScope: Object.fromEntries(
      groupEntries.map(([key, { classifications }]) => [key, classifications]),
    ),
    groupsByScope: Object.fromEntries(groupEntries.map(([key, { groups }]) => [key, groups])),
    highlightsByScope: Object.fromEntries(highlightEntries),
    newsGridByCount: Object.fromEntries(newsGridEntries),
  }
}
