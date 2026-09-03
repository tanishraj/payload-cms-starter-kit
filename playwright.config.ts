import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'

import { getRequiredTestDatabaseURI } from './tests/helpers/testDatabaseSafety'

const testEnvPath = fileURLToPath(new URL('./test.env', import.meta.url))
if (existsSync(testEnvPath)) {
  loadEnv({ override: false, path: testEnvPath })
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
      ...process.env,
      MONGODB_URI: testDatabaseURI,
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'e2e-only-payload-secret-32-characters',
      EMAIL_PROVIDER: 'none',
      MEDIA_PROVIDER: 'localDisk',
    },
    reuseExistingServer: false,
    url: 'http://127.0.0.1:3000/admin',
  },
})
