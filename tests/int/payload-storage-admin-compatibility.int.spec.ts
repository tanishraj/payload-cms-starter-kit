import { readFileSync } from 'node:fs'

import { s3Storage } from '@payloadcms/storage-s3'
import type { Config } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }
const S3_CLIENT_UPLOAD_HANDLER_PATH = '@payloadcms/storage-s3/client#S3ClientUploadHandler'
const S3_CLIENT_UPLOAD_ENDPOINT_PATH = '/storage-s3-generate-signed-url'

describe('Payload S3 Admin compatibility', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.resetModules()
  })

  it('keeps S3 Admin dependencies resolvable without mounting a disabled client uploader', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      ALLOW_FIRST_ADMIN_CREATION: 'false',
      ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'false',
      EMAIL_PROVIDER: 'none',
      FIRST_ADMIN_EMAIL: '',
      MEDIA_PROVIDER: 'localDisk',
      MEDIA_RECONCILE_TOKEN: '',
      MONGODB_URI:
        'mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0&directConnection=true',
      NEXT_PUBLIC_SERVER_URL: 'https://example.test',
      PAYLOAD_SECRET: 'build-only-payload-secret-32-characters',
      RESEND_OVERRIDE_TO_EMAIL: '',
      VERCEL: '',
    }
    vi.resetModules()

    const [{ default: configPromise }, { s3Storage: realS3Storage }] = await Promise.all([
      import('@/payload.config'),
      import('@payloadcms/storage-s3'),
    ])
    const localDiskConfig = await configPromise
    const fakeS3Config = await realS3Storage({
      bucket: 'fake-payload-media',
      collections: {
        media: true,
      },
      config: {
        credentials: {
          accessKeyId: 'fake-access-key',
          secretAccessKey: 'fake-secret-key',
        },
        endpoint: 'https://s3.example.test',
        forcePathStyle: true,
        region: 'auto',
      },
    })({
      admin: {},
      collections: [
        {
          fields: [],
          slug: 'media',
          upload: true,
        },
      ],
      db: {} as Config['db'],
      secret: 'fake-payload-secret',
    })

    const s3Dependency = fakeS3Config.admin?.dependencies?.[S3_CLIENT_UPLOAD_HANDLER_PATH]
    const s3Provider = (fakeS3Config.admin?.components?.providers ?? []).find(
      (provider) => typeof provider === 'object' && provider.path === S3_CLIENT_UPLOAD_HANDLER_PATH,
    )

    expect(s3Dependency).toEqual({
      path: S3_CLIENT_UPLOAD_HANDLER_PATH,
      type: 'function',
    })
    // Payload 3.90 registers a client provider only when clientUploads is enabled.
    // This starter intentionally keeps uploads server-side.
    expect(s3Provider).toBeUndefined()
    expect(fakeS3Config.endpoints ?? []).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: S3_CLIENT_UPLOAD_ENDPOINT_PATH,
        }),
      ]),
    )
    expect(localDiskConfig.admin?.dependencies?.[S3_CLIENT_UPLOAD_HANDLER_PATH]).toEqual(
      s3Dependency,
    )

    const localDiskImportMap = readFileSync('src/app/(payload)/admin/importMap.js', 'utf8')
    const requiredS3AdminPaths = new Set([
      ...Object.values(fakeS3Config.admin?.dependencies ?? {}).map(({ path }) => path),
      ...(fakeS3Config.admin?.components?.providers ?? []).flatMap((provider) =>
        typeof provider === 'object' ? [provider.path] : [],
      ),
    ])

    for (const requiredPath of requiredS3AdminPaths) {
      expect(localDiskImportMap, requiredPath).toContain(requiredPath)
    }
  })

  it('uses the real Payload S3 plugin in this contract', () => {
    expect(vi.isMockFunction(s3Storage)).toBe(false)
  })
})
