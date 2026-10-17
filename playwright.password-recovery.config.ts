import { defineConfig } from '@playwright/test'
import base from './playwright.config'

if (!base.webServer || Array.isArray(base.webServer)) {
  throw new Error('Expected the isolated application test server.')
}

/** Enable the native email form; browser routes capture every reset request before the server. */
export default defineConfig({
  ...base,
  testMatch: 'password-recovery.e2e.spec.ts',
  webServer: {
    ...base.webServer,
    env: {
      ...base.webServer.env,
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 'test-only-password-recovery-key',
      RESEND_FROM_EMAIL: 'site@example.test',
      RESEND_OVERRIDE_TO_EMAIL: '',
    },
  },
})
