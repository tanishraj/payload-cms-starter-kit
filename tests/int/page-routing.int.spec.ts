import { beforeEach, describe, expect, it, vi } from 'vitest'

const payloadMocks = vi.hoisted(() => {
  return {
    auth: vi.fn(),
    find: vi.fn(),
    findGlobal: vi.fn(),
  }
})

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    auth: payloadMocks.auth,
    find: payloadMocks.find,
    findGlobal: payloadMocks.findGlobal,
  })),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({})),
}))

const loadPageData = async () => {
  vi.resetModules()
  return import('@/app/(frontend)/pageData')
}

describe('page routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the configured homepage path for a published homepage', async () => {
    payloadMocks.findGlobal.mockResolvedValue({
      homepage: 42,
    })
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          id: 42,
          parent: {
            id: 7,
            parent: null,
            slug: 'parent',
          },
          slug: 'home',
        },
      ],
    })

    const { getHomepagePath } = await loadPageData()

    await expect(getHomepagePath()).resolves.toBe('/parent/home')
  })

  it('returns null when no homepage is configured', async () => {
    payloadMocks.findGlobal.mockResolvedValue({
      homepage: null,
    })

    const { getHomepagePath } = await loadPageData()

    await expect(getHomepagePath()).resolves.toBeNull()
  })

  it('returns an object-shaped render state for starter system modes', async () => {
    payloadMocks.findGlobal.mockResolvedValue({
      bypassForLoggedInAdmins: false,
      comingSoonPage: null,
      maintenancePage: null,
      notFoundPage: null,
      siteMode: 'off',
    })

    const { getSystemPageRenderState } = await loadPageData()
    const result = await getSystemPageRenderState('/anything')

    expect(typeof result).toBe('object')
    expect([null, 'maintenance', 'comingSoon']).toContain(result.mode)
    expect(result.page).toBeNull()
  })
})
