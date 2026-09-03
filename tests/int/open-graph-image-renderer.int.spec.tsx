// @vitest-environment node

import { readFileSync } from 'node:fs'

import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createOpenGraphFallbackResponse: vi.fn(),
  find: vi.fn(),
  findGlobal: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()

  return {
    ...actual,
    getPayload: mocks.getPayload,
  }
})
vi.mock('@/lib/openGraphImages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/openGraphImages')>()

  return {
    ...actual,
    createOpenGraphFallbackResponse: mocks.createOpenGraphFallbackResponse,
  }
})

import ReviewOgImage from '@/app/(frontend)/reviews/[slug]/opengraph-image'
import { loadOpenGraphRemoteImage } from '@/lib/openGraphImages'
import type { OpenGraphMediaImage } from '@/lib/media'

const source = readFileSync('src/app/(frontend)/reviews/[slug]/opengraph-image.tsx', 'utf8')

const remoteImage: OpenGraphMediaImage = {
  height: 8,
  src: 'https://assets.snmih.tanish.im/Logo.avif',
  width: 8,
}

describe('Open Graph image renderer compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.findGlobal.mockResolvedValue({ siteName: 'SNMIH' })
    mocks.getPayload.mockResolvedValue({
      find: mocks.find,
      findGlobal: mocks.findGlobal,
    })
    mocks.createOpenGraphFallbackResponse.mockReturnValue(new Response('fallback'))
  })

  it('routes Review reads through anonymous collection access', () => {
    expect(source).toContain('@/domains/reviews/publicReviewQueries')
    expect(source).not.toMatch(/collection:\s*['"]reviews['"]/)
  })

  it('enforces anonymous Review access when rendering the Review route image', async () => {
    const fallback = await ReviewOgImage({
      params: Promise.resolve({ slug: 'pending-submission' }),
    })

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        draft: false,
        overrideAccess: false,
        where: { slug: { equals: 'pending-submission' } },
      }),
    )
    expect(fallback).toBe(mocks.createOpenGraphFallbackResponse.mock.results[0]?.value)
  })

  it('renders a fetched AVIF logo through the real ImageResponse renderer', async () => {
    const avif = await sharp({
      create: {
        background: { alpha: 1, b: 86, g: 52, r: 24 },
        channels: 4,
        height: 8,
        width: 8,
      },
    })
      .avif()
      .toBuffer()
    const fetcher = vi.fn().mockResolvedValue(
      new Response(avif, {
        headers: { 'content-type': 'image/avif' },
      }),
    )
    const image = await loadOpenGraphRemoteImage(remoteImage, { fetcher })

    expect(image).toBeDefined()

    const response = new ImageResponse(
      // eslint-disable-next-line @next/next/no-img-element -- this exercises next/og's native renderer.
      <img alt="" src={image?.src} width={8} height={8} />,
      { height: 8, width: 8 },
    )
    const output = new Uint8Array(await response.arrayBuffer())

    expect(Array.from(output.slice(0, 4))).toEqual([137, 80, 78, 71])
  })
})
