import { describe, expect, it } from 'vitest'

import { validateUploadedMedia } from '@/domains/media/uploadPolicy'

const fixtures = {
  avif: Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66, 0x00, 0x00, 0x00, 0x00,
    0x61, 0x76, 0x69, 0x66, 0x6d, 0x69, 0x66, 0x31,
  ]),
  gif: Buffer.from('GIF89a', 'ascii'),
  html: Buffer.from('<!doctype html><script>alert("fixture-bytes")</script>', 'utf8'),
  jpeg: Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00]),
  pdf: Buffer.from('%PDF-1.7\n', 'ascii'),
  png: Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  ]),
  svg: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf8'),
  webp: Buffer.from([0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
} as const

const file = (name: string, mimetype: string, data: Buffer) => ({
  data,
  mimetype,
  name,
  size: data.length,
})

describe('media upload policy', () => {
  it.each([
    ['PNG', 'image.png', 'image/png', fixtures.png],
    ['JPEG .jpg', 'image.jpg', 'image/jpeg', fixtures.jpeg],
    ['JPEG .jpeg', 'image.jpeg', 'image/jpeg', fixtures.jpeg],
    ['WebP', 'image.webp', 'image/webp', fixtures.webp],
    ['AVIF', 'image.avif', 'image/avif', fixtures.avif],
    ['GIF', 'image.gif', 'image/gif', fixtures.gif],
    ['PDF', 'document.pdf', 'application/pdf', fixtures.pdf],
  ])('accepts a %s when extension, MIME, and signature agree', async (_label, name, mime, data) => {
    await expect(validateUploadedMedia(file(name, mime, data))).resolves.toBeUndefined()
  })

  it.each([
    [
      'HTML renamed as PNG',
      'attack.png',
      'image/png',
      fixtures.html,
      'The uploaded media content does not match its filename and declared MIME type.',
    ],
    [
      'mismatched extension and MIME',
      'image.jpg',
      'image/png',
      fixtures.jpeg,
      'The uploaded media filename extension does not match its declared MIME type.',
    ],
    [
      'mismatched detected signature',
      'image.png',
      'image/png',
      fixtures.jpeg,
      'The uploaded media content does not match its filename and declared MIME type.',
    ],
    ['empty file', 'empty.png', 'image/png', Buffer.alloc(0), 'Empty media files are not allowed.'],
    [
      'unsupported SVG',
      'vector.svg',
      'image/svg+xml',
      fixtures.svg,
      'The uploaded media filename has an unsupported extension.',
    ],
  ])(
    'rejects %s without exposing file bytes',
    async (_label, name, mime, data, expectedMessage) => {
      const validation = validateUploadedMedia(file(name, mime, data))

      await expect(validation).rejects.toMatchObject({ message: expectedMessage, status: 400 })
      await expect(validation).rejects.not.toThrow('fixture-bytes')
    },
  )

  it('rejects a missing runtime buffer', async () => {
    const upload = file('image.png', 'image/png', fixtures.png)

    await expect(
      validateUploadedMedia({ ...upload, data: undefined as unknown as Buffer }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
