import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  find: vi.fn(),
}))

vi.mock('@payloadcms/ui', () => ({ useConfig: () => ({ config: { routes: { api: '/api' } } }) }))

import { DashboardOverview } from '@/components/admin/DashboardOverview'

const articleManager = {
  features: { articles: true },
  id: 'article-manager',
  role: 'siteManager',
}

const reviewManager = {
  features: {
    reviews: true,
  },
  id: 'review-manager',
  role: 'siteManager',
}

const renderDashboard = async (user: unknown) =>
  renderToStaticMarkup(
    await DashboardOverview({
      payload: { count: mocks.count, find: mocks.find } as never,
      user: user as never,
    }),
  )

describe('dashboard capability filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.count.mockResolvedValue({ totalDocs: 2 })
    mocks.find.mockResolvedValue({ docs: [] })
  })

  it('runs no collection queries for an unauthenticated request', async () => {
    expect(await renderDashboard(null)).toBe('')
    expect(mocks.count).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })

  it('runs only authorized queries with access enforcement', async () => {
    await renderDashboard(articleManager)

    const calls = [...mocks.count.mock.calls, ...mocks.find.mock.calls]
    expect(calls.length).toBeGreaterThan(0)
    for (const [options] of calls) {
      if (options.collection === 'payload-preferences') {
        expect(options).toMatchObject({ overrideAccess: false, user: articleManager })
        continue
      }
      expect(options).toEqual(
        expect.objectContaining({
          collection: 'articles',
          overrideAccess: false,
          user: articleManager,
        }),
      )
    }

    for (const collection of [
      'pages',
      'news-events',
      'reviews',
      'form-submissions',
      'work-queue',
    ]) {
      expect(mocks.count).not.toHaveBeenCalledWith(expect.objectContaining({ collection }))
      expect(mocks.find).not.toHaveBeenCalledWith(expect.objectContaining({ collection }))
    }
  })

  it('renders only an article manager’s authorized areas', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          _status: 'draft',
          id: 'article-1',
          title: 'Authorized article',
          updatedAt: '2026-08-05T10:00:00.000Z',
        },
      ],
    })

    const html = await renderDashboard(articleManager)

    expect(html).toContain('Articles')
    expect(html).toContain('+ New Article')
    expect(html).toContain('Authorized article')
    expect(html).not.toContain('Review site settings')
    expect(html).not.toContain('+ New Page')
    expect(html).not.toContain('+ New News / Event')
    expect(html).not.toContain('+ Upload Media')
    expect(html).not.toContain('Open Submissions')
    expect(html).not.toContain('Action Queue')
    expect(html).not.toContain('Recent Submissions')
  })

  it('gives a zero-grant Site Manager a non-leaking empty state', async () => {
    const html = await renderDashboard({ features: {}, id: 'new-manager', role: 'siteManager' })

    expect(html).toContain('No features assigned yet')
    expect(html).not.toContain('Content Overview')
    expect(html).not.toContain('Needs Attention')
    expect(mocks.count).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })

  it('recognizes grants that do not have dashboard metrics', async () => {
    const html = await renderDashboard({
      features: { appearance: true },
      id: 'appearance-manager',
      role: 'siteManager',
    })

    expect(html).not.toContain('No features assigned yet')
    expect(html).toContain('1 feature assigned')
    expect(html).toContain('Appearance')
    expect(html).toContain('/admin/globals/theme-settings')
    expect(mocks.count).not.toHaveBeenCalled()
    expect(mocks.find.mock.calls.every(([args]) => args.collection === 'payload-preferences')).toBe(
      true,
    )
  })

  it('preserves all quick actions for an administrator', async () => {
    const html = await renderDashboard({ id: 'admin', role: 'admin' })

    for (const label of [
      '+ New Page',
      '+ New Article',
      '+ New News / Event',
      '+ New Reusable Section',
      '+ Upload Media',
      'Review site settings',
    ]) {
      expect(html).toContain(label)
    }
  })

  it('shows only pending public reviews as moderation work', async () => {
    mocks.count.mockResolvedValue({ totalDocs: 3 })

    const html = await renderDashboard(reviewManager)

    expect(mocks.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        overrideAccess: false,
        user: reviewManager,
        where: {
          and: [
            { sourceSubmission: { exists: true } },
            { moderationStatus: { equals: 'pending' } },
          ],
        },
      }),
    )
    expect(html).toContain('Reviews awaiting moderation')
    expect(html).toContain('moderationStatus')
    expect(html).not.toContain('In Review')
    expect(html).not.toContain('Scheduled')
  })

  it('keeps an authorized dashboard usable when moderation counts fail', async () => {
    mocks.count.mockRejectedValue(new Error('review count unavailable'))

    const html = await renderDashboard(reviewManager)

    expect(html).toContain('Reviews awaiting moderation')
    expect(html).toContain('Count unavailable')
  })

  it('isolates an authorized query failure', async () => {
    mocks.count.mockRejectedValue(new Error('count unavailable'))
    mocks.find.mockRejectedValue(new Error('recent data unavailable'))

    const html = await renderDashboard(articleManager)

    expect(html).toContain('Articles')
    expect(html).toContain('Count unavailable')
    expect(html).toContain('+ New Article')
    expect(html).not.toContain('Recent Submissions')
  })

  it('includes authorized Reviews in Recently Edited', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          _status: 'draft',
          id: 'review-1',
          title: 'A recent review',
          updatedAt: '2026-09-07T10:00:00.000Z',
        },
      ],
    })

    const html = await renderDashboard(reviewManager)

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        overrideAccess: false,
        user: reviewManager,
      }),
    )
    expect(html).toContain('A recent review')
    expect(html).toContain('/admin/collections/reviews/review-1')
  })
  it('offers recovery instead of Page creation for a feature grant without sections', async () => {
    const html = await renderDashboard({
      id: 'no-section',
      role: 'siteManager',
      features: { pages: true },
    })
    expect(html).toContain('No website sections assigned')
    expect(html).toContain('Check access again')
    expect(html).not.toContain('+ New Page')
    expect(html).not.toContain('Content Overview')
    expect(mocks.find).not.toHaveBeenCalled()
    expect(mocks.count).not.toHaveBeenCalled()
  })
  it('does not surface stale roots or dead creation links after they stop being root Pages', async () => {
    const html = await renderDashboard({
      id: 'stale-section',
      role: 'siteManager',
      features: { pages: true },
      sectionRoots: ['moved-root'],
    })
    expect(html).toContain('No website sections assigned')
    expect(html).not.toContain('+ New Page')
    expect(mocks.find).toHaveBeenCalledTimes(1)
    expect(mocks.count).not.toHaveBeenCalled()
  })
  it('keeps a failed scope query honest and hides source details', async () => {
    mocks.find.mockRejectedValue(new Error('private database credential'))
    const html = await renderDashboard({
      id: 'failed-section',
      role: 'siteManager',
      features: { pages: true },
      sectionRoots: ['root-a'],
    })
    expect(html).toContain('Website sections unavailable')
    expect(html).not.toContain('private database credential')
    expect(html).not.toContain('+ New Page')
  })
  it('loads latest saved draft state for recent work instead of its older publication', async () => {
    await renderDashboard(articleManager)
    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'articles',
        user: articleManager,
        overrideAccess: false,
        draft: true,
        limit: 5,
      }),
    )
  })
})
