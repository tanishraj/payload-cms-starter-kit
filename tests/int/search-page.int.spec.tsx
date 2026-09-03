import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return { ...actual, getPayload: mocks.getPayload }
})

import SearchPage from '@/app/(frontend)/search/page'

describe('search page Review visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.findGlobal.mockResolvedValue({ suggestedSearches: [] })
    mocks.getPayload.mockResolvedValue({
      find: mocks.find,
      findByID: vi.fn(),
      findGlobal: mocks.findGlobal,
    })
  })

  it('enforces anonymous Review access', async () => {
    renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: 'example' }) }))

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        draft: false,
        overrideAccess: false,
      }),
    )
  })
})
