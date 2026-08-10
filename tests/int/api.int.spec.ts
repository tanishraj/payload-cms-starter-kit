import { getPayload, Payload } from 'payload'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { createTestMongoServer } from '../helpers/mongoMemoryServer'

let payload: Payload
let stopMongoServer: (() => Promise<void>) | null = null

describe('API', () => {
  beforeAll(async () => {
    const mongoServer = await createTestMongoServer()

    process.env.MONGODB_URI = mongoServer.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'test-secret'
    stopMongoServer = mongoServer.stop

    vi.resetModules()
    const { default: config } = await import('@/payload.config')
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  }, 120000)

  afterAll(async () => {
    if (payload) {
      await payload.destroy()
    }

    if (stopMongoServer) {
      await stopMongoServer()
    }
  }, 30000)

  it('loads configured collections', async () => {
    const [users, pages, forms, categories, articles] = await Promise.all([
      payload.find({
        collection: 'users',
      }),
      payload.find({
        collection: 'pages',
        limit: 1,
      }),
      payload.find({
        collection: 'forms',
        limit: 1,
      }),
      payload.find({
        collection: 'categories',
        limit: 1,
      }),
      payload.find({
        collection: 'articles',
        limit: 1,
      }),
    ])

    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
    expect(pages).toBeDefined()
    expect(Array.isArray(pages.docs)).toBe(true)
    expect(forms).toBeDefined()
    expect(Array.isArray(forms.docs)).toBe(true)
    expect(categories).toBeDefined()
    expect(Array.isArray(categories.docs)).toBe(true)
    expect(articles).toBeDefined()
    expect(Array.isArray(articles.docs)).toBe(true)
  })
})
