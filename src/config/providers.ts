import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

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

export const createStoragePlugins = (config: RuntimeConfig): Plugin[] => {
  if (config.media.provider !== 's3') {
    return []
  }

  return [
    s3Storage({
      acl: config.media.acl,
      bucket: config.media.bucket,
      clientUploads: config.media.clientUploads,
      collections: {
        media: true,
      },
      config: {
        credentials: {
          accessKeyId: config.media.accessKeyId,
          secretAccessKey: config.media.secretAccessKey,
        },
        endpoint: config.media.endpoint,
        forcePathStyle: config.media.forcePathStyle,
        region: config.media.region,
      },
    }),
  ]
}
