import { describe, expect, it } from 'vitest'

import { getRuntimeConfig } from '@/config/runtime'

describe('runtime config', () => {
  it('reads provider and email settings from env', () => {
    process.env.DATABASE_PROVIDER = 'sqlite'
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_FROM_EMAIL = 'hello@example.com'

    const config = getRuntimeConfig()

    expect(config.database.provider).toBe('sqlite')
    expect(config.email.provider).toBe('resend')
    expect(config.email.fromAddress).toBe('hello@example.com')
  })
})
