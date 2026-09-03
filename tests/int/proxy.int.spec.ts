import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('redirect proxy', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('loads redirects only from the canonical application origin, never the incoming Host', async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://canonical.example.test/'
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        redirects: [{ from: '/old-page', permanent: true, to: '/new-page' }],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { proxy } = await import('@/proxy')

    const response = await proxy(new NextRequest('https://hostile.example/old-page'))

    expect(fetchMock).toHaveBeenCalledWith(
      'https://canonical.example.test/api/redirects',
      expect.objectContaining({ cache: 'no-store' }),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://canonical.example.test/new-page')
  })

  it('rejects unsupported redirect schemes and same-path loops', async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://canonical.example.test'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          redirects: [
            { from: '/unsafe', permanent: false, to: 'javascript:alert(1)' },
            { from: '/loop', permanent: true, to: '/loop?again=true' },
          ],
        }),
      ),
    )
    const { proxy } = await import('@/proxy')

    const unsafeResponse = await proxy(new NextRequest('https://hostile.example/unsafe'))
    const loopResponse = await proxy(new NextRequest('https://hostile.example/loop'))

    expect(unsafeResponse.headers.get('location')).toBeNull()
    expect(loopResponse.headers.get('location')).toBeNull()
  })

  it('retains the public-path matcher exclusions', async () => {
    const { config } = await import('@/proxy')
    expect(config.matcher).toEqual([
      '/((?!_next|api|admin|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.xml$|.*\\.json$).*)',
    ])
  })
})
