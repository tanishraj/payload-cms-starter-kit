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

  it('includes Retry-After when the request limit is exceeded', async () => {
    vi.stubEnv('VERCEL', '1')

    let response: Response | undefined
    for (let attempt = 0; attempt < 21; attempt += 1) {
      response = await GET(
        new Request('http://localhost/api/search?q=x', {
          headers: { 'x-forwarded-for': 'rate-limit-test, 192.0.2.2' },
        }),
      )
    }

    expect(response?.status).toBe(429)
    expect(response?.headers.get('Retry-After')).toMatch(/^[1-9]\d*$/)

    vi.unstubAllEnvs()
  })
})
