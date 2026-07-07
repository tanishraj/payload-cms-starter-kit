import { describe, expect, it, vi } from 'vitest'

const adapterMocks = vi.hoisted(() => ({
  sqliteAdapter: vi.fn((config) => ({ kind: 'sqlite', config })),
  vercelPostgresAdapter: vi.fn((config) => ({ kind: 'postgres', config })),
  resendAdapter: vi.fn((config) => ({ kind: 'email', config })),
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
    })

    expect(adapterMocks.vercelPostgresAdapter).toHaveBeenCalledWith({
      pool: {
        connectionString: 'postgres://starter:secret@db.example.com:5432/payload',
      },
    })
    expect(adapter).toMatchObject({ kind: 'postgres' })
  })
})
