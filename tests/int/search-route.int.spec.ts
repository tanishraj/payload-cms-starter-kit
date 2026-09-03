import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return { ...actual, getPayload: mocks.getPayload }
})

import { GET } from '@/app/api/search/route'

describe('search route Review visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.getPayload.mockResolvedValue({ find: mocks.find, findByID: vi.fn() })
  })

  it('enforces anonymous Review access', async () => {
    await GET(
      new Request('http://localhost/api/search?q=example', {
        headers: { 'x-real-ip': 'public-review-route-boundary' },
      }),
    )

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        draft: false,
        overrideAccess: false,
      }),
    )
  })
})
