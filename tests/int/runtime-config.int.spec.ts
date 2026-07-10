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
    expect(config.media).toEqual({
      provider: 'localDisk',
    })
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

  it('reads s3-compatible media configuration for hosted uploads', () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_PROVIDER: 'postgres',
      POSTGRES_URL: 'postgres://starter:secret@db.example.com:5432/payload',
      MEDIA_PROVIDER: 's3',
      S3_BUCKET: 'payload-media',
      S3_ENDPOINT: 'https://s3.ap-southeast-1.idrivee2.com',
      S3_REGION: 'ap-southeast-1',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      S3_CLIENT_UPLOADS: 'true',
      S3_FORCE_PATH_STYLE: 'true',
    }

    const config = getRuntimeConfig(process.env)

    expect(config.media).toEqual({
      provider: 's3',
      acl: 'public-read',
      accessKeyId: 'access-key',
      bucket: 'payload-media',
      clientUploads: true,
      endpoint: 'https://s3.ap-southeast-1.idrivee2.com',
      forcePathStyle: true,
      region: 'ap-southeast-1',
      secretAccessKey: 'secret-key',
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

  it('rejects s3 mode without the required bucket configuration', () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_PROVIDER: 'postgres',
      POSTGRES_URL: 'postgres://starter:secret@db.example.com:5432/payload',
      MEDIA_PROVIDER: 's3',
      S3_BUCKET: '',
      S3_ENDPOINT: '',
      S3_REGION: '',
      S3_ACCESS_KEY_ID: '',
      S3_SECRET_ACCESS_KEY: '',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Incomplete S3 media configuration. Set S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
    )
  })
})
