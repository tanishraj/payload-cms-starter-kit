import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'

import type { RuntimeConfig } from './runtime'

export const createDatabaseAdapter = (config: RuntimeConfig) => {
  if (config.database.provider === 'postgres') {
    return vercelPostgresAdapter({
      pool: {
        connectionString: config.database.url,
      },
    })
  }

  return sqliteAdapter({
    client: {
      url: config.database.url,
    },
  })
}

export const createEmailAdapter = (config: RuntimeConfig) => {
  if (config.email.provider !== 'resend' || !config.email.apiKey || !config.email.fromAddress) {
    return undefined
  }

  return resendAdapter({
    apiKey: config.email.apiKey,
    defaultFromAddress: config.email.fromAddress,
    defaultFromName: config.email.fromName,
    overrideRecipientAddress: process.env.RESEND_OVERRIDE_TO_EMAIL || undefined,
  })
}
