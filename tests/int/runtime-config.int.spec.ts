import { afterEach, describe, expect, it } from 'vitest'

import { getRuntimeConfig } from '@/config/runtime'

const ORIGINAL_ENV = { ...process.env }

describe('runtime config', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reads the mongodb database url for local runtime', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      VERCEL: '',
    }

    const config = getRuntimeConfig(process.env)

    expect(config.database).toEqual({
      url: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
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

  it('accepts mongodb srv urls for hosted deployments', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb+srv://starter:secret@cluster.example.com/payload',
      NODE_ENV: 'production',
      VERCEL: '1',
    }

    const config = getRuntimeConfig(process.env)

    expect(config.database).toEqual({
      url: 'mongodb+srv://starter:secret@cluster.example.com/payload',
    })
    expect(config.deployment).toEqual({
      isProduction: true,
      isVercel: true,
    })
  })

  it('reads s3-compatible media configuration for hosted uploads', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
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

  it('rejects a missing mongodb connection string', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: '',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Missing MongoDB MONGODB_URI. Set MONGODB_URI to a MongoDB connection string.',
    )
  })

  it('does not accept DATABASE_URL as a legacy fallback', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: '',
      DATABASE_URL: 'mongodb://127.0.0.1:27017/legacy-database',
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Missing MongoDB MONGODB_URI. Set MONGODB_URI to a MongoDB connection string.',
    )
  })

  it('rejects a non-mongodb connection string', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'postgres://starter:secret@db.example.com:5432/payload',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Invalid MongoDB MONGODB_URI. Use a connection string starting with "mongodb://" or "mongodb+srv://".',
    )
  })

  it('rejects s3 mode without the required bucket configuration', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
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
