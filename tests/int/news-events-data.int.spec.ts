import { describe, expect, it } from 'vitest'

import {
  interleaveNewsEvents,
  normalizeHighlightsItemCount,
  parseNewsEventsSearchParams,
  type PublicNewsEventCard,
} from '@/lib/newsEventsShared'

const card = (id: string, contentType: 'event' | 'news'): PublicNewsEventCard => ({
  contentType,
  dateISO: '2026-07-20T00:00:00.000Z',
  dateLabel: 'Jul 20, 2026',
  excerpt: `${id} excerpt`,
  href: `/news-events/${id}`,
  id,
  isPastEvent: false,
  slug: id,
  title: id,
})

describe('News & Events public data helpers', () => {
  it('alternates News and Events and backfills without duplicates', () => {
    expect(
      interleaveNewsEvents(
        [card('news-1', 'news'), card('news-2', 'news'), card('news-3', 'news')],
        [card('event-1', 'event')],
        4,
      ).map(({ id }) => id),
    ).toEqual(['news-1', 'event-1', 'news-2', 'news-3'])
  })

  it('normalizes block count and sanitizes archive search params', () => {
    expect(normalizeHighlightsItemCount(99)).toBe(6)
    expect(normalizeHighlightsItemCount(0)).toBe(1)
    expect(parseNewsEventsSearchParams({ category: '../bad', page: '-2', type: 'other' })).toEqual({
      category: undefined,
      page: 1,
      pastPage: 1,
      type: 'all',
      upcomingPage: 1,
    })
    expect(
      parseNewsEventsSearchParams({ category: 'campus-life', page: '3', type: 'event' }),
    ).toMatchObject({
      category: 'campus-life',
      page: 3,
      type: 'event',
    })
  })
})
