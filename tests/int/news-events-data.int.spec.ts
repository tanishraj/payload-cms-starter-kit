import { describe, expect, it, vi } from 'vitest'

import {
  getNewsEventClassificationLabel,
  NEWS_EVENT_CLASSIFICATION_TABS,
  normalizeNewsEventClassification,
} from '@/lib/newsEventClassifications'
import {
  fetchNewsEventGroups,
  fetchNewsEventPage,
  fetchNewsEventsHighlights,
  parseNewsEventsTabsPagination,
} from '@/lib/newsEvents'
import {
  createEmptyNewsEventGroups,
  createEmptyNewsEventPage,
  interleaveNewsEvents,
  normalizeHighlightsItemCount,
  type PublicNewsEventCard,
} from '@/lib/newsEventsShared'
import type { NewsEventClassification } from '@/lib/newsEventClassifications'

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

const record = (id: string, contentType: NewsEventClassification) => ({
  contentType,
  createdAt: '2026-08-10T00:00:00.000Z',
  eventEnd: contentType === 'event' ? '2026-08-20T12:00:00.000Z' : null,
  eventStart: contentType === 'event' ? '2026-08-20T09:00:00.000Z' : null,
  excerpt: `${id} excerpt`,
  featuredImage: null,
  featuredImagePosition: 'center' as const,
  id,
  primaryCategory: null,
  publishedAt: '2026-08-10T00:00:00.000Z',
  slug: id,
  title: `${id} title`,
  updatedAt: '2026-08-10T00:00:00.000Z',
})

describe('News & Events public data helpers', () => {
  it('defines stable public labels, tab order, and classification fallbacks', () => {
    expect(NEWS_EVENT_CLASSIFICATION_TABS.map(({ label }) => label)).toEqual([
      'All',
      'News',
      'Events',
      'Notice',
      'Holiday',
      'Achievements',
      'Announcement',
      'Others',
    ])
    expect(getNewsEventClassificationLabel('achievement')).toBe('Achievement')
    expect(getNewsEventClassificationLabel('invalid')).toBe('Other')
    expect(normalizeNewsEventClassification('event')).toBe('event')
    expect(normalizeNewsEventClassification('invalid')).toBe('other')
  })

  it('alternates News and Events and backfills without duplicates', () => {
    expect(
      interleaveNewsEvents(
        [card('news-1', 'news'), card('news-2', 'news'), card('news-3', 'news')],
        [card('event-1', 'event')],
        4,
      ).map(({ id }) => id),
    ).toEqual(['news-1', 'event-1', 'news-2', 'news-3'])
  })

  it('normalizes dynamic block item counts', () => {
    expect(normalizeHighlightsItemCount(99)).toBe(6)
    expect(normalizeHighlightsItemCount(0)).toBe(1)
    expect(normalizeHighlightsItemCount(undefined)).toBe(3)
  })

  it('validates News & Events Tabs pagination parameters', () => {
    expect(
      parseNewsEventsTabsPagination(new URLSearchParams('classification=notice&page=2&limit=6')),
    ).toEqual({ classification: 'notice', limit: 6, ok: true, page: 2 })
    expect(
      parseNewsEventsTabsPagination(new URLSearchParams('classification=all&page=1&limit=12')),
    ).toEqual({ classification: 'all', limit: 12, ok: true, page: 1 })

    for (const query of [
      'page=1&limit=6',
      'classification=invalid&page=1&limit=6',
      'classification=news&page=0&limit=6',
      'classification=news&page=1.5&limit=6',
      'classification=news&page=1&limit=5',
      'classification=news&page=1',
    ]) {
      expect(parseNewsEventsTabsPagination(new URLSearchParams(query)).ok).toBe(false)
    }
  })

  it('loads every non-event classification into automatic highlights', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })

    await fetchNewsEventsHighlights({ find } as never, {
      limit: 6,
      nowISO: '2026-08-17T00:00:00.000Z',
    })

    expect(find).toHaveBeenCalledTimes(2)
    expect(find.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        where: {
          and: expect.arrayContaining([
            {
              contentType: {
                in: ['news', 'notice', 'holiday', 'achievement', 'announcement', 'other'],
              },
            },
          ]),
        },
      }),
    )
  })

  it('returns fixed bounded groups for every classification and All', async () => {
    const entries = {
      achievement: record('achievement-1', 'achievement'),
      announcement: record('announcement-1', 'announcement'),
      event: record('event-1', 'event'),
      holiday: record('holiday-1', 'holiday'),
      news: record('news-1', 'news'),
      notice: record('notice-1', 'notice'),
      other: record('other-1', 'other'),
    }
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [entries.news] })
      .mockResolvedValueOnce({ docs: [entries.event] })
      .mockResolvedValueOnce({ docs: [entries.news] })
      .mockResolvedValueOnce({ docs: [entries.event] })
      .mockResolvedValueOnce({ docs: [entries.notice] })
      .mockResolvedValueOnce({ docs: [entries.holiday] })
      .mockResolvedValueOnce({ docs: [entries.achievement] })
      .mockResolvedValueOnce({ docs: [entries.announcement] })
      .mockResolvedValueOnce({ docs: [entries.other] })

    const groups = await fetchNewsEventGroups({ find } as never, {
      limit: 6,
      nowISO: '2026-08-17T00:00:00.000Z',
    })

    expect(Object.keys(groups)).toEqual([
      'all',
      'news',
      'event',
      'notice',
      'holiday',
      'achievement',
      'announcement',
      'other',
    ])
    expect(groups.all.docs.map(({ id }) => id)).toEqual(['news-1', 'event-1'])
    expect(groups.notice.docs.every((item) => item.contentType === 'notice')).toBe(true)
    expect(groups.event.docs.every((item) => item.contentType === 'event')).toBe(true)
    expect(Object.values(groups).every((group) => group.page === 1)).toBe(true)
    expect(find.mock.calls.filter(([query]) => query.limit === 6)).toHaveLength(7)
    expect(find.mock.calls.filter(([query]) => query.limit === 7)).toHaveLength(2)
  })

  it('loads a stable page for one classification', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [record('notice-2', 'notice')],
      hasNextPage: true,
      page: 2,
    })

    const result = await fetchNewsEventPage({ find } as never, {
      classification: 'notice',
      limit: 6,
      nowISO: '2026-08-17T00:00:00.000Z',
      page: 2,
    })

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'news-events',
        limit: 6,
        page: 2,
        sort: ['-publishedAt', '-id'],
        where: {
          and: expect.arrayContaining([
            { _status: { equals: 'published' } },
            { workflowState: { equals: 'published' } },
            { contentType: { equals: 'notice' } },
          ]),
        },
      }),
    )
    expect(result).toMatchObject({
      docs: [expect.objectContaining({ contentType: 'notice', id: 'notice-2' })],
      hasNextPage: true,
      page: 2,
    })
  })

  it('continues the deterministic mixed All order across pages', async () => {
    const news = ['news-1', 'news-2', 'news-3'].map((id) => record(id, 'news'))
    const events = ['event-1', 'event-2', 'event-3'].map((id) => record(id, 'event'))
    const find = vi.fn(async (query: { limit: number; where: unknown }) => {
      const isEventQuery = JSON.stringify(query.where).includes('"equals":"event"')
      return {
        docs: (isEventQuery ? events : news).slice(0, query.limit),
      }
    })
    const input = {
      classification: 'all' as const,
      limit: 2,
      nowISO: '2026-08-17T00:00:00.000Z',
    }

    const first = await fetchNewsEventPage({ find } as never, { ...input, page: 1 })
    const second = await fetchNewsEventPage({ find } as never, { ...input, page: 2 })
    const combined = [...first.docs, ...second.docs]

    expect(combined.map(({ id }) => id)).toEqual(['news-1', 'event-1', 'news-2', 'event-2'])
    expect(new Set(combined.map(({ id }) => id)).size).toBe(combined.length)
    expect(first.hasNextPage).toBe(true)
    expect(second.hasNextPage).toBe(true)
  })

  it('creates a stable empty group shape', () => {
    expect(createEmptyNewsEventPage()).toEqual({
      docs: [],
      hasNextPage: false,
      page: 1,
    })
    expect(createEmptyNewsEventGroups()).toEqual({
      achievement: { docs: [], hasNextPage: false, page: 1 },
      all: { docs: [], hasNextPage: false, page: 1 },
      announcement: { docs: [], hasNextPage: false, page: 1 },
      event: { docs: [], hasNextPage: false, page: 1 },
      holiday: { docs: [], hasNextPage: false, page: 1 },
      news: { docs: [], hasNextPage: false, page: 1 },
      notice: { docs: [], hasNextPage: false, page: 1 },
      other: { docs: [], hasNextPage: false, page: 1 },
    })
  })
})
