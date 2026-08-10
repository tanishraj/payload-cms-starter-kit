import { describe, expect, it } from 'vitest'

import { getMediaAbsoluteUrl } from '@/lib/media'
import type { Media } from '@/payload-types'

const mediaWithURL = (url: string): Media => ({ url }) as Media

describe('media URL resolution', () => {
  it('converts Payload root-relative media paths to absolute URLs', () => {
    expect(getMediaAbsoluteUrl(mediaWithURL('/api/media/file/social-image.png'))).toBe(
      'http://localhost:3000/api/media/file/social-image.png',
    )
  })

  it('preserves absolute media URLs', () => {
    expect(getMediaAbsoluteUrl(mediaWithURL('https://cdn.example.com/social-image.png'))).toBe(
      'https://cdn.example.com/social-image.png',
    )
  })
})
