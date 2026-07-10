import { describe, expect, it, vi } from 'vitest'

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
  it('creates a mongodb adapter for local runtime config', async () => {
    const { createDatabaseAdapter } = await import('@/config/providers')

    const adapter = createDatabaseAdapter({
      database: {
        url: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      },
      deployment: {
        isProduction: false,
        isVercel: false,
      },
      email: {
        apiKey: null,
        fromAddress: null,
        fromName: 'Website',
        provider: 'none',
      },
      media: {
        provider: 'localDisk',
      },
    })

    expect(adapterMocks.mongooseAdapter).toHaveBeenCalledWith({
      url: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
    })
    expect(adapter).toMatchObject({ kind: 'mongo' })
  })

  it('creates an s3 storage plugin for the media collection', async () => {
    const { createStoragePlugins } = await import('@/config/providers')

    const plugins = createStoragePlugins({
      database: {
        url: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      },
      deployment: {
        isProduction: true,
        isVercel: true,
      },
      email: {
        apiKey: null,
        fromAddress: null,
        fromName: 'Website',
        provider: 'none',
      },
      media: {
        provider: 's3',
        acl: 'public-read',
        accessKeyId: 'access-key',
        bucket: 'payload-media',
        clientUploads: true,
        endpoint: 'https://s3.ap-southeast-1.idrivee2.com',
        forcePathStyle: true,
        region: 'ap-southeast-1',
        secretAccessKey: 'secret-key',
      },
    })

    expect(adapterMocks.s3Storage).toHaveBeenCalledWith({
      acl: 'public-read',
      bucket: 'payload-media',
      clientUploads: true,
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
    expect(plugins).toHaveLength(1)
    expect(plugins[0]).toMatchObject({ kind: 's3-plugin' })
  })
})
