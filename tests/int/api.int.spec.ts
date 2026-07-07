import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('loads configured collections', async () => {
    const [users, pages, forms] = await Promise.all([
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
    ])

    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
    expect(pages).toBeDefined()
    expect(Array.isArray(pages.docs)).toBe(true)
    expect(forms).toBeDefined()
    expect(Array.isArray(forms.docs)).toBe(true)
  })
})
