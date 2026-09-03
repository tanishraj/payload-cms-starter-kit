import { expect, test } from '@playwright/test'

import { importPayloadConfigFromE2EHelper } from '../helpers/payloadConfigImport'

test('worker imports Payload configuration through an E2E helper', async () => {
  expect(process.env.NODE_OPTIONS).toBe(
    '--no-deprecation --no-experimental-strip-types --conditions=react-server --import=tsx/esm',
  )
  await expect(importPayloadConfigFromE2EHelper()).resolves.toBeTruthy()
})
