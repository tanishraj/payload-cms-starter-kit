// @vitest-environment node

import { readFileSync } from 'node:fs'

import type { Page } from '@playwright/test'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  configModuleLoaded: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return { ...actual, getPayload: mocks.getPayload }
})
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
    process.env.NODE_OPTIONS = '--inspect'

    const { default: config } = await import('../../playwright.config')

    expect(process.env.NODE_OPTIONS).toBe(
      '--no-deprecation --no-experimental-strip-types --conditions=react-server --import=tsx/esm',
    )
    expect(config.use).toMatchObject({
      baseURL: 'http://127.0.0.1:3000',
      trace: 'on-first-retry',
    })
    expect(config.webServer).toMatchObject({
      command: 'pnpm exec next dev --hostname 127.0.0.1',
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
        NODE_OPTIONS: '--no-deprecation --no-experimental-strip-types',
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

    const [
      { cleanupPageRecipeDraft },
      { cleanupHomepage, seedHomepage },
      governanceFixtures,
      seedUser,
    ] = await Promise.all([
      import('../helpers/pageRecipeDraft'),
      import('../helpers/seedHomepage'),
      import('../helpers/governanceFixtures'),
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
      governanceFixtures.seedGovernanceBase,
      governanceFixtures.cleanupGovernanceFixtures,
      () => governanceFixtures.deleteGovernanceQueueItems([]),
    ]

    for (const mutate of mutations) {
      await expect(mutate()).rejects.toThrow(/loopback/)
    }

    expect(mocks.configModuleLoaded).not.toHaveBeenCalled()
    expect(mocks.getPayload).not.toHaveBeenCalled()
  })

  it('guards every governance mutator before dynamic Payload imports', () => {
    const source = readFileSync('tests/helpers/governanceFixtures.ts', 'utf8')
    const functionSource = (name: string): string => {
      const declaration = `export async function ${name}`
      const start = source.indexOf(declaration)
      expect(start, `${name} declaration`).toBeGreaterThanOrEqual(0)

      const openingBrace = source.indexOf('{', start)
      let depth = 0

      for (let index = openingBrace; index < source.length; index += 1) {
        if (source[index] === '{') depth += 1
        if (source[index] === '}') depth -= 1
        if (depth === 0) return source.slice(start, index + 1)
      }

      throw new Error(`Could not isolate ${name}.`)
    }

    for (const name of [
      'seedGovernanceBase',
      'cleanupGovernanceFixtures',
      'deleteGovernanceQueueItems',
    ]) {
      const mutator = functionSource(name)
      const guardIndex = mutator.indexOf('const testDatabaseURI = getRequiredTestDatabaseURI()')
      const payloadImportIndex = mutator.indexOf("import('payload')")
      const configImportIndex = mutator.indexOf("import('../../src/payload.config.js')")

      expect(guardIndex, `${name} database guard`).toBeGreaterThanOrEqual(0)
      expect(payloadImportIndex, `${name} Payload import`).toBeGreaterThan(guardIndex)
      expect(configImportIndex, `${name} config import`).toBeGreaterThan(guardIndex)
    }

    expect(source).not.toContain('dropDatabase')
    expect(source).not.toMatch(/deleteMany\s*\(\s*\{\s*\}\s*\)/)
    expect(source.replaceAll('process.env', '')).not.toContain('.env')
    expect(source).not.toContain('mongodb+srv')
    expect(source).not.toMatch(/mongodb:\/\//)
  })

  it('uses stable Payload field IDs for governance user credentials', () => {
    const source = readFileSync('tests/e2e/governance.e2e.spec.ts', 'utf8')

    expect(source).toContain("page.locator('#field-email')")
    expect(source).toContain("page.locator('#field-password')")
    expect(source).toContain("page.locator('#field-confirm-password')")
    expect(source).not.toMatch(/getByLabel\('(Email|Password|Confirm Password)'/)
    expect(source).toContain('const field = page.locator(fieldID)')
    expect(source).toContain("const combobox = field.getByRole('combobox')")
    expect(source).toContain('await expect(combobox).toHaveCount(1)')
    expect(source).toContain("const roleField = page.locator('#field-role')")
    expect(source).toContain("const roleCombobox = roleField.getByRole('combobox')")
    expect(source).toContain("name: 'Publish changes', exact: true")
    expect(source).not.toMatch(/react-select|\.rs-|\.nth\(|waitForTimeout/)
    expect(source).toContain('let reviewPublishedForCleanup = false')
    expect(source).toContain('if (fixture && reviewPublishedForCleanup)')
    expect(source).toContain("data: { _status: 'draft', moderationStatus: 'rejected' }")
    expect(source).toContain('finally {\n      await cleanupGovernanceFixtures(fixture)')
    expect(source).toContain("getByRole('main').getByText('Published', { exact: true })")
    expect(source).toContain("cookie.name === 'payload-token'")
    expect(source).toContain('payloadCookies.length !== 1')
    expect(source).toContain('const pageURL = new URL(page.url())')
    expect(source).toContain('Origin: pageURL.origin')
    expect(source).toContain('Referer: pageURL.href')
    expect(source).toContain('headers: await getPayloadAuthHeaders(')
    expect(source).not.toContain("credentials: 'include'")
    expect(source.match(/testInfo\.setTimeout\(180_000\)/g)).toHaveLength(2)
    expect(source).toContain('async function expectDeniedCollectionRoute(')
    expect(source).toContain('expect(response?.status()).toBe(404)')
    expect(source).toContain('expect(new URL(page.url()).pathname).toBe(path)')
    expect(source).toContain("name: 'Nothing found', exact: true")
    expect(source).not.toMatch(
      /getByRole\('heading', \{ name: '(Articles|Pages)' \}\)\)\.toHaveCount\(0\)/,
    )
    expect(source).toContain('expect(reviewsResponse.status()).toBe(200)')
    expect(source).toContain('expect(reviewsPayload).toMatchObject({')
    expect(source).not.toContain('.status()).not.toBe(403)')

    for (const step of [
      'verify the Review is unavailable anonymously',
      'log in and open the pending Review',
      'verify the moderation controls are ready',
      'select Approved moderation status',
      'submit the approval PATCH',
      'verify the Review is published after save',
      'read back the persisted approval',
      'verify the published Review is available anonymously',
    ]) {
      expect(source).toContain(`test.step('${step}'`)
    }
  })
})

describe('E2E login navigation', () => {
  it('uses paths relative to Playwright baseURL by default', async () => {
    const page = {
      getByLabel: vi.fn(() => ({ fill: vi.fn() })),
      getByRole: vi.fn(() => ({ click: vi.fn() })),
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

    expect(page.goto).toHaveBeenCalledWith('/admin/login', { waitUntil: 'domcontentloaded' })
    expect(page.getByLabel).toHaveBeenCalledWith('Email', { exact: true })
    expect(page.getByLabel).toHaveBeenCalledWith('Password', { exact: true })
    expect(page.getByRole).toHaveBeenCalledWith('button', { name: 'Log in', exact: true })
    expect(page.waitForURL).toHaveBeenCalledWith('/admin', { waitUntil: 'domcontentloaded' })
  })
})

describe('native password recovery feedback fixture', () => {
  it('reuses the guarded test database and replaces parent email credentials with reserved fixtures', async () => {
    process.env.RESEND_API_KEY = 'parent-secret-must-not-be-used'
    process.env.RESEND_FROM_EMAIL = 'parent@example.invalid'
    process.env.RESEND_OVERRIDE_TO_EMAIL = 'parent-override@example.invalid'
    const { default: config } = await import('../../playwright.password-recovery.config')
    expect(config.testMatch).toBe('password-recovery.e2e.spec.ts')
    expect(config.webServer).toMatchObject({
      reuseExistingServer: false,
      env: {
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: 'test-only-password-recovery-key',
        RESEND_FROM_EMAIL: 'site@example.test',
        RESEND_OVERRIDE_TO_EMAIL: '',
        MONGODB_URI:
          'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
      },
    })
  })
})
