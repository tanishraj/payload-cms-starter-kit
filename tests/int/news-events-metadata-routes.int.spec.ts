import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getNewsEventBySlug: vi.fn(),
  getNewsEventDetailMetadata: vi.fn(),
  getNewsEventsArchiveMetadata: vi.fn(),
  getNewsEventsInheritedRobots: vi.fn(),
  getNewsEventsSettings: vi.fn(),
}))

vi.mock('@/components/live-preview/NewsEventLivePreview', () => ({
  NewsEventLivePreview: () => null,
}))
vi.mock('@/components/news-events/NewsEventStory', () => ({
  NewsEventStory: () => null,
}))
vi.mock('@/components/news-events/NewsEventsFeed', () => ({
  NewsEventsFeed: () => null,
}))
vi.mock('@/lib/newsEvents', () => ({
  createEmptyNewsEventsPage: vi.fn(() => ({ docs: [] })),
  getNewsEventBySlug: mocks.getNewsEventBySlug,
  getNewsEventCategories: vi.fn(),
  getNewsEventPreviewBySlug: vi.fn(),
  getNewsEventTags: vi.fn(),
  getNewsEventsArchivePage: vi.fn(),
  getNewsEventsInheritedRobots: mocks.getNewsEventsInheritedRobots,
  getNewsEventsSettings: mocks.getNewsEventsSettings,
  getPastEventsPage: vi.fn(),
  getUpcomingEventsPage: vi.fn(),
}))
vi.mock('@/lib/newsEventsMetadata', () => ({
  getNewsEventDetailMetadata: mocks.getNewsEventDetailMetadata,
  getNewsEventStructuredData: vi.fn(),
  getNewsEventsArchiveMetadata: mocks.getNewsEventsArchiveMetadata,
}))

import { generateMetadata as generateArchiveMetadata } from '@/app/(frontend)/news-events/page'
import { generateMetadata as generateDetailMetadata } from '@/app/(frontend)/news-events/[slug]/page'

describe('News & Events metadata routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getNewsEventsInheritedRobots.mockResolvedValue('noindex,follow')
  })

  it('passes inherited robots to archive metadata', async () => {
    const settings = { title: 'News & Events' }
    mocks.getNewsEventsSettings.mockResolvedValue(settings)
    mocks.getNewsEventsArchiveMetadata.mockReturnValue({ title: 'Archive metadata' })

    await expect(generateArchiveMetadata()).resolves.toEqual({ title: 'Archive metadata' })
    expect(mocks.getNewsEventsArchiveMetadata).toHaveBeenCalledWith(settings, 'noindex,follow')
  })

  it('passes inherited robots to detail metadata', async () => {
    const entry = { href: '/news-events/example', title: 'Example' }
    mocks.getNewsEventBySlug.mockResolvedValue(entry)
    mocks.getNewsEventDetailMetadata.mockReturnValue({ title: 'Detail metadata' })

    await expect(
      generateDetailMetadata({
        params: Promise.resolve({ slug: 'example' }),
        searchParams: Promise.resolve({}),
      }),
    ).resolves.toEqual({ title: 'Detail metadata' })
    expect(mocks.getNewsEventDetailMetadata).toHaveBeenCalledWith(entry, 'noindex,follow')
  })
})
