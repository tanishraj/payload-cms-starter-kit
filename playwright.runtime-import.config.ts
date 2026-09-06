import { defineConfig } from '@playwright/test'

import e2eConfig from './playwright.config'

export default defineConfig({
  ...e2eConfig,
  testDir: './tests/e2e-runtime',
  webServer: undefined,
})
