import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  find: vi.fn(),
}))

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
    expect(mocks.find).not.toHaveBeenCalled()
  })

  it('preserves all quick actions for an administrator', async () => {
    const html = await renderDashboard({ id: 'admin', role: 'admin' })

    for (const label of [
      '+ New Page',
      '+ New Article',
      '+ New News / Event',
      '+ New Reusable Section',
      '+ Upload Media',
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
})
