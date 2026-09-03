import { describe, expect, it } from 'vitest'

import { Media } from '@/collections/Media'
import { ALLOWED_MEDIA_MIME_TYPES } from '@/config/uploadLimits'

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
])

const upload = (data: Buffer = png) => ({
  data,
  mimetype: 'image/png',
  name: 'example.png',
  size: data.length,
})

describe('media collection upload validation', () => {
  it('publishes the explicit collection MIME allowlist', () => {
    expect(ALLOWED_MEDIA_MIME_TYPES).toEqual([
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ])
    expect(Media.upload).toMatchObject({ mimeTypes: ALLOWED_MEDIA_MIME_TYPES })
  })

  it('validates uploaded bytes before preserving existing media field validation', async () => {
    const beforeValidate = Media.hooks?.beforeValidate?.[0]
    if (!beforeValidate) throw new Error('Expected Media beforeValidate hook.')

    await expect(
      beforeValidate({
        data: { alt: '', assetType: 'general', mimeType: 'image/png' },
        operation: 'create',
        originalDoc: undefined,
        req: { file: upload() },
      } as never),
    ).rejects.toThrow('Image assets require alt text.')

    await expect(
      beforeValidate({
        data: { alt: 'Example', assetType: 'general', mimeType: 'image/png' },
        operation: 'create',
        originalDoc: undefined,
        req: { file: upload(Buffer.from('<html>fixture-bytes</html>')) },
      } as never),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('requires a file on create but skips binary revalidation for metadata-only updates', async () => {
    const beforeValidate = Media.hooks?.beforeValidate?.[0]
    if (!beforeValidate) throw new Error('Expected Media beforeValidate hook.')

    await expect(
      beforeValidate({
        data: { alt: 'Example', assetType: 'general', mimeType: 'image/png' },
        operation: 'create',
        originalDoc: undefined,
        req: {},
      } as never),
    ).rejects.toMatchObject({ status: 400 })

    await expect(
      beforeValidate({
        data: { alt: 'Updated alt' },
        operation: 'update',
        originalDoc: { alt: 'Original alt', assetType: 'general', mimeType: 'image/png' },
        req: {},
      } as never),
    ).resolves.toEqual({ alt: 'Updated alt' })
  })
})
