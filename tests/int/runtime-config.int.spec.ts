import { afterEach, describe, expect, it } from 'vitest'

import { getRuntimeConfig } from '@/config/runtime'

const ORIGINAL_ENV = { ...process.env }

describe('runtime config', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reads sqlite as the default local database provider', () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_PROVIDER: 'sqlite',
      DATABASE_URL: 'file:./payload.db',
      EMAIL_PROVIDER: 'none',
      VERCEL: '',
    }

    const config = getRuntimeConfig(process.env)

    expect(config.database).toEqual({
      provider: 'sqlite',
      url: 'file:./payload.db',
    })
    expect(config.deployment).toEqual({
      isProduction: false,
      isVercel: false,
    })
    expect(config.email.provider).toBe('none')
  })

  it('reads postgres from POSTGRES_URL for vercel deployments', () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_PROVIDER: 'postgres',
      POSTGRES_URL: 'postgres://starter:secret@db.example.com:5432/payload',
      NODE_ENV: 'production',
      VERCEL: '1',
    }

    const config = getRuntimeConfig(process.env)

    expect(config.database).toEqual({
      provider: 'postgres',
      url: 'postgres://starter:secret@db.example.com:5432/payload',
    })
    expect(config.deployment).toEqual({
      isProduction: true,
      isVercel: true,
    })
  })

  it('rejects sqlite in vercel production', () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_PROVIDER: 'sqlite',
      DATABASE_URL: 'file:./payload.db',
      NODE_ENV: 'production',
      VERCEL: '1',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'SQLite is only supported for local development. Use DATABASE_PROVIDER=postgres on Vercel.',
    )
  })

  it('rejects postgres without a connection string', () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_PROVIDER: 'postgres',
      POSTGRES_URL: '',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Missing Postgres connection string. Set POSTGRES_URL or DATABASE_URL.',
    )
  })
})
