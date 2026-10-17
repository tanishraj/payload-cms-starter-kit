// @vitest-environment node

import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig, getPayload, type CollectionConfig, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { Media } from '@/collections/Media'
import { ALLOWED_MEDIA_MIME_TYPES } from '@/config/uploadLimits'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
])

const upload = (data: Buffer = png) => ({
  data,
  mimetype: 'image/png',
  name: 'example.png',
  size: data.length,
})

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
const onePixelJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPxB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPxB//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxB//9k=',
  'base64',
)

let lifecyclePayload: Payload
let lifecycleMediaDir: string
let stopMongoServer: (() => Promise<void>) | null = null

beforeAll(async () => {
  const mongoServer = await createTestMongoServer()
  lifecycleMediaDir = await mkdtemp(path.join(tmpdir(), 'payload-media-policy-'))
  stopMongoServer = mongoServer.stop

  const lifecycleMedia: CollectionConfig = {
    ...Media,
    access: {
      create: () => true,
      delete: () => true,
      read: () => true,
      update: () => true,
    },
    hooks: {
      beforeOperation: Media.hooks?.beforeOperation,
      beforeValidate: Media.hooks?.beforeValidate,
    },
    upload: {
      ...(typeof Media.upload === 'object' ? Media.upload : {}),
      staticDir: lifecycleMediaDir,
    },
    versions: false,
  }

  lifecyclePayload = await getPayload({
    config: await buildConfig({
      collections: [lifecycleMedia, { slug: 'pages', fields: [] }],
      db: mongooseAdapter({ transactionOptions: false, url: mongoServer.uri }),
      secret: 'media-lifecycle-test-secret',
      sharp,
    }),
  })
}, 120000)

afterAll(async () => {
  if (lifecyclePayload) await lifecyclePayload.destroy()
  if (stopMongoServer) await stopMongoServer()
  if (lifecycleMediaDir) await rm(lifecycleMediaDir, { force: true, recursive: true })
}, 30000)

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
    const beforeOperation = Media.hooks?.beforeOperation?.[0]
    const beforeValidate = Media.hooks?.beforeValidate?.at(-1)
    if (!beforeOperation) throw new Error('Expected Media beforeOperation hook.')
    if (!beforeValidate) throw new Error('Expected Media beforeValidate hook.')

    await expect(
      beforeValidate({
        data: { alt: '', assetType: 'general', mimeType: 'image/png' },
        operation: 'create',
        originalDoc: undefined,
        req: {},
      } as never),
    ).rejects.toThrow('Image assets require alt text.')

    await expect(
      beforeOperation({
        args: {},
        operation: 'create',
        req: { file: upload(Buffer.from('<html>fixture-bytes</html>')) },
      } as never),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('requires a file on create but skips binary revalidation for metadata-only updates', async () => {
    const beforeOperation = Media.hooks?.beforeOperation?.[0]
    if (!beforeOperation) throw new Error('Expected Media beforeOperation hook.')

    await expect(
      beforeOperation({
        args: {},
        operation: 'create',
        req: {},
      } as never),
    ).rejects.toMatchObject({ status: 400 })

    await expect(
      beforeOperation({
        args: { data: { alt: 'Updated alt' } },
        operation: 'update',
        req: {},
      } as never),
    ).resolves.toBeUndefined()
  })

  it('rejects an invalid real replacement before deletion and accepts valid uploads', async () => {
    const original = await lifecyclePayload.create({
      collection: 'media',
      data: { alt: 'Original image', assetType: 'general' },
      file: {
        data: onePixelPng,
        mimetype: 'image/png',
        name: 'original.png',
        size: onePixelPng.length,
      },
    })
    const originalPath = path.join(lifecycleMediaDir, original.filename ?? '')

    await expect(readFile(originalPath)).resolves.toEqual(onePixelPng)
    await expect(
      lifecyclePayload.update({
        collection: 'media',
        id: original.id,
        data: { alt: 'Invalid replacement' },
        file: {
          data: onePixelJpeg,
          mimetype: 'image/jpeg',
          name: 'replacement.png',
          size: onePixelJpeg.length,
        },
      }),
    ).rejects.toMatchObject({ status: 400 })

    await expect(readFile(originalPath)).resolves.toEqual(onePixelPng)

    const replacement = await lifecyclePayload.update({
      collection: 'media',
      id: original.id,
      data: { alt: 'Valid replacement' },
      file: {
        data: onePixelPng,
        mimetype: 'image/png',
        name: 'replacement.png',
        size: onePixelPng.length,
      },
    })

    expect(replacement.filename).toBe('replacement.png')
    await expect(access(originalPath)).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(access(path.join(lifecycleMediaDir, replacement.filename ?? ''))).resolves.toBe(
      undefined,
    )
  })
})
