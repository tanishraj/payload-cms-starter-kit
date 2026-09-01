import { describe, expect, it } from 'vitest'

import { getMediaAbsoluteUrl, getOpenGraphMediaImage } from '@/lib/media'
import type { Media } from '@/payload-types'

const mediaWithURL = (url: string): Media => ({ url }) as Media
const mediaImage = (url: string, width?: number | null, height?: number | null): Media =>
  ({ height, url, width }) as Media

describe('media URL resolution', () => {
  it('preserves Payload root-relative media paths for same-origin Next images', () => {
    expect(getMediaAbsoluteUrl(mediaWithURL('/api/media/file/social-image.png'))).toBe(
      '/api/media/file/social-image.png',
    )
  })

  it('preserves absolute media URLs', () => {
    expect(getMediaAbsoluteUrl(mediaWithURL('https://cdn.example.com/social-image.png'))).toBe(
      'https://cdn.example.com/social-image.png',
    )
  })

  it('omits root-relative media from build-time Open Graph images', () => {
    expect(
      getOpenGraphMediaImage(mediaImage('/api/media/file/social-image.png', 1200, 630)),
    ).toBeUndefined()
  })

  it('returns absolute Open Graph media with positive intrinsic dimensions', () => {
    expect(
      getOpenGraphMediaImage(mediaImage('https://cdn.example.com/social-image.avif', 1200, 630)),
    ).toEqual({
      height: 630,
      src: 'https://cdn.example.com/social-image.avif',
      width: 1200,
    })
  })

  it.each([
    ['missing width', undefined, 630],
    ['missing height', 1200, undefined],
    ['zero width', 0, 630],
    ['zero height', 1200, 0],
    ['negative width', -1, 630],
    ['negative height', 1200, -1],
  ])('omits Open Graph media with %s', (_label, width, height) => {
    expect(
      getOpenGraphMediaImage(
        mediaImage('https://cdn.example.com/social-image.avif', width, height),
      ),
    ).toBeUndefined()
  })
})
