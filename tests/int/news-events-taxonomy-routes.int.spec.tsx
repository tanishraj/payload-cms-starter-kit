import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getNewsEventCategoryBySlug: vi.fn(),
  getNewsEventTagBySlug: vi.fn(),
  getNewsEventsArchivePage: vi.fn(),
  getNewsEventsInheritedRobots: vi.fn(),
  getNewsEventsSettings: vi.fn(),
  getNewsEventsTaxonomyMetadata: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))
vi.mock('@/components/news-events/NewsEventsFeed', () => ({
  NewsEventsFeed: ({ query, taxonomyContext }: { query: unknown; taxonomyContext: unknown }) => (
    <div
      data-query={JSON.stringify(query)}
      data-taxonomy-context={JSON.stringify(taxonomyContext)}
    />
  ),
}))
vi.mock('@/lib/newsEvents', () => ({
  createEmptyNewsEventsPage: () => ({
    docs: [],
    hasNextPage: false,
    hasPrevPage: false,
    page: 1,
    totalPages: 1,
  }),
  getNewsEventCategories: vi.fn().mockResolvedValue([]),
  getNewsEventCategoryBySlug: mocks.getNewsEventCategoryBySlug,
  getNewsEventTagBySlug: mocks.getNewsEventTagBySlug,
  getNewsEventTags: vi.fn().mockResolvedValue([]),
  getNewsEventsArchivePage: mocks.getNewsEventsArchivePage,
  getNewsEventsInheritedRobots: mocks.getNewsEventsInheritedRobots,
  getNewsEventsSettings: mocks.getNewsEventsSettings,
  getPastEventsPage: vi.fn(),
  getUpcomingEventsPage: vi.fn(),
}))
vi.mock('@/lib/newsEventsMetadata', () => ({
  getNewsEventsTaxonomyMetadata: mocks.getNewsEventsTaxonomyMetadata,
}))

import { NewsEventsArchivePage } from '@/components/news-events/NewsEventsArchivePage'
import CategoryPage, {
  generateMetadata as generateCategoryMetadata,
} from '@/app/(frontend)/news-events/category/[slug]/page'
import TagPage from '@/app/(frontend)/news-events/tag/[slug]/page'

const emptyPage = {
  docs: [],
  hasNextPage: false,
  hasPrevPage: false,
  page: 1,
  totalPages: 1,
}

describe('News & Events taxonomy routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getNewsEventsSettings.mockResolvedValue({ entriesPerPage: 9, title: 'News & Events' })
    mocks.getNewsEventsArchivePage.mockResolvedValue(emptyPage)
    mocks.getNewsEventsInheritedRobots.mockResolvedValue('index,follow')
  })

  it('overrides conflicting category query state with the dedicated pathname', async () => {
    const markup = renderToStaticMarkup(
      await NewsEventsArchivePage({
        fixedTaxonomy: { kind: 'category', slug: 'campus-life' },
        searchParams: Promise.resolve({ category: 'wrong', tag: 'open-day' }),
      }),
    )

    expect(markup).toContain('&quot;category&quot;:&quot;campus-life&quot;')
    expect(markup).toContain('&quot;tag&quot;:&quot;open-day&quot;')
  })

  it('renders category and tag routes for existing terms', async () => {
    mocks.getNewsEventCategoryBySlug.mockResolvedValue({ slug: 'campus-life' })
    mocks.getNewsEventTagBySlug.mockResolvedValue({ slug: 'open-day' })

    const categoryResult = (await CategoryPage({
      params: Promise.resolve({ slug: 'campus-life' }),
      searchParams: Promise.resolve({}),
    })) as ReactElement<{ fixedTaxonomy: unknown }>
    const tagResult = (await TagPage({
      params: Promise.resolve({ slug: 'open-day' }),
      searchParams: Promise.resolve({}),
    })) as ReactElement<{ fixedTaxonomy: unknown }>

    expect(categoryResult.props.fixedTaxonomy).toEqual({
      kind: 'category',
      slug: 'campus-life',
    })
    expect(tagResult.props.fixedTaxonomy).toEqual({ kind: 'tag', slug: 'open-day' })
  })

  it('returns not found for an unknown taxonomy term', async () => {
    mocks.getNewsEventCategoryBySlug.mockResolvedValue(null)

    await expect(
      CategoryPage({
        params: Promise.resolve({ slug: 'missing' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NOT_FOUND')
    expect(mocks.notFound).toHaveBeenCalledOnce()
  })

  it('generates canonical metadata from the resolved taxonomy term', async () => {
    const settings = { title: 'News & Events' }
    const term = { slug: 'campus-life', title: 'Campus Life' }
    mocks.getNewsEventCategoryBySlug.mockResolvedValue(term)
    mocks.getNewsEventsSettings.mockResolvedValue(settings)
    mocks.getNewsEventsTaxonomyMetadata.mockReturnValue({ title: 'Campus metadata' })

    await expect(
      generateCategoryMetadata({
        params: Promise.resolve({ slug: 'campus-life' }),
        searchParams: Promise.resolve({ page: '2' }),
      }),
    ).resolves.toEqual({ title: 'Campus metadata' })
    expect(mocks.getNewsEventsTaxonomyMetadata).toHaveBeenCalledWith({
      inheritedRobots: 'index,follow',
      pathname: '/news-events/category/campus-life',
      settings,
      term,
    })
  })
})
