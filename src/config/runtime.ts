export type RuntimeConfig = {
  database: {
    url: string
  }
  deployment: {
    isProduction: boolean
    isVercel: boolean
  }
  email: {
    provider: 'resend' | 'none'
    apiKey: string | null
    fromAddress: string | null
    fromName: string
  }
  media:
    | {
        provider: 'localDisk'
      }
    | {
        provider: 's3'
        acl: 'private' | 'public-read'
        bucket: string
        clientUploads: boolean
        endpoint: string
        forcePathStyle: boolean
        region: string
        accessKeyId: string
        secretAccessKey: string
      }
}

const isMongoConnectionString = (value: string): boolean =>
  value.startsWith('mongodb://') || value.startsWith('mongodb+srv://')

const parseBooleanEnv = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value == null || value.trim() === '') {
    return defaultValue
  }

  const normalized = value.trim().toLowerCase()

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  throw new Error(`Invalid boolean value "${value}". Use true/false.`)
}

const getMediaProvider = (env: NodeJS.ProcessEnv): 'localDisk' | 's3' => {
  if (!env.MEDIA_PROVIDER || env.MEDIA_PROVIDER === 'localDisk') {
    return 'localDisk'
  }

  if (env.MEDIA_PROVIDER === 's3') {
    return 's3'
  }

  throw new Error('Unsupported MEDIA_PROVIDER. Use "localDisk" or "s3".')
}

export const getRuntimeConfig = (env: NodeJS.ProcessEnv = process.env): RuntimeConfig => {
  const mediaProvider = getMediaProvider(env)
  const isProduction = env.NODE_ENV === 'production'
  const isVercel = Boolean(env.VERCEL)
  const databaseURL = env.DATABASE_URL?.trim() || ''

  if (!databaseURL) {
    throw new Error('Missing MongoDB DATABASE_URL. Set DATABASE_URL to a MongoDB connection string.')
  }

  if (!isMongoConnectionString(databaseURL)) {
    throw new Error(
      'Invalid MongoDB DATABASE_URL. Use a connection string starting with "mongodb://" or "mongodb+srv://".',
    )
  }

  const emailProvider =
    env.EMAIL_PROVIDER === 'none'
      ? 'none'
      : env.EMAIL_PROVIDER === 'resend' || (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL)
      ? 'resend'
      : 'none'

  if (emailProvider === 'resend' && (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL)) {
    throw new Error(
      'Incomplete Resend configuration. Set RESEND_API_KEY and RESEND_FROM_EMAIL or use EMAIL_PROVIDER=none.',
    )
  }

  const media =
    mediaProvider === 's3'
      ? (() => {
          const bucket = env.S3_BUCKET?.trim() || ''
          const endpoint = env.S3_ENDPOINT?.trim() || ''
          const region = env.S3_REGION?.trim() || ''
          const accessKeyId = env.S3_ACCESS_KEY_ID?.trim() || ''
          const secretAccessKey = env.S3_SECRET_ACCESS_KEY?.trim() || ''
          const rawACL = env.S3_ACL?.trim() || 'public-read'

          if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
            throw new Error(
              'Incomplete S3 media configuration. Set S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
            )
          }

          if (rawACL !== 'public-read' && rawACL !== 'private') {
            throw new Error('Unsupported S3_ACL. Use "public-read" or "private".')
          }

          return {
            provider: 's3' as const,
            acl: rawACL as 'private' | 'public-read',
            accessKeyId,
            bucket,
            clientUploads: parseBooleanEnv(env.S3_CLIENT_UPLOADS, false),
            endpoint,
            forcePathStyle: parseBooleanEnv(env.S3_FORCE_PATH_STYLE, true),
            region,
            secretAccessKey,
          }
        })()
      : {
          provider: 'localDisk' as const,
        }

  return {
    database: {
      url: databaseURL,
    },
    deployment: {
      isProduction,
      isVercel,
    },
    email: {
      provider: emailProvider,
      apiKey: env.RESEND_API_KEY || null,
      fromAddress: env.RESEND_FROM_EMAIL || null,
      fromName: env.RESEND_FROM_NAME || 'Website',
    },
    media,
  }
}
