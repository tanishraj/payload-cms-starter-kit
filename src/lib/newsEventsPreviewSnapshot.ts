import 'server-only'

import { getNewsEventsHighlights } from '@/lib/newsEvents'
import {
  getNewsEventsPreviewItemCounts,
  type NewsEventsPreviewSnapshot,
} from '@/lib/newsEventsPreviewShared'
import type { Page } from '@/payload-types'

export async function loadNewsEventsPreviewSnapshot(
  layout?: Page['layout'] | null,
): Promise<NewsEventsPreviewSnapshot> {
  const nowISO = new Date().toISOString()
  const entries = await Promise.all(
    getNewsEventsPreviewItemCounts(layout).map(async (count) => {
      const items = await getNewsEventsHighlights(count, nowISO).catch(() => [])

      return [String(count), items] as const
    }),
  )

  return { highlightsByCount: Object.fromEntries(entries) }
}
