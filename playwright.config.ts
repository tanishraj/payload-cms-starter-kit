import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'

import { getRequiredTestDatabaseURI } from './tests/helpers/testDatabaseSafety'

const testEnvPath = fileURLToPath(new URL('./test.env', import.meta.url))
if (existsSync(testEnvPath)) {
  loadEnv({ override: true, path: testEnvPath })
}

const testDatabaseURI = getRequiredTestDatabaseURI()

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Serialize browser workers because local e2e setup shares one MongoDB replica-set database. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'http://127.0.0.1:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    env: {
      ALLOW_FIRST_ADMIN_CREATION: 'false',
      ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'false',
      MONGODB_URI: testDatabaseURI,
      FIRST_ADMIN_EMAIL: '',
      EMAIL_PROVIDER: 'none',
      MEDIA_RECONCILE_TOKEN: '',
      MEDIA_PROVIDER: 'localDisk',
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
      TEST_MONGODB_URI: testDatabaseURI,
      VERCEL: '',
    },
    reuseExistingServer: false,
    url: 'http://127.0.0.1:3000/admin',
  },
})
