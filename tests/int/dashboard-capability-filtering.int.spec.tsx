import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  count: vi.fn(),
  find: vi.fn(),
  getPayload: vi.fn(),
  headers: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('payload', () => ({ getPayload: mocks.getPayload }))

import { DashboardOverview } from '@/components/admin/DashboardOverview'

const articleManager = {
  capabilities: { manage_articles: true },
  id: 'article-manager',
  role: 'contentManager',
}

describe('dashboard capability filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.headers.mockResolvedValue(new Headers())
    mocks.getPayload.mockResolvedValue({
      auth: mocks.auth,
      count: mocks.count,
      find: mocks.find,
    })
    mocks.count.mockResolvedValue({ totalDocs: 2 })
    mocks.find.mockResolvedValue({ docs: [] })
  })

  it('runs no collection queries for an unauthenticated request', async () => {
    mocks.auth.mockResolvedValue({ user: null })

    expect(renderToStaticMarkup(await DashboardOverview())).toBe('')
    expect(mocks.count).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })

  it('does not fall back to privileged queries when authentication fails', async () => {
    mocks.auth.mockRejectedValue(new Error('authentication unavailable'))

    expect(renderToStaticMarkup(await DashboardOverview())).toBe('')
    expect(mocks.count).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })

  it('runs only authorized queries with access enforcement', async () => {
    mocks.auth.mockResolvedValue({ user: articleManager })

    await DashboardOverview()

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
    mocks.auth.mockResolvedValue({ user: articleManager })
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

    const html = renderToStaticMarkup(await DashboardOverview())

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

  it('preserves all quick actions for an administrator', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'admin', role: 'admin' } })

    const html = renderToStaticMarkup(await DashboardOverview())

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

  it('isolates an authorized query failure', async () => {
    mocks.auth.mockResolvedValue({ user: articleManager })
    mocks.count.mockRejectedValue(new Error('count unavailable'))
    mocks.find.mockRejectedValue(new Error('recent data unavailable'))

    const html = renderToStaticMarkup(await DashboardOverview())

    expect(html).toContain('Articles')
    expect(html).toContain('+ New Article')
    expect(html).not.toContain('Recent Submissions')
  })
})
