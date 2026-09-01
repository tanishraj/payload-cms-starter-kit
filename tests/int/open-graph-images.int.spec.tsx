import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/og', () => ({
  ImageResponse: class {
    element: unknown
    options: unknown

    constructor(element: unknown, options: unknown) {
      this.element = element
      this.options = options
    }
  },
}))

import {
  createOpenGraphFallbackResponse,
  loadOpenGraphRemoteImage,
} from '@/lib/openGraphImages'
import type { OpenGraphMediaImage } from '@/lib/media'

const remoteImage: OpenGraphMediaImage = {
  height: 512,
  src: 'https://assets.snmih.tanish.im/Logo.avif',
  width: 512,
}

describe('Open Graph image loading', () => {
  it('loads a successful remote image into a renderer-safe data URL', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response('logo', {
        headers: { 'content-type': 'image/avif; charset=binary' },
      }),
    )

    await expect(loadOpenGraphRemoteImage(remoteImage, { fetcher })).resolves.toEqual({
      height: 512,
      src: 'data:image/avif;base64,bG9nbw==',
      width: 512,
    })
    expect(fetcher).toHaveBeenCalledWith(
      remoteImage.src,
      expect.objectContaining({ cache: 'force-cache', signal: expect.any(Object) }),
    )
  })

  it('omits a missing image without fetching', async () => {
    const fetcher = vi.fn()

    await expect(loadOpenGraphRemoteImage(undefined, { fetcher })).resolves.toBeUndefined()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('omits an unsuccessful response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response('unavailable', {
        headers: { 'content-type': 'text/plain' },
        status: 503,
      }),
    )

    await expect(loadOpenGraphRemoteImage(remoteImage, { fetcher })).resolves.toBeUndefined()
  })

  it('omits a non-image response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response('<html />', {
        headers: { 'content-type': 'text/html' },
      }),
    )

    await expect(loadOpenGraphRemoteImage(remoteImage, { fetcher })).resolves.toBeUndefined()
  })

  it('omits a rejected remote request', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('fetch failed'))

    await expect(loadOpenGraphRemoteImage(remoteImage, { fetcher })).resolves.toBeUndefined()
  })

  it('aborts a remote request after the configured timeout', async () => {
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
      }),
    )

    await expect(
      loadOpenGraphRemoteImage(remoteImage, { fetcher, timeoutMs: 5 }),
    ).resolves.toBeUndefined()
  })

  it('renders the local preview as a full 1200x630 fallback without text', async () => {
    const response = await createOpenGraphFallbackResponse()
    const fallback = response as unknown as { element: ReactNode; options: unknown }
    const markup = renderToStaticMarkup(fallback.element)

    expect(fallback.options).toEqual({ height: 630, width: 1200 })
    expect(markup).toContain('src="data:image/png;base64,')
    expect(markup).toContain('width="1672"')
    expect(markup).toContain('height="941"')
    expect(markup).toContain('object-fit:cover')
    expect(markup).not.toContain('SNMIH')
  })
})
