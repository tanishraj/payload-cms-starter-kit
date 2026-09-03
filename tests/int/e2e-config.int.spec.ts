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

  it('starts its own loopback server with only the validated test database', async () => {
    process.env.TEST_MONGODB_URI = safeTestDatabaseURI
    process.env.MONGODB_URI = 'mongodb+srv://application.example.net/production'
    process.env.PAYLOAD_SECRET = 'process-specific-e2e-secret'

    const { default: config } = await import('../../playwright.config')

    expect(config.use).toMatchObject({
      baseURL: 'http://127.0.0.1:3000',
      trace: 'on-first-retry',
    })
    expect(config.webServer).toMatchObject({
      command: 'pnpm dev',
      env: expect.objectContaining({
        EMAIL_PROVIDER: 'none',
        MEDIA_PROVIDER: 'localDisk',
        MONGODB_URI: safeTestDatabaseURI,
        PAYLOAD_SECRET: 'process-specific-e2e-secret',
        TEST_MONGODB_URI: safeTestDatabaseURI,
      }),
      reuseExistingServer: false,
      url: 'http://127.0.0.1:3000/admin',
    })
  })

  it('rejects an unsafe test database while evaluating configuration without leaking it', async () => {
    const unsafeURI =
      'mongodb+srv://unsafe-user:unsafe-password@cluster.example.net/production?retryWrites=true'
    process.env.TEST_MONGODB_URI = unsafeURI

    let error: unknown
    try {
      await import('../../playwright.config')
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(Error)
    const message = (error as Error).message
    expect(message).toContain('protocol')
    expect(message).not.toContain(unsafeURI)
    expect(message).not.toContain('unsafe-user')
    expect(message).not.toContain('unsafe-password')
    expect(message).not.toContain('retryWrites=true')
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
