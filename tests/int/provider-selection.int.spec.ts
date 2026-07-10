import { describe, expect, it, vi } from 'vitest'

const adapterMocks = vi.hoisted(() => ({
  sqliteAdapter: vi.fn((config) => ({ kind: 'sqlite', config })),
  vercelPostgresAdapter: vi.fn((config) => ({ kind: 'postgres', config })),
  resendAdapter: vi.fn((config) => ({ kind: 'email', config })),
  s3Storage: vi.fn((config) => ({ kind: 's3-plugin', config })),
}))

vi.mock('@payloadcms/db-sqlite', () => ({
  sqliteAdapter: adapterMocks.sqliteAdapter,
}))

vi.mock('@payloadcms/db-vercel-postgres', () => ({
  vercelPostgresAdapter: adapterMocks.vercelPostgresAdapter,
}))

vi.mock('@payloadcms/email-resend', () => ({
  resendAdapter: adapterMocks.resendAdapter,
}))

vi.mock('@payloadcms/storage-s3', () => ({
  s3Storage: adapterMocks.s3Storage,
}))

describe('provider selection', () => {
  it('creates a sqlite adapter for local runtime config', async () => {
    const { createDatabaseAdapter } = await import('@/config/providers')

    const adapter = createDatabaseAdapter({
      database: {
        provider: 'sqlite',
        url: 'file:./payload.db',
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

    expect(adapterMocks.sqliteAdapter).toHaveBeenCalledWith({
      client: {
        url: 'file:./payload.db',
      },
    })
    expect(adapter).toMatchObject({ kind: 'sqlite' })
  })

  it('creates a vercel postgres adapter for hosted runtime config', async () => {
    const { createDatabaseAdapter } = await import('@/config/providers')

    const adapter = createDatabaseAdapter({
      database: {
        provider: 'postgres',
        url: 'postgres://starter:secret@db.example.com:5432/payload',
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
        provider: 'localDisk',
      },
    })

    expect(adapterMocks.vercelPostgresAdapter).toHaveBeenCalledWith({
      pool: {
        connectionString: 'postgres://starter:secret@db.example.com:5432/payload',
      },
    })
    expect(adapter).toMatchObject({ kind: 'postgres' })
  })

  it('creates an s3 storage plugin for the media collection', async () => {
    const { createStoragePlugins } = await import('@/config/providers')

    const plugins = createStoragePlugins({
      database: {
        provider: 'postgres',
        url: 'postgres://starter:secret@db.example.com:5432/payload',
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
