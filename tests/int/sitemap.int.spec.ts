import { beforeEach, describe, expect, it, vi } from 'vitest'

const payloadMocks = vi.hoisted(() => ({
  find: vi.fn(),
  findByID: vi.fn(),
  findGlobal: vi.fn(),
}))

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()

  return {
    ...actual,
    getPayload: vi.fn(async () => ({
      find: payloadMocks.find,
      findByID: payloadMocks.findByID,
      findGlobal: payloadMocks.findGlobal,
    })),
  }
})

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/pagePaths', () => ({
  getPageHrefFromSourceWithResolver: vi.fn(async (page: { path?: string | null }) => page.path ?? null),
  getPageID: vi.fn((value: unknown) =>
    typeof value === 'number'
      ? value
      : typeof value === 'object' && value !== null && 'id' in value
        ? (value.id as number | string | null)
        : null,
  ),
}))

const loadSitemap = async () => {
  vi.resetModules()
  return import('@/app/sitemap')
}

describe('sitemap route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    payloadMocks.findGlobal.mockImplementation(async ({ slug }) => {
      if (slug === 'page-settings') {
        return {
          homepage: 1,
        }
      }

      return {
        robots: 'index,follow',
      }
    })

    payloadMocks.find.mockImplementation(async ({ collection }: Record<string, unknown>) => {
      if (collection === 'pages') {
        return {
          docs: [
            {
              id: 1,
              includeInSitemap: 'default',
              path: '/landing',
              robotsMode: 'index',
              slug: 'landing',
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
            {
              id: 2,
              includeInSitemap: 'exclude',
              path: '/hidden',
              robotsMode: 'index',
              slug: 'hidden',
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
          ],
          totalPages: 1,
        }
      }

      if (collection === 'articles') {
        return {
          docs: [
            {
              id: 10,
              includeInSitemap: 'default',
              primaryCategory: { id: 100, slug: 'guides', title: 'Guides' },
              robotsMode: 'index',
              slug: 'launch-notes',
              tags: [{ id: 300, slug: 'featured', title: 'Featured' }],
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
            {
              id: 11,
              includeInSitemap: 'include',
              primaryCategory: { id: 101, slug: 'archive-only', title: 'Archive Only' },
              robotsMode: 'noindex',
              slug: 'should-not-appear',
              tags: [],
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
          ],
          totalPages: 1,
        }
      }

      if (collection === 'reviews') {
        return {
          docs: [
            {
              id: 20,
              includeInSitemap: 'default',
              primaryCategory: { id: 100, slug: 'guides', title: 'Guides' },
              robotsMode: 'index',
              slug: 'excellent-support',
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
          ],
          totalPages: 1,
        }
      }

      if (collection === 'categories') {
        return {
          docs: [
            {
              id: 100,
              includeInSitemap: 'default',
              robotsMode: 'index',
              slug: 'guides',
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
            {
              id: 101,
              includeInSitemap: 'exclude',
              robotsMode: 'index',
              slug: 'archive-only',
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
          ],
          totalPages: 1,
        }
      }

      if (collection === 'tags') {
        return {
          docs: [
            {
              id: 300,
              includeInSitemap: 'default',
              robotsMode: 'index',
              slug: 'featured',
              updatedAt: '2026-07-09T00:00:00.000Z',
            },
          ],
          totalPages: 1,
        }
      }

      return {
        docs: [],
        totalPages: 1,
      }
    })
  })

  it('includes public pages, entries, and taxonomy archives while excluding contradictory routes', async () => {
    const { default: sitemap } = await loadSitemap()
    const result = await sitemap()
    const urls = result.map((entry) => entry.url)

    expect(urls).toContain('http://localhost:3000/')
    expect(urls).not.toContain('http://localhost:3000/hidden')
    expect(urls).toContain('http://localhost:3000/articles/launch-notes')
    expect(urls).not.toContain('http://localhost:3000/articles/should-not-appear')
    expect(urls).toContain('http://localhost:3000/reviews/excellent-support')
    expect(urls).toContain('http://localhost:3000/articles/category/guides')
    expect(urls).toContain('http://localhost:3000/reviews/category/guides')
    expect(urls).toContain('http://localhost:3000/articles/tag/featured')
    expect(urls).not.toContain('http://localhost:3000/articles/category/archive-only')
  })
})
