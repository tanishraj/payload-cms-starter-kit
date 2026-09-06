import { getRequiredTestDatabaseURI } from './testDatabaseSafety'

export async function importPayloadConfigFromE2EHelper(): Promise<unknown> {
  process.env.MONGODB_URI = getRequiredTestDatabaseURI()

  const { default: config } = await import('../../src/payload.config.js')

  return config
}
