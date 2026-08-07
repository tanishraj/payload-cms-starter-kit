import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NewsEventsFeed } from '@/components/news-events/NewsEventsFeed'
import { NewsEventStory } from '@/components/news-events/NewsEventStory'
import {
  buildNewsEventsArchiveHref,
  getNewsEventsCategoryPath,
  getNewsEventsTagPath,
} from '@/lib/newsEventsPaths'
import type { NewsEventsArchiveQuery, PublicNewsEventDetail } from '@/lib/newsEventsShared'
import type { NewsEventsSetting } from '@/payload-types'

const baseQuery: NewsEventsArchiveQuery = {
  page: 1,
  pastPage: 1,
  type: 'all',
  upcomingPage: 1,
}

const settings = {
  allLabel: 'All',
  appearance: { background: 'none', border: 'none' },
  emptyStateTitle: 'No entries found',
  entriesPerPage: 9,
  eventsLabel: 'Events',
  id: 'news-events-settings',
  newsLabel: 'News',
  pastEventsLabel: 'Past Events',
  readMoreLabel: 'Read More',
  size: 'default',
  title: 'News & Events',
  upcomingEventsLabel: 'Upcoming Events',
} as NewsEventsSetting

const emptyPage = {
  docs: [],
  hasNextPage: false,
  hasPrevPage: false,
  page: 1,
  totalPages: 1,
}

describe('News & Events taxonomy paths', () => {
  it('builds dedicated category and tag paths', () => {
    expect(getNewsEventsCategoryPath('campus-life')).toBe('/news-events/category/campus-life')
    expect(getNewsEventsTagPath('open-day')).toBe('/news-events/tag/open-day')
    expect(buildNewsEventsArchiveHref(baseQuery, { category: 'campus-life' })).toBe(
      '/news-events/category/campus-life',
    )
    expect(buildNewsEventsArchiveHref(baseQuery, { tag: 'open-day' })).toBe(
      '/news-events/tag/open-day',
    )
  })

  it('keeps secondary filters and pagination on the active taxonomy path', () => {
    const context = { kind: 'category' as const, slug: 'campus-life' }

    expect(
      buildNewsEventsArchiveHref(
        { ...baseQuery, category: 'campus-life' },
        { page: 2 },
        context,
      ),
    ).toBe('/news-events/category/campus-life?page=2')
    expect(
      buildNewsEventsArchiveHref(
        { ...baseQuery, category: 'campus-life' },
        { tag: 'open-day' },
        context,
      ),
    ).toBe('/news-events/category/campus-life?tag=open-day')
    expect(
      buildNewsEventsArchiveHref(
        { ...baseQuery, category: 'campus-life' },
        { category: undefined },
        context,
      ),
    ).toBe('/news-events')
  })

  it('renders dedicated filter links from the archive', () => {
    const markup = renderToStaticMarkup(
      <NewsEventsFeed
        archiveData={emptyPage}
        categories={[{ id: 'campus', slug: 'campus-life', title: 'Campus Life' }]}
        query={baseQuery}
        settings={settings}
        tags={[{ id: 'open-day', slug: 'open-day', title: 'Open Day' }]}
      />,
    )

    expect(markup).toContain('href="/news-events/category/campus-life"')
    expect(markup).toContain('href="/news-events/tag/open-day"')
    expect(markup).not.toContain('?category=campus-life')
    expect(markup).not.toContain('?tag=open-day')
  })

  it('renders dedicated taxonomy links from stories', () => {
    const entry = {
      body: { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } },
      categories: [{ id: 'community', slug: 'community', title: 'Community' }],
      category: { id: 'campus', slug: 'campus-life', title: 'Campus Life' },
      contentType: 'news',
      dateISO: '2026-08-06T00:00:00.000Z',
      dateLabel: 'Aug 6, 2026',
      excerpt: 'Story excerpt',
      href: '/news-events/story',
      id: 'story',
      isPastEvent: false,
      slug: 'story',
      tags: [{ id: 'open-day', slug: 'open-day', title: 'Open Day' }],
      title: 'Story',
      updatedAt: '2026-08-06T00:00:00.000Z',
    } as PublicNewsEventDetail
    const markup = renderToStaticMarkup(<NewsEventStory entry={entry} />)

    expect(markup).toContain('href="/news-events/category/campus-life"')
    expect(markup).toContain('href="/news-events/category/community"')
    expect(markup).toContain('href="/news-events/tag/open-day"')
  })
})
