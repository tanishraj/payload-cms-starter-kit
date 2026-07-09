import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { getPayload, type Payload } from 'payload'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let testDirectory = ''

describe('starter productization', () => {
  beforeAll(async () => {
    testDirectory = mkdtempSync(join(tmpdir(), 'payload-starter-productization-'))
    process.env.DATABASE_PROVIDER = 'sqlite'
    process.env.DATABASE_URL = `file:${join(testDirectory, 'payload-test.db')}`
    process.env.EMAIL_PROVIDER = 'none'
    process.env.PAYLOAD_SECRET = 'test-secret'

    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config: await config })
  })

  afterAll(() => {
    if (testDirectory) {
      rmSync(testDirectory, {
        force: true,
        recursive: true,
      })
    }
  })

  it('keeps the documented local defaults in .env.example', () => {
    const envExample = readFileSync('.env.example', 'utf8')

    expect(envExample).toContain('DATABASE_PROVIDER=sqlite')
    expect(envExample).toContain('EMAIL_PROVIDER=none')
    expect(envExample).toContain('durable media adapter')
  })

  it('boots the starter and exposes the documented core collections and globals', async () => {
    const [pages, articles, reviews, forms, pageSettings, siteSettings, seoSettings] =
      await Promise.all([
        payload.find({ collection: 'pages', limit: 1 }),
        payload.find({ collection: 'articles', limit: 1 }),
        payload.find({ collection: 'reviews', limit: 1 }),
        payload.find({ collection: 'forms', limit: 1 }),
        payload.findGlobal({ slug: 'page-settings' }),
        payload.findGlobal({ slug: 'site-settings' }),
        payload.findGlobal({ slug: 'seo-settings' }),
      ])

    expect(Array.isArray(pages.docs)).toBe(true)
    expect(Array.isArray(articles.docs)).toBe(true)
    expect(Array.isArray(reviews.docs)).toBe(true)
    expect(Array.isArray(forms.docs)).toBe(true)
    expect(pageSettings).toBeDefined()
    expect(siteSettings).toBeDefined()
    expect(seoSettings).toBeDefined()
  })
})
