import { readFileSync } from 'node:fs'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Block, Field } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NewsEventsTabsClient } from '@/blocks/NewsEventsTabs/NewsEventsTabsClient'
import { NewsEventsTabsBlockPresentation } from '@/blocks/NewsEventsTabs/Presentation'
import { NewsEventsTabsBlock } from '@/blocks/NewsEventsTabs/config'
import {
  getNewsEventsTabsGridClasses,
  isNewsEventsTabsItemsPerTab,
  NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS,
  normalizeNewsEventsTabsCardsPerRow,
  normalizeNewsEventsTabsItemsPerTab,
  resolveNewsEventsTabs,
  resolveNewsEventsTabsLoadMoreLabel,
  validateNewsEventsTabsConfiguredTabs,
} from '@/blocks/NewsEventsTabs/newsEventsTabsShared'
import { Pages } from '@/collections/Pages'
import { ReusableSections } from '@/collections/ReusableSections'
import { getNewsEventsTabsPreviewGroupCounts } from '@/lib/newsEventsPreviewShared'
import { createEmptyNewsEventGroups, type PublicNewsEventCard } from '@/lib/newsEventsShared'

const baseCard: PublicNewsEventCard = {
  contentType: 'news',
  dateISO: '2026-08-17T00:00:00.000Z',
  dateLabel: 'Aug 17, 2026',
  excerpt: 'A current update.',
  href: '/news-events/current-update',
  id: 'current-update',
  isPastEvent: false,
  slug: 'current-update',
  title: 'Current update',
}

const groups = createEmptyNewsEventGroups()
groups.all = { docs: [baseCard], hasNextPage: false, page: 1 }
groups.holiday = {
  docs: [
    {
      ...baseCard,
      contentType: 'holiday',
      href: '/news-events/campus-holiday',
      id: 'campus-holiday',
      slug: 'campus-holiday',
      title: 'Campus holiday',
    },
  ],
  hasNextPage: false,
  page: 1,
}
groups.notice = {
  docs: [
    {
      ...baseCard,
      contentType: 'notice',
      href: '/news-events/research-notice',
      id: 'research-notice',
      slug: 'research-notice',
      title: 'Research notice',
    },
  ],
  hasNextPage: false,
  page: 1,
}

const baseClientProps = {
  cardsPerRow: '3' as const,
  emptyStateMessage: 'No entries in this classification.',
  eventActionLabel: 'View details',
  groups,
  itemsPerTab: 6 as const,
  loadMoreLabel: 'Load More',
  newsActionLabel: 'Read update',
  tabs: resolveNewsEventsTabs(null, undefined),
}

const findNamedField = (value: unknown, name: string): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.name === name) return record

    for (const child of Object.values(record)) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  return undefined
}

const collectBlocks = (fields: Field[]): Block[] =>
  fields.flatMap((field) => {
    if (field.type === 'blocks') return field.blocks
    if (field.type === 'tabs') {
      return field.tabs.flatMap((tab) => collectBlocks(tab.fields))
    }
    if ('fields' in field && Array.isArray(field.fields)) return collectBlocks(field.fields)
    return []
  })

describe('News & Events Tabs', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('defines a standalone reusable block with bounded layout controls', () => {
    expect(NewsEventsTabsBlock).toMatchObject({
      interfaceName: 'NewsEventsTabsBlock',
      slug: 'newsEventsTabs',
    })
    expect(findNamedField(NewsEventsTabsBlock.fields, 'allTabLabel')).toMatchObject({
      defaultValue: 'All',
      type: 'text',
    })
    expect(findNamedField(NewsEventsTabsBlock.fields, 'tabs')).toMatchObject({
      defaultValue: NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS,
      maxRows: 7,
      type: 'array',
    })
    expect(findNamedField(NewsEventsTabsBlock.fields, 'classification')).toMatchObject({
      options: [
        { label: 'News', value: 'news' },
        { label: 'Events', value: 'event' },
        { label: 'Notice', value: 'notice' },
        { label: 'Holiday', value: 'holiday' },
        { label: 'Achievements', value: 'achievement' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Others', value: 'other' },
      ],
      required: true,
      type: 'select',
    })
    expect(findNamedField(NewsEventsTabsBlock.fields, 'itemsPerTab')).toMatchObject({
      admin: {
        description:
          'Number of published entries shown initially and appended by each Load More request.',
      },
      defaultValue: '6',
      options: [
        { label: '3', value: '3' },
        { label: '6', value: '6' },
        { label: '9', value: '9' },
        { label: '12', value: '12' },
      ],
      required: true,
      type: 'select',
    })
    expect(findNamedField(NewsEventsTabsBlock.fields, 'loadMoreLabel')).toMatchObject({
      defaultValue: 'Load More',
      label: 'Load More Label',
      type: 'text',
    })
    expect(findNamedField(NewsEventsTabsBlock.fields, 'cardsPerRow')).toMatchObject({
      defaultValue: '3',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
      required: true,
      type: 'radio',
    })
  })

  it('normalizes stored item and column values', () => {
    expect(normalizeNewsEventsTabsItemsPerTab('3')).toBe(3)
    expect(normalizeNewsEventsTabsItemsPerTab(9)).toBe(9)
    expect(normalizeNewsEventsTabsItemsPerTab('12')).toBe(12)
    expect(normalizeNewsEventsTabsItemsPerTab('invalid')).toBe(6)
    expect(normalizeNewsEventsTabsCardsPerRow('2')).toBe('2')
    expect(normalizeNewsEventsTabsCardsPerRow('invalid')).toBe('3')
    expect(getNewsEventsTabsGridClasses('4')).toContain('xl:grid-cols-4')
    expect(resolveNewsEventsTabsLoadMoreLabel(' More updates ')).toBe('More updates')
    expect(resolveNewsEventsTabsLoadMoreLabel('   ')).toBe('Load More')
    expect(resolveNewsEventsTabsLoadMoreLabel(undefined)).toBe('Load More')
    expect(isNewsEventsTabsItemsPerTab(6)).toBe(true)
    expect(isNewsEventsTabsItemsPerTab(5)).toBe(false)
  })

  it('resolves legacy, custom, and explicitly empty tab configuration', () => {
    expect(resolveNewsEventsTabs(null, undefined)).toEqual([
      { label: 'All', value: 'all' },
      ...NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS.map(({ classification, label }) => ({
        label,
        value: classification,
      })),
    ])

    expect(
      resolveNewsEventsTabs(' Everything ', [
        { classification: 'holiday', label: ' Breaks ' },
        { classification: 'news', label: 'Latest' },
        { classification: 'holiday', label: 'Repeated' },
        { classification: 'invalid', label: 'Invalid' },
        { classification: 'notice', label: '   ' },
      ]),
    ).toEqual([
      { label: 'Everything', value: 'all' },
      { label: 'Breaks', value: 'holiday' },
      { label: 'Latest', value: 'news' },
    ])

    expect(resolveNewsEventsTabs('All updates', [])).toEqual([
      { label: 'All updates', value: 'all' },
    ])
  })

  it('rejects duplicate configured classifications', () => {
    expect(
      validateNewsEventsTabsConfiguredTabs([
        { classification: 'news', label: 'News' },
        { classification: 'news', label: 'Latest' },
      ]),
    ).toBe('Each classification can only be added once.')

    expect(
      validateNewsEventsTabsConfiguredTabs([
        { classification: 'news', label: 'News' },
        { classification: 'event', label: 'Events' },
      ]),
    ).toBe(true)
  })

  it('renders optional section content, semantic surfaces, and footer actions without images', () => {
    const html = renderToStaticMarkup(
      <NewsEventsTabsBlockPresentation
        actions={[{ label: 'View archive', linkType: 'custom', url: '/news-events' }]}
        appearance={{ background: 'subtle', border: 'topAndBottom' }}
        footerActions={[{ label: 'All updates', linkType: 'custom', url: '/updates' }]}
        groups={groups}
      />,
    )

    expect(html).toContain('data-news-events-tabs-block="true"')
    expect(html).toContain('data-news-events-tabs-header="true"')
    expect(html).not.toContain('<h2')
    expect(html).toContain('bg-subtle')
    expect(html).toContain('border-y border-border')
    expect(html).toContain('View archive')
    expect(html).toContain('All updates')
    expect(html).not.toContain('<img')
  })

  it('normalizes and renders the configured Load More label', () => {
    const pagedGroups = createEmptyNewsEventGroups()
    pagedGroups.all = { docs: [baseCard], hasNextPage: true, page: 1 }
    const customHTML = renderToStaticMarkup(
      <NewsEventsTabsBlockPresentation
        groups={pagedGroups}
        itemsPerTab="6"
        loadMoreLabel=" More updates "
      />,
    )
    const fallbackHTML = renderToStaticMarkup(
      <NewsEventsTabsBlockPresentation groups={pagedGroups} itemsPerTab="6" loadMoreLabel="   " />,
    )

    expect(customHTML).toContain('More updates')
    expect(fallbackHTML).toContain('Load More')
  })

  it('passes configured tab labels and order through the presentation layer', () => {
    const html = renderToStaticMarkup(
      <NewsEventsTabsBlockPresentation
        allTabLabel="Everything"
        groups={groups}
        tabs={[
          { classification: 'notice', label: 'Campus notices' },
          { classification: 'holiday', label: 'Closures' },
        ]}
      />,
    )

    expect(html.indexOf('Everything')).toBeLessThan(html.indexOf('Campus notices'))
    expect(html.indexOf('Campus notices')).toBeLessThan(html.indexOf('Closures'))
    expect(html).not.toContain('>News</button>')
  })

  it('renders the default tabs and filters the visible panel', () => {
    render(<NewsEventsTabsClient {...baseClientProps} />)

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'All',
      'News',
      'Events',
      'Notice',
      'Holiday',
      'Achievements',
      'Announcement',
      'Others',
    ])
    expect(screen.getByRole('tab', { name: 'All' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByRole('tab', { name: 'Holiday' }))
    expect(screen.getByRole('tabpanel').textContent).toContain('Campus holiday')
    expect(screen.getByRole('tabpanel').textContent).not.toContain('Research notice')
  })

  it('wraps configured tabs instead of requiring horizontal scrolling', () => {
    const { container } = render(<NewsEventsTabsClient {...baseClientProps} />)
    const wrapper = container.querySelector('[data-news-events-tabs-list-wrap="true"]')
    const tabList = screen.getByRole('tablist', {
      name: 'News and events classifications',
    })

    expect(wrapper?.className).not.toContain('overflow-x-auto')
    expect(tabList.className).toContain('flex-wrap')
    expect(tabList.className).not.toContain('min-w-max')
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'All',
      'News',
      'Events',
      'Notice',
      'Holiday',
      'Achievements',
      'Announcement',
      'Others',
    ])
  })

  it('uses the shared card title and description typography', () => {
    const { container } = render(<NewsEventsTabsClient {...baseClientProps} />)
    const card = container.querySelector('[data-news-events-tabs-card="true"]')
    const title = card?.querySelector('h3')
    const content = card?.querySelector('[data-slot="card-content"]')
    const description = content?.querySelector('p')
    const date = card?.querySelector('time')

    expect(title?.className).toContain('text-xl')
    expect(title?.className).toContain('font-semibold')
    expect(title?.className).toContain('line-clamp-3')
    expect(title?.className).not.toContain('text-lg')
    expect(content?.className).toContain('text-base')
    expect(content?.className).toContain('font-normal')
    expect(description?.className).toContain('line-clamp-4')
    expect(card?.querySelector('.lucide-calendar-days')).toBeTruthy()
    expect(date?.className).toContain('font-sans')
    expect(date?.className).toContain('font-normal')
    expect(date?.className).toContain('tracking-normal')
    expect(date?.className).toContain('tabular-nums')
    expect(date?.className).toContain('text-xs')
    expect(date?.className).not.toContain('font-mono')
    expect(card?.querySelector('[data-news-event-classification="news"]')).toBeTruthy()
  })

  it('renders configured labels and order while keeping All first', () => {
    render(
      <NewsEventsTabsClient
        {...baseClientProps}
        tabs={resolveNewsEventsTabs('Everything', [
          { classification: 'notice', label: 'Campus notices' },
          { classification: 'holiday', label: 'Closures' },
        ])}
      />,
    )

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Everything',
      'Campus notices',
      'Closures',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Campus notices' }))
    expect(screen.getByRole('tabpanel').textContent).toContain('Research notice')
    expect(screen.getByRole('tabpanel').textContent).not.toContain('Campus holiday')
  })

  it('supports an explicit All-only configuration', () => {
    render(
      <NewsEventsTabsClient {...baseClientProps} tabs={resolveNewsEventsTabs('All updates', [])} />,
    )

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['All updates'])
    expect(screen.getByRole('tabpanel').textContent).toContain('Current update')
  })

  it('uses configured order for keyboard navigation', () => {
    render(
      <NewsEventsTabsClient
        {...baseClientProps}
        tabs={resolveNewsEventsTabs(null, [
          { classification: 'holiday', label: 'Holiday' },
          { classification: 'notice', label: 'Notice' },
        ])}
      />,
    )

    const all = screen.getByRole('tab', { name: 'All' })
    fireEvent.keyDown(all, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Notice' }))

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Notice' }), { key: 'Home' })
    expect(document.activeElement).toBe(all)
  })

  it('supports Arrow, Home, and End keyboard navigation', () => {
    render(<NewsEventsTabsClient {...baseClientProps} />)

    const all = screen.getByRole('tab', { name: 'All' })
    fireEvent.keyDown(all, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'News' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(screen.getByRole('tab', { name: 'News' }), { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Others' }))

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Others' }), { key: 'Home' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'All' }))

    fireEvent.keyDown(screen.getByRole('tab', { name: 'All' }), { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Others' }))
  })

  it('keeps the tabs visible when a classification is empty', () => {
    render(<NewsEventsTabsClient {...baseClientProps} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Events' }))
    expect(screen.getByRole('tabpanel').textContent).toContain('No entries in this classification.')
    expect(screen.getAllByRole('tab')).toHaveLength(8)
  })

  it('loads, appends, and completes pagination for the active tab', async () => {
    const initialCards = Array.from({ length: 6 }, (_, index) => ({
      ...baseCard,
      href: `/news-events/news-${index + 1}`,
      id: `news-${index + 1}`,
      slug: `news-${index + 1}`,
      title: `News ${index + 1}`,
    }))
    const nextCards = Array.from({ length: 6 }, (_, index) => ({
      ...baseCard,
      href: `/news-events/news-${index + 7}`,
      id: `news-${index + 7}`,
      slug: `news-${index + 7}`,
      title: `News ${index + 7}`,
    }))
    const pagedGroups = createEmptyNewsEventGroups()
    pagedGroups.all = { docs: initialCards, hasNextPage: true, page: 1 }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ docs: nextCards, hasNextPage: false, page: 2 }), {
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <NewsEventsTabsClient
        {...baseClientProps}
        groups={pagedGroups}
        loadMoreLabel="More updates"
      />,
    )

    expect(document.querySelectorAll('[data-news-events-tabs-card="true"]')).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: 'More updates' }))

    await screen.findByText('News 12')
    expect(document.querySelectorAll('[data-news-events-tabs-card="true"]')).toHaveLength(12)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/news-events-tabs?classification=all&page=2&limit=6',
      { headers: { Accept: 'application/json' } },
    )
    expect(screen.queryByRole('button', { name: 'More updates' })).toBeNull()
  })

  it('shows Loading, preserves cards on failure, and retries the same page', async () => {
    const pagedGroups = createEmptyNewsEventGroups()
    pagedGroups.all = { docs: [baseCard], hasNextPage: true, page: 1 }
    let rejectFirstRequest: ((reason?: unknown) => void) | undefined
    const firstRequest = new Promise<Response>((_resolve, reject) => {
      rejectFirstRequest = reject
    })
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(firstRequest)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            docs: [{ ...baseCard, id: 'next', slug: 'next', title: 'Next update' }],
            hasNextPage: false,
            page: 2,
          }),
          { status: 200 },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<NewsEventsTabsClient {...baseClientProps} groups={pagedGroups} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))

    expect(screen.getByRole('button', { name: 'Loading…' }).hasAttribute('disabled')).toBe(true)
    rejectFirstRequest?.(new Error('network failure'))

    const retry = await screen.findByRole('button', { name: 'Retry' })
    expect(screen.getByText('Current update')).toBeTruthy()
    fireEvent.click(retry)

    await screen.findByText('Next update')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(fetchMock.mock.calls[1]?.[0])
  })

  it('de-duplicates appended entries by public ID', async () => {
    const pagedGroups = createEmptyNewsEventGroups()
    pagedGroups.all = { docs: [baseCard], hasNextPage: true, page: 1 }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            docs: [baseCard, { ...baseCard, id: 'unique', slug: 'unique', title: 'Unique update' }],
            hasNextPage: false,
            page: 2,
          }),
          { status: 200 },
        ),
      ),
    )

    render(<NewsEventsTabsClient {...baseClientProps} groups={pagedGroups} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))

    await screen.findByText('Unique update')
    expect(screen.getAllByText('Current update')).toHaveLength(1)
  })

  it('retains independent loaded progress for each tab', async () => {
    const pagedGroups = createEmptyNewsEventGroups()
    pagedGroups.news = { docs: [baseCard], hasNextPage: true, page: 1 }
    pagedGroups.event = {
      docs: [
        {
          ...baseCard,
          contentType: 'event',
          id: 'event-1',
          slug: 'event-1',
          title: 'Event 1',
        },
      ],
      hasNextPage: true,
      page: 1,
    }
    const fetchMock = vi.fn(async (url: string) => {
      const isNews = url.includes('classification=news')
      return new Response(
        JSON.stringify({
          docs: [
            {
              ...baseCard,
              contentType: isNews ? 'news' : 'event',
              id: isNews ? 'news-2' : 'event-2',
              slug: isNews ? 'news-2' : 'event-2',
              title: isNews ? 'News 2' : 'Event 2',
            },
          ],
          hasNextPage: false,
          page: 2,
        }),
        { status: 200 },
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<NewsEventsTabsClient {...baseClientProps} groups={pagedGroups} />)
    fireEvent.click(screen.getByRole('tab', { name: 'News' }))
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await screen.findByText('News 2')

    fireEvent.click(screen.getByRole('tab', { name: 'Events' }))
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await screen.findByText('Event 2')

    fireEvent.click(screen.getByRole('tab', { name: 'News' }))
    expect(screen.getByText('News 2')).toBeTruthy()
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/news-events-tabs?classification=news&page=2&limit=6',
      '/api/news-events-tabs?classification=event&page=2&limit=6',
    ])
  })

  it('does not render Load More for a terminal initial page', () => {
    render(<NewsEventsTabsClient {...baseClientProps} />)

    expect(screen.queryByRole('button', { name: 'Load More' })).toBeNull()
  })

  it.each([
    ['2', 'md:grid-cols-2'],
    ['3', 'xl:grid-cols-3'],
    ['4', 'xl:grid-cols-4'],
  ] as const)('uses the selected %s-column card grid', (cardsPerRow, expectedClass) => {
    const { container } = render(
      <NewsEventsTabsClient {...baseClientProps} cardsPerRow={cardsPerRow} />,
    )

    expect(container.querySelector('[role="tabpanel"] > .grid')?.className).toContain(expectedClass)
  })

  it('registers in both collection schemas and both renderers', () => {
    expect(collectBlocks(Pages.fields).map(({ slug }) => slug)).toContain('newsEventsTabs')
    expect(collectBlocks(ReusableSections.fields).map(({ slug }) => slug)).toContain(
      'newsEventsTabs',
    )

    expect(readFileSync('src/blocks/renderPageBlocks.tsx', 'utf8')).toContain(
      "case 'newsEventsTabs':",
    )
    expect(readFileSync('src/blocks/renderLivePreviewPageBlocks.tsx', 'utf8')).toContain(
      "case 'newsEventsTabs':",
    )
  })

  it('requests one grouped preview snapshot for every unique item count', () => {
    expect(
      getNewsEventsTabsPreviewGroupCounts([
        { blockType: 'newsEventsTabs', itemsPerTab: '9' },
        { blockType: 'newsEventsTabs', itemsPerTab: '9' },
        { blockType: 'newsEventsTabs', itemsPerTab: 'invalid' },
      ] as never),
    ).toEqual([6, 9])
  })
})
