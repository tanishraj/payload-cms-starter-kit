import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { getPayload, Payload } from 'payload'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let testDirectory = ''

describe('API', () => {
  beforeAll(async () => {
    testDirectory = mkdtempSync(join(tmpdir(), 'payload-api-int-'))
    process.env.DATABASE_PROVIDER = 'sqlite'
    process.env.DATABASE_URL = `file:${join(testDirectory, 'payload-test.db')}`

    const { default: config } = await import('@/payload.config')
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(() => {
    if (testDirectory) {
      rmSync(testDirectory, {
        force: true,
        recursive: true,
      })
    }
  })

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
