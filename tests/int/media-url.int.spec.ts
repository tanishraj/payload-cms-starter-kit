import { describe, expect, it } from 'vitest'

import { getMediaAbsoluteUrl, getOpenGraphMediaUrl } from '@/lib/media'
import type { Media } from '@/payload-types'

const mediaWithURL = (url: string): Media => ({ url }) as Media

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
    expect(getOpenGraphMediaUrl(mediaWithURL('/api/media/file/social-image.png'))).toBeUndefined()
  })

  it('keeps externally hosted media in Open Graph images', () => {
    expect(getOpenGraphMediaUrl(mediaWithURL('https://cdn.example.com/social-image.png'))).toBe(
      'https://cdn.example.com/social-image.png',
    )
  })
})
