import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendMock = vi.fn()
const originalEnvironment = { ...process.env }

let mediaStorage: typeof import('@/lib/mediaStorage')

vi.mock('@aws-sdk/client-s3', () => ({
  HeadObjectCommand: vi.fn(function HeadObjectCommand(input: unknown) {
    return {
      input,
    }
  }),
  S3Client: vi.fn(function S3Client() {
    return {
      send: sendMock,
    }
  }),
}))

beforeEach(async () => {
  sendMock.mockReset()
  vi.resetModules()
  process.env = {
    ...originalEnvironment,
    EMAIL_PROVIDER: 'none',
    MEDIA_PROVIDER: 's3',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/media-storage_test',
    PAYLOAD_SECRET: 'media-storage-only-payload-secret',
    S3_ACCESS_KEY_ID: 'test-access-key',
    S3_ACL: 'none',
    S3_BUCKET: 'snmih',
    S3_CLIENT_UPLOADS: 'false',
    S3_ENDPOINT: 'https://s3.example.invalid',
    S3_FORCE_PATH_STYLE: 'true',
    S3_PUBLIC_URL: '',
    S3_REGION: 'test-region',
    S3_SECRET_ACCESS_KEY: 'test-secret-key',
  }
  mediaStorage = await import('@/lib/mediaStorage')
})

afterEach(() => {
  process.env = { ...originalEnvironment }
  vi.resetModules()
})

describe('media storage helpers', () => {
  it('derives the object key from filename first', () => {
    expect(
      mediaStorage.getMediaStorageObjectKey({
        bucket: 'snmih',
        media: {
          filename: 'uploads/banner.png',
          url: 'https://cdn.example.com/ignored.png',
        },
      }),
    ).toBe('uploads/banner.png')
  })

  it('derives the object key from a path-style bucket url', () => {
    expect(
      mediaStorage.getMediaStorageObjectKey({
        bucket: 'snmih',
        media: {
          url: 'https://s3.ap-northeast-1.idrivee2.com/snmih/site/logo.png',
        },
      }),
    ).toBe('site/logo.png')
  })
})

describe('reconcileMediaStorage', () => {
  it('marks missing media, updates the document, and records an audit event', async () => {
    sendMock.mockRejectedValueOnce({
      $metadata: {
        httpStatusCode: 404,
      },
      name: 'NotFound',
    })

    const payload = {
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => ({})),
    }

    const result = await mediaStorage.reconcileMediaStorage({
      media: [
        {
          filename: 'hero.png',
          id: '1',
          storageStatus: 'healthy',
          title: 'Hero',
        },
      ],
      payload: payload as never,
    })

    expect(result).toMatchObject({
      missing: 1,
      scanned: 1,
      updated: 1,
    })
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        data: expect.objectContaining({
          storageIssue: 'The expected object "hero.png" was not found in bucket "snmih".',
          storageStatus: 'missing',
        }),
        id: '1',
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'operational-audit-events',
        data: expect.objectContaining({
          action: 'media_storage_missing',
          entityId: '1',
          feature: 'media',
        }),
      }),
    )
  })

  it('records restoration when a previously missing object becomes available again', async () => {
    sendMock.mockResolvedValueOnce({})

    const payload = {
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => ({})),
    }

    const result = await mediaStorage.reconcileMediaStorage({
      media: [
        {
          filename: 'hero.png',
          id: '1',
          storageIssue: 'Previously missing.',
          storageMissingSince: '2026-07-10T00:00:00.000Z',
          storageStatus: 'missing',
          title: 'Hero',
        },
      ],
      payload: payload as never,
    })

    expect(result).toMatchObject({
      healthy: 1,
      scanned: 1,
      updated: 1,
    })
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        data: expect.objectContaining({
          storageIssue: null,
          storageMissingSince: null,
          storageStatus: 'healthy',
        }),
        id: '1',
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'operational-audit-events',
        data: expect.objectContaining({
          action: 'media_storage_restored',
          entityId: '1',
        }),
      }),
    )
  })
})
