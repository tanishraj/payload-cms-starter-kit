import { readFileSync } from 'node:fs'

import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('Payload security configuration', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.resetModules()
  })

  it('sets explicit API, origin, relationship-depth, and production auth limits', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      ALLOW_FIRST_ADMIN_CREATION: 'false',
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/payload-cms-starter-kit',
      NEXT_PUBLIC_SERVER_URL: 'https://canonical.example.test/',
      NODE_ENV: 'production',
      PAYLOAD_SECRET: '4f3a8db96b7240b4a6fbd84585f9bb21',
      RESEND_OVERRIDE_TO_EMAIL: '',
      VERCEL: '',
    }
    vi.resetModules()

    const { default: configPromise } = await import('@/payload.config')
    const config = await configPromise
    const users = config.collections.find(({ slug }) => slug === 'users')
    const emailField = users?.fields.find((field) => 'name' in field && field.name === 'email')

    expect(config.graphQL?.disable).toBe(true)
    expect(config.maxDepth).toBe(10)
    expect(config.serverURL).toBe('https://canonical.example.test')
    expect(config.cors).toEqual(['https://canonical.example.test'])
    expect(new Set(config.csrf)).toEqual(new Set(['https://canonical.example.test']))
    expect(users?.auth).toMatchObject({
      cookies: {
        sameSite: 'Lax',
        secure: true,
      },
      lockTime: 10 * 60 * 1000,
      maxLoginAttempts: 5,
      removeTokenFromResponses: true,
      tokenExpiration: 2 * 60 * 60,
      useSessions: true,
    })
    expect(emailField && 'unique' in emailField ? emailField.unique : false).toBe(true)
  })

  it('keeps the explicit global depth compatible with existing Page consumers', () => {
    expect(readFileSync('src/payload.config.ts', 'utf8')).toContain('maxDepth: 10')
    expect(readFileSync('src/app/(frontend)/preview/page/[id]/page.tsx', 'utf8')).toContain(
      'depth: 8',
    )
    expect(readFileSync('src/components/live-preview/PageLivePreview.tsx', 'utf8')).toContain(
      'depth: 8',
    )
    expect(readFileSync('src/hooks/createRedirectsForChangedPagePath.ts', 'utf8')).toContain(
      'depth: 10',
    )
  })
})
