// @vitest-environment node

import type { Page } from '@playwright/test'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  configModuleLoaded: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@playwright/test', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@playwright/test')>()
  return {
    ...actual,
    expect: vi.fn(() => ({ toBeVisible: vi.fn() })),
  }
})
vi.mock('../../src/payload.config.js', () => {
  mocks.configModuleLoaded()
  return { default: {} }
})

const ORIGINAL_ENV = { ...process.env }
const safeTestDatabaseURI =
  'mongodb://127.0.0.1:27017/config-contract_test?replicaSet=rs0&directConnection=true'

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.clearAllMocks()
  vi.resetModules()
})

describe('Playwright database isolation', () => {
  it('loads the committed test defaults when process variables are absent', async () => {
    delete process.env.TEST_MONGODB_URI
    delete process.env.PAYLOAD_SECRET

    const { default: config } = await import('../../playwright.config')

    expect(config.webServer).toMatchObject({
      env: expect.objectContaining({
        MONGODB_URI:
          'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
        PAYLOAD_SECRET: 'e2e-only-payload-secret-32-characters',
      }),
    })
  })

  it('overrides every runtime-sensitive parent value for its isolated server', async () => {
    process.env.TEST_MONGODB_URI = 'mongodb+srv://hostile.example.invalid/production'
    process.env.MONGODB_URI = 'mongodb+srv://application.example.net/production'
    process.env.PAYLOAD_SECRET = 'process-specific-e2e-secret'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://hostile.example.invalid'
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    process.env.VERCEL = '1'
    process.env.ALLOW_FIRST_ADMIN_CREATION = 'true'
    process.env.ALLOW_PRODUCTION_EMAIL_OVERRIDE = 'true'
    process.env.FIRST_ADMIN_EMAIL = 'hostile@example.invalid'
    process.env.MEDIA_RECONCILE_TOKEN = 'hostile-token'
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_API_KEY = 'hostile-resend-key'
    process.env.RESEND_FROM_EMAIL = 'hostile@example.invalid'
    process.env.RESEND_FROM_NAME = 'Hostile sender'
    process.env.RESEND_OVERRIDE_TO_EMAIL = 'hostile-recipient@example.invalid'
    process.env.MEDIA_PROVIDER = 's3'
    process.env.S3_BUCKET = 'hostile-bucket'
    process.env.S3_ENDPOINT = 'https://hostile-s3.example.invalid'
    process.env.S3_REGION = 'hostile-region'
    process.env.S3_ACCESS_KEY_ID = 'hostile-access-key'
    process.env.S3_SECRET_ACCESS_KEY = 'hostile-secret-key'
    process.env.S3_PUBLIC_URL = 'https://hostile-assets.example.invalid'
    process.env.S3_ACL = 'public-read'
    process.env.S3_FORCE_PATH_STYLE = 'true'
    process.env.S3_CLIENT_UPLOADS = 'true'

    const { default: config } = await import('../../playwright.config')

    expect(config.use).toMatchObject({
      baseURL: 'http://127.0.0.1:3000',
      trace: 'on-first-retry',
    })
    expect(config.webServer).toMatchObject({
      command: 'pnpm dev',
      env: {
        ALLOW_FIRST_ADMIN_CREATION: 'false',
        ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'false',
        EMAIL_PROVIDER: 'none',
        FIRST_ADMIN_EMAIL: '',
        MEDIA_PROVIDER: 'localDisk',
        MEDIA_RECONCILE_TOKEN: '',
        MONGODB_URI:
          'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
        NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:3000',
        NODE_ENV: 'development',
        PAYLOAD_SECRET: 'e2e-only-payload-secret-32-characters',
        RESEND_API_KEY: '',
        RESEND_FROM_EMAIL: '',
        RESEND_FROM_NAME: '',
        RESEND_OVERRIDE_TO_EMAIL: '',
        S3_ACCESS_KEY_ID: '',
        S3_ACL: '',
        S3_BUCKET: '',
        S3_CLIENT_UPLOADS: '',
        S3_ENDPOINT: '',
        S3_FORCE_PATH_STYLE: '',
        S3_PUBLIC_URL: '',
        S3_REGION: '',
        S3_SECRET_ACCESS_KEY: '',
        TEST_MONGODB_URI:
          'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
        VERCEL: '',
      },
      reuseExistingServer: false,
      url: 'http://127.0.0.1:3000/admin',
    })
  })

  it('does not expose an ambient safe-looking database override to the web server', async () => {
    process.env.TEST_MONGODB_URI = safeTestDatabaseURI

    const { default: config } = await import('../../playwright.config')

    expect(config.webServer).toMatchObject({
      env: expect.objectContaining({
        MONGODB_URI:
          'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
        TEST_MONGODB_URI:
          'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
      }),
    })
  })
})

describe('E2E mutation helpers', () => {
  it('rejects unsafe databases before importing Payload configuration or calling getPayload', async () => {
    process.env.TEST_MONGODB_URI = 'mongodb://mongo:27017/e2e_test'

    const [{ cleanupPageRecipeDraft }, { cleanupHomepage, seedHomepage }, seedUser] =
      await Promise.all([
        import('../helpers/pageRecipeDraft'),
        import('../helpers/seedHomepage'),
        import('../helpers/seedUser'),
      ])

    expect(mocks.configModuleLoaded).not.toHaveBeenCalled()

    const mutations = [
      cleanupPageRecipeDraft,
      seedHomepage,
      cleanupHomepage,
      seedUser.seedTestUser,
      seedUser.getTestUserDocument,
      seedUser.cleanupTestUser,
    ]

    for (const mutate of mutations) {
      await expect(mutate()).rejects.toThrow(/loopback/)
    }

    expect(mocks.configModuleLoaded).not.toHaveBeenCalled()
    expect(mocks.getPayload).not.toHaveBeenCalled()
  })
})

describe('E2E login navigation', () => {
  it('uses paths relative to Playwright baseURL by default', async () => {
    const page = {
      click: vi.fn(),
      fill: vi.fn(),
      goto: vi.fn(),
      locator: vi.fn(() => ({
        toBeVisible: vi.fn(),
      })),
      waitForURL: vi.fn(),
    } as unknown as Page

    const { login } = await import('../helpers/login')

    await login({
      page,
      user: { email: 'test@example.com', password: 'password' },
    })

    expect(page.goto).toHaveBeenCalledWith('/admin/login')
    expect(page.waitForURL).toHaveBeenCalledWith('/admin')
  })
})
