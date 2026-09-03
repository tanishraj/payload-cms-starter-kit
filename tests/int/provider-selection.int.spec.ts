import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

const adapterMocks = vi.hoisted(() => ({
  mongooseAdapter: vi.fn((config) => ({ kind: 'mongo', config })),
  resendAdapter: vi.fn((config) => ({ kind: 'email', config })),
  s3Storage: vi.fn((config) => ({ kind: 's3-plugin', config })),
}))

vi.mock('@payloadcms/db-mongodb', () => ({
  mongooseAdapter: adapterMocks.mongooseAdapter,
}))

vi.mock('@payloadcms/email-resend', () => ({
  resendAdapter: adapterMocks.resendAdapter,
}))

vi.mock('@payloadcms/storage-s3', () => ({
  s3Storage: adapterMocks.s3Storage,
}))

describe('provider selection', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('uses only the typed recipient override supplied by runtime config', async () => {
    process.env.RESEND_OVERRIDE_TO_EMAIL = 'ambient-process-value@example.test'
    const { createEmailAdapter } = await import('@/config/providers')

    createEmailAdapter({
      email: {
        apiKey: 'resend-test-key',
        fromAddress: 'hello@example.test',
        fromName: 'Website',
        overrideRecipientAddress: 'configured-override@example.test',
        provider: 'resend',
      },
    })

    expect(adapterMocks.resendAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideRecipientAddress: 'configured-override@example.test',
      }),
    )
  })

  it('creates a mongodb adapter for local runtime config', async () => {
    const { createDatabaseAdapter } = await import('@/config/providers')

    const adapter = createDatabaseAdapter({
      database: {
        url: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      },
    })

    expect(adapterMocks.mongooseAdapter).toHaveBeenCalledWith({
      url: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
    })
    expect(adapter).toMatchObject({ kind: 'mongo' })
  })

  it('cannot enable direct client uploads in the s3 storage plugin', async () => {
    const { createStoragePlugins } = await import('@/config/providers')

    const plugins = createStoragePlugins({
      media: {
        provider: 's3',
        acl: 'public-read',
        accessKeyId: 'access-key',
        bucket: 'payload-media',
        clientUploads: true,
        endpoint: 'https://s3.ap-southeast-1.idrivee2.com',
        forcePathStyle: true,
        publicURL: null,
        region: 'ap-southeast-1',
        secretAccessKey: 'secret-key',
      },
    } as never)

    expect(adapterMocks.s3Storage).toHaveBeenCalledWith({
      acl: 'public-read',
      bucket: 'payload-media',
      collections: {
        media: true,
      },
      config: {
        credentials: {
          accessKeyId: 'access-key',
          secretAccessKey: 'secret-key',
        },
        endpoint: 'https://s3.ap-southeast-1.idrivee2.com',
        forcePathStyle: true,
        region: 'ap-southeast-1',
      },
    })
    expect(adapterMocks.s3Storage.mock.calls.at(-1)?.[0]).not.toHaveProperty('clientUploads')
    expect(plugins).toHaveLength(1)
    expect(plugins[0]).toMatchObject({ kind: 's3-plugin' })
  })

  it('creates an R2 storage plugin with direct public media URLs and no ACL', async () => {
    const { createStoragePlugins } = await import('@/config/providers')

    const plugins = createStoragePlugins({
      media: {
        provider: 's3',
        acl: null,
        accessKeyId: 'r2-access-key',
        bucket: 'snmih-media',
        endpoint: 'https://account-id.r2.cloudflarestorage.com',
        forcePathStyle: true,
        publicURL: 'https://assets.snmih.tanish.im',
        region: 'auto',
        secretAccessKey: 'r2-secret-key',
      },
    })

    const storageOptions = adapterMocks.s3Storage.mock.calls.at(-1)?.[0]
    const mediaOptions = storageOptions?.collections.media

    expect(storageOptions).not.toHaveProperty('acl')
    expect(storageOptions).toMatchObject({
      bucket: 'snmih-media',
      config: {
        credentials: {
          accessKeyId: 'r2-access-key',
          secretAccessKey: 'r2-secret-key',
        },
        endpoint: 'https://account-id.r2.cloudflarestorage.com',
        forcePathStyle: true,
        region: 'auto',
      },
    })
    expect(mediaOptions).not.toBe(true)
    expect(mediaOptions).toMatchObject({
      disablePayloadAccessControl: true,
    })

    if (!mediaOptions || mediaOptions === true) {
      throw new Error('Expected public media collection options.')
    }

    expect(
      await mediaOptions.generateFileURL?.({
        collection: {} as never,
        filename: 'Campus image.PNG',
        prefix: 'school events',
      }),
    ).toBe('https://assets.snmih.tanish.im/school%20events/Campus%20image.PNG')
    expect(plugins).toHaveLength(1)
    expect(plugins[0]).toMatchObject({ kind: 's3-plugin' })
  })
})
