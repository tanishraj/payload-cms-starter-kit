import { readFileSync } from 'node:fs'

import { afterEach, describe, expect, it } from 'vitest'

import { getRuntimeConfig } from '@/config/runtime'
import { buildLivePreviewURL, getApplicationOrigin } from '@/lib/siteUrl'

const ORIGINAL_ENV = { ...process.env }

describe('runtime config', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reads the mongodb database url for local runtime', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      RESEND_OVERRIDE_TO_EMAIL: '',
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
    expect(config.application.origin).toBe('http://localhost:3000')
    expect(config.auth.allowFirstAdminCreation).toBe(true)
    expect(config.auth.firstAdminEmail).toBeNull()
    expect(config.email.provider).toBe('none')
    expect(config.email.overrideRecipientAddress).toBeNull()
    expect(config.media).toEqual({
      provider: 'localDisk',
    })
    expect(config.operations.mediaReconcileToken).toBeNull()
  })

  it('normalizes the canonical application origin and builds live-preview urls', () => {
    const config = getRuntimeConfig({
      ...ORIGINAL_ENV,
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NEXT_PUBLIC_SERVER_URL: 'https://preview.example.test/',
      PAYLOAD_SECRET: 'test-secret',
      RESEND_OVERRIDE_TO_EMAIL: '',
    })

    expect(getApplicationOrigin(config)).toBe('https://preview.example.test')
    expect(buildLivePreviewURL('/articles/example?preview=true', config)).toBe(
      'https://preview.example.test/articles/example?preview=true',
    )
  })

  it('accepts loopback http only outside production', () => {
    const baseEnv: NodeJS.ProcessEnv = {
      ...ORIGINAL_ENV,
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
      RESEND_OVERRIDE_TO_EMAIL: '',
    }

    expect(
      getRuntimeConfig({ ...baseEnv, NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:3000/' }).application
        .origin,
    ).toBe('http://127.0.0.1:3000')
    expect(() =>
      getRuntimeConfig({ ...baseEnv, NEXT_PUBLIC_SERVER_URL: 'http://preview.example.test' }),
    ).toThrow('Invalid NEXT_PUBLIC_SERVER_URL')
  })

  it('rejects a non-https canonical origin in production', () => {
    expect(() =>
      getRuntimeConfig({
        ...ORIGINAL_ENV,
        EMAIL_PROVIDER: 'none',
        MEDIA_PROVIDER: 'localDisk',
        MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
        NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
        NODE_ENV: 'production',
        PAYLOAD_SECRET: '4f3a8db96b7240b4a6fbd84585f9bb21',
        RESEND_OVERRIDE_TO_EMAIL: '',
      }),
    ).toThrow('Invalid production NEXT_PUBLIC_SERVER_URL. Use an HTTPS origin.')
  })

  it('requires an explicit production opt-in for recipient overrides', () => {
    const overrideAddress = 'qa-inbox@example.test'
    const productionEnv: NodeJS.ProcessEnv = {
      ...ORIGINAL_ENV,
      EMAIL_PROVIDER: 'resend',
      MEDIA_PROVIDER: 'localDisk',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NEXT_PUBLIC_SERVER_URL: 'https://www.example.test',
      NODE_ENV: 'production',
      PAYLOAD_SECRET: '4f3a8db96b7240b4a6fbd84585f9bb21',
      RESEND_API_KEY: 'resend-test-key',
      RESEND_FROM_EMAIL: 'hello@example.test',
      RESEND_OVERRIDE_TO_EMAIL: overrideAddress,
    }

    expect(() => getRuntimeConfig(productionEnv)).toThrow(
      'Production recipient override is disabled. Set ALLOW_PRODUCTION_EMAIL_OVERRIDE=true to enable it explicitly.',
    )

    try {
      getRuntimeConfig(productionEnv)
    } catch (error) {
      expect(String(error)).not.toContain(overrideAddress)
    }

    const config = getRuntimeConfig({
      ...productionEnv,
      ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'true',
    })
    expect(config.email.overrideRecipientAddress).toBe(overrideAddress)
  })

  it('defaults first-admin creation by environment and parses explicit policy strictly', () => {
    const baseEnv: NodeJS.ProcessEnv = {
      ...ORIGINAL_ENV,
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NEXT_PUBLIC_SERVER_URL: 'https://www.example.test',
      PAYLOAD_SECRET: '4f3a8db96b7240b4a6fbd84585f9bb21',
      RESEND_OVERRIDE_TO_EMAIL: '',
    }

    expect(getRuntimeConfig(baseEnv).auth.allowFirstAdminCreation).toBe(true)
    expect(
      getRuntimeConfig({ ...baseEnv, NODE_ENV: 'production' }).auth.allowFirstAdminCreation,
    ).toBe(false)
    expect(
      getRuntimeConfig({ ...baseEnv, ALLOW_FIRST_ADMIN_CREATION: 'false' }).auth
        .allowFirstAdminCreation,
    ).toBe(false)
    expect(() => getRuntimeConfig({ ...baseEnv, ALLOW_FIRST_ADMIN_CREATION: 'sometimes' })).toThrow(
      'Invalid boolean value',
    )
  })

  it.each(['test', 'development'] as const)(
    'ignores FIRST_ADMIN_EMAIL in %s bootstrap policy',
    (nodeEnv) => {
      const config = getRuntimeConfig({
        ...ORIGINAL_ENV,
        ALLOW_FIRST_ADMIN_CREATION: 'true',
        EMAIL_PROVIDER: 'none',
        FIRST_ADMIN_EMAIL: 'private-non-production-value',
        MEDIA_PROVIDER: 'localDisk',
        MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
        NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
        NODE_ENV: nodeEnv,
        PAYLOAD_SECRET: 'test-secret',
        RESEND_OVERRIDE_TO_EMAIL: '',
        VERCEL: '',
      })

      expect(config.auth).toEqual({
        allowFirstAdminCreation: true,
        firstAdminEmail: null,
      })
    },
  )

  it('requires and normalizes the configured first-admin email for production bootstrap', () => {
    const productionEnv: NodeJS.ProcessEnv = {
      ...ORIGINAL_ENV,
      ALLOW_FIRST_ADMIN_CREATION: 'true',
      EMAIL_PROVIDER: 'none',
      FIRST_ADMIN_EMAIL: '',
      MEDIA_PROVIDER: 'localDisk',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NEXT_PUBLIC_SERVER_URL: 'https://www.example.test',
      NODE_ENV: 'production',
      PAYLOAD_SECRET: '4f3a8db96b7240b4a6fbd84585f9bb21',
      RESEND_OVERRIDE_TO_EMAIL: '',
      VERCEL: '',
    }

    expect(() => getRuntimeConfig(productionEnv)).toThrow(
      'Production first-Admin creation requires FIRST_ADMIN_EMAIL.',
    )

    const invalidEmail = 'private-invalid-bootstrap-address'
    expect(() => getRuntimeConfig({ ...productionEnv, FIRST_ADMIN_EMAIL: invalidEmail })).toThrow(
      'Invalid FIRST_ADMIN_EMAIL. Use a valid email address.',
    )

    try {
      getRuntimeConfig({ ...productionEnv, FIRST_ADMIN_EMAIL: invalidEmail })
    } catch (error) {
      expect(String(error)).not.toContain(invalidEmail)
    }

    const config = getRuntimeConfig({
      ...productionEnv,
      FIRST_ADMIN_EMAIL: '  First.Admin@Example.Test  ',
    })
    expect(config.auth.firstAdminEmail).toBe('first.admin@example.test')
  })

  it('parses the media reconciliation token without including it in errors', () => {
    const mediaReconcileToken = 'media-reconcile-secret-value'
    const config = getRuntimeConfig({
      ...ORIGINAL_ENV,
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      MEDIA_RECONCILE_TOKEN: `  ${mediaReconcileToken}  `,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
      RESEND_OVERRIDE_TO_EMAIL: '',
    })

    expect(config.operations.mediaReconcileToken).toBe(mediaReconcileToken)
    expect(() =>
      getRuntimeConfig({
        ...ORIGINAL_ENV,
        ALLOW_FIRST_ADMIN_CREATION: mediaReconcileToken,
        MEDIA_RECONCILE_TOKEN: mediaReconcileToken,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
        PAYLOAD_SECRET: 'test-secret',
      }),
    ).toThrow('Invalid boolean value')

    try {
      getRuntimeConfig({
        ...ORIGINAL_ENV,
        ALLOW_FIRST_ADMIN_CREATION: mediaReconcileToken,
        MEDIA_RECONCILE_TOKEN: mediaReconcileToken,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
        PAYLOAD_SECRET: 'test-secret',
      })
    } catch (error) {
      expect(String(error)).not.toContain(mediaReconcileToken)
    }
  })

  it('keeps collection live-preview configuration behind the shared runtime helper', () => {
    for (const filePath of [
      'src/collections/Pages.ts',
      'src/collections/Articles.ts',
      'src/collections/NewsEvents.ts',
      'src/collections/Reviews.ts',
    ]) {
      const source = readFileSync(filePath, 'utf8')
      expect(source, filePath).toContain('buildLivePreviewURL(')
      expect(source, filePath).not.toContain('process.env.NEXT_PUBLIC_SERVER_URL')
    }
  })

  it('accepts mongodb srv urls for hosted deployments', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb+srv://starter:secret@cluster.example.com/payload',
      NODE_ENV: 'production',
      PAYLOAD_SECRET: '4f3a8db96b7240b4a6fbd84585f9bb21',
      NEXT_PUBLIC_SERVER_URL: 'https://www.example.test',
      RESEND_OVERRIDE_TO_EMAIL: '',
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

  it('rejects direct S3 client uploads without reflecting configuration values', () => {
    const forbiddenValue = 'true'
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
      MEDIA_PROVIDER: 's3',
      S3_BUCKET: 'payload-media',
      S3_ENDPOINT: 'https://s3.ap-southeast-1.idrivee2.com',
      S3_REGION: 'ap-southeast-1',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_ACL: 'public-read',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      S3_CLIENT_UPLOADS: forbiddenValue,
      S3_FORCE_PATH_STYLE: 'true',
      S3_PUBLIC_URL: '',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'S3 client uploads are not supported. Use server-side media uploads.',
    )

    try {
      getRuntimeConfig(process.env)
    } catch (error) {
      expect(String(error)).not.toContain(`S3_CLIENT_UPLOADS=${forbiddenValue}`)
    }

    expect(() =>
      getRuntimeConfig({
        ...process.env,
        MEDIA_PROVIDER: 'localDisk',
      }),
    ).toThrow('S3 client uploads are not supported. Use server-side media uploads.')
  })

  it('reads R2 public delivery configuration without sending an ACL', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
      MEDIA_PROVIDER: 's3',
      S3_BUCKET: 'snmih-media',
      S3_ENDPOINT: 'https://account-id.r2.cloudflarestorage.com',
      S3_REGION: 'auto',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      S3_ACL: 'none',
      S3_CLIENT_UPLOADS: 'false',
      S3_FORCE_PATH_STYLE: 'true',
      S3_PUBLIC_URL: 'https://assets.snmih.tanish.im/',
    }

    const config = getRuntimeConfig(process.env)

    expect(config.media).toEqual({
      provider: 's3',
      acl: null,
      accessKeyId: 'access-key',
      bucket: 'snmih-media',
      endpoint: 'https://account-id.r2.cloudflarestorage.com',
      forcePathStyle: true,
      publicURL: 'https://assets.snmih.tanish.im',
      region: 'auto',
      secretAccessKey: 'secret-key',
    })
  })

  it('defaults a blank S3 ACL to omission', () => {
    const config = getRuntimeConfig({
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
      MEDIA_PROVIDER: 's3',
      S3_BUCKET: 'snmih-media',
      S3_ENDPOINT: 'https://account-id.r2.cloudflarestorage.com',
      S3_REGION: 'auto',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      S3_ACL: '',
      S3_PUBLIC_URL: '',
    })

    expect(config.media.provider).toBe('s3')
    if (config.media.provider === 's3') {
      expect(config.media.acl).toBeNull()
      expect(config.media.publicURL).toBeNull()
    }
  })

  it('rejects unsupported S3 ACL values', () => {
    expect(() =>
      getRuntimeConfig({
        ...ORIGINAL_ENV,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
        PAYLOAD_SECRET: 'test-secret',
        MEDIA_PROVIDER: 's3',
        S3_BUCKET: 'snmih-media',
        S3_ENDPOINT: 'https://account-id.r2.cloudflarestorage.com',
        S3_REGION: 'auto',
        S3_ACCESS_KEY_ID: 'access-key',
        S3_SECRET_ACCESS_KEY: 'secret-key',
        S3_ACL: 'authenticated-read',
      }),
    ).toThrow('Unsupported S3_ACL. Use "none", "public-read", or "private".')
  })

  it('rejects an invalid S3 public origin', () => {
    expect(() =>
      getRuntimeConfig({
        ...ORIGINAL_ENV,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
        PAYLOAD_SECRET: 'test-secret',
        MEDIA_PROVIDER: 's3',
        S3_BUCKET: 'snmih-media',
        S3_ENDPOINT: 'https://account-id.r2.cloudflarestorage.com',
        S3_REGION: 'auto',
        S3_ACCESS_KEY_ID: 'access-key',
        S3_SECRET_ACCESS_KEY: 'secret-key',
        S3_ACL: 'none',
        S3_PUBLIC_URL: 'http://assets.snmih.tanish.im/private',
      }),
    ).toThrow(
      'Invalid S3_PUBLIC_URL. Use an HTTPS origin without credentials, path, query, or fragment.',
    )
  })

  it('rejects a missing mongodb connection string', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: '',
      PAYLOAD_SECRET: 'test-secret',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Missing MongoDB MONGODB_URI. Set MONGODB_URI to a MongoDB connection string.',
    )
  })

  it('does not accept DATABASE_URL as a legacy fallback', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: '',
      PAYLOAD_SECRET: 'test-secret',
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
      PAYLOAD_SECRET: 'test-secret',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Invalid MongoDB MONGODB_URI. Use a connection string starting with "mongodb://" or "mongodb+srv://".',
    )
  })

  it('rejects s3 mode without the required bucket configuration', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: 'test-secret',
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

  it('rejects a missing Payload secret', () => {
    process.env = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      PAYLOAD_SECRET: '',
    }

    expect(() => getRuntimeConfig(process.env)).toThrow(
      'Missing PAYLOAD_SECRET. Set a unique secret for this environment.',
    )
  })

  it('rejects placeholder and weak Payload secrets in production', () => {
    const baseEnv: NodeJS.ProcessEnv = {
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NEXT_PUBLIC_SERVER_URL: 'https://www.example.test',
      NODE_ENV: 'production',
      RESEND_OVERRIDE_TO_EMAIL: '',
    }

    for (const secret of ['YOUR_PAYLOAD_CMS_SECRET_HERE', 'change-me', 'too-short']) {
      expect(() => getRuntimeConfig({ ...baseEnv, PAYLOAD_SECRET: secret })).toThrow(
        'Invalid production PAYLOAD_SECRET. Use at least 32 non-placeholder characters.',
      )
    }
  })

  it('exposes a validated high-entropy Payload secret', () => {
    const secret = '4f3a8db96b7240b4a6fbd84585f9bb21'
    const config = getRuntimeConfig({
      ...ORIGINAL_ENV,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NODE_ENV: 'production',
      NEXT_PUBLIC_SERVER_URL: 'https://www.example.test',
      PAYLOAD_SECRET: secret,
      RESEND_OVERRIDE_TO_EMAIL: '',
    })

    expect(config.payload.secret).toBe(secret)
  })
})
