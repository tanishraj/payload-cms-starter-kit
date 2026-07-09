import { describe, expect, it } from 'vitest'

import { assertSupportedStarterContract, getStarterContract } from '@/config/starterContract'

describe('starter contract', () => {
  it('marks the documented local profile as supported', () => {
    const contract = getStarterContract({
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

    expect(contract.media).toEqual({
      mode: 'localDisk',
      reason: null,
      supported: true,
    })
  })

  it('rejects Vercel production because local-disk media is not durable there', () => {
    const contract = getStarterContract({
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

    expect(() => assertSupportedStarterContract(contract)).toThrow(
      'This starter uses local disk media storage. Vercel deployments require a durable media adapter before editors can upload assets safely.',
    )
  })
})
