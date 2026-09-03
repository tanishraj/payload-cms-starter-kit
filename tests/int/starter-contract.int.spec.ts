import { describe, expect, it } from 'vitest'

import { assertSupportedStarterContract, getStarterContract } from '@/config/starterContract'

describe('starter contract', () => {
  it('marks the documented local profile as supported', () => {
    const contract = getStarterContract({
      application: {
        origin: 'http://localhost:3000',
      },
      auth: {
        allowFirstAdminCreation: true,
        firstAdminEmail: null,
      },
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
        overrideRecipientAddress: null,
        provider: 'none',
      },
      media: {
        provider: 'localDisk',
      },
      operations: {
        mediaReconcileToken: null,
      },
      payload: {
        secret: 'test-secret',
      },
    })

    expect(contract.media).toEqual({
      mode: 'localDisk',
      reason: null,
      supported: true,
    })
  })

  it('rejects Vercel production because local-disk media is not durable there', () => {
    const contract = getStarterContract({
      application: {
        origin: 'https://www.example.test',
      },
      auth: {
        allowFirstAdminCreation: false,
        firstAdminEmail: null,
      },
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
        overrideRecipientAddress: null,
        provider: 'none',
      },
      media: {
        provider: 'localDisk',
      },
      operations: {
        mediaReconcileToken: null,
      },
      payload: {
        secret: 'test-secret',
      },
    })

    expect(() => assertSupportedStarterContract(contract)).toThrow(
      'This starter uses local disk media storage. Vercel deployments require a durable media adapter before editors can upload assets safely.',
    )
  })

  it('allows hosted deployments when s3 media storage is configured', () => {
    const contract = getStarterContract({
      application: {
        origin: 'https://www.example.test',
      },
      auth: {
        allowFirstAdminCreation: false,
        firstAdminEmail: null,
      },
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
        overrideRecipientAddress: null,
        provider: 'none',
      },
      media: {
        provider: 's3',
        acl: 'public-read',
        accessKeyId: 'access-key',
        bucket: 'payload-media',
        endpoint: 'https://s3.ap-southeast-1.idrivee2.com',
        forcePathStyle: true,
        publicURL: null,
        region: 'ap-southeast-1',
        secretAccessKey: 'secret-key',
      },
      operations: {
        mediaReconcileToken: 'do-not-expose-this-token',
      },
      payload: {
        secret: 'test-secret',
      },
    })

    expect(contract.media).toEqual({
      mode: 's3',
      reason: null,
      supported: true,
    })
    expect(JSON.stringify(contract)).not.toContain('do-not-expose-this-token')
  })
})
