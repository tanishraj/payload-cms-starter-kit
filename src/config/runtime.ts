import { normalizeMediaPublicURL } from './mediaPublicURL'

export type RuntimeConfig = {
  application: {
    origin: string
  }
  auth: {
    allowFirstAdminCreation: boolean
  }
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
    overrideRecipientAddress: string | null
  }
  media:
    | {
        provider: 'localDisk'
      }
    | {
        provider: 's3'
        acl: 'private' | 'public-read' | null
        bucket: string
        clientUploads: boolean
        endpoint: string
        forcePathStyle: boolean
        publicURL: string | null
        region: string
        accessKeyId: string
        secretAccessKey: string
      }
  payload: {
    secret: string
  }
  operations: {
    mediaReconcileToken: string | null
  }
}

const fallbackApplicationOrigin = 'http://localhost:3000'

const isMongoConnectionString = (value: string): boolean =>
  value.startsWith('mongodb://') || value.startsWith('mongodb+srv://')

const parseBooleanEnv = (
  value: string | undefined,
  defaultValue: boolean,
  variableName: string,
): boolean => {
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

  throw new Error(`Invalid boolean value for ${variableName}. Use true/false.`)
}

const loopbackHostnames = new Set(['127.0.0.1', '[::1]', 'localhost'])

const parseApplicationOrigin = (env: NodeJS.ProcessEnv, isProduction: boolean): string => {
  const configuredOrigin = env.NEXT_PUBLIC_SERVER_URL?.trim() || fallbackApplicationOrigin
  let url: URL

  try {
    url = new URL(configuredOrigin)
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SERVER_URL. Use an absolute HTTPS origin.')
  }

  if (url.username || url.password) {
    throw new Error('Invalid NEXT_PUBLIC_SERVER_URL. Credentials are not allowed.')
  }

  if (isProduction && url.protocol !== 'https:') {
    throw new Error('Invalid production NEXT_PUBLIC_SERVER_URL. Use an HTTPS origin.')
  }

  const isDevelopmentLoopbackHTTP =
    !isProduction && url.protocol === 'http:' && loopbackHostnames.has(url.hostname)

  if (url.protocol !== 'https:' && !isDevelopmentLoopbackHTTP) {
    throw new Error(
      'Invalid NEXT_PUBLIC_SERVER_URL. Use HTTPS, or loopback HTTP outside production.',
    )
  }

  return url.origin
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
  const mongodbURI = env.MONGODB_URI?.trim() || ''
  const payloadSecret = env.PAYLOAD_SECRET?.trim() || ''
  const applicationOrigin = parseApplicationOrigin(env, isProduction)
  const allowFirstAdminCreation = parseBooleanEnv(
    env.ALLOW_FIRST_ADMIN_CREATION,
    !isProduction,
    'ALLOW_FIRST_ADMIN_CREATION',
  )
  const allowProductionEmailOverride = parseBooleanEnv(
    env.ALLOW_PRODUCTION_EMAIL_OVERRIDE,
    false,
    'ALLOW_PRODUCTION_EMAIL_OVERRIDE',
  )
  const overrideRecipientAddress = env.RESEND_OVERRIDE_TO_EMAIL?.trim() || null
  const mediaReconcileToken = env.MEDIA_RECONCILE_TOKEN?.trim() || null

  if (!payloadSecret) {
    throw new Error('Missing PAYLOAD_SECRET. Set a unique secret for this environment.')
  }

  const placeholderSecrets = new Set(['YOUR_PAYLOAD_CMS_SECRET_HERE', 'change-me', 'changeme'])

  if (isProduction && (payloadSecret.length < 32 || placeholderSecrets.has(payloadSecret))) {
    throw new Error(
      'Invalid production PAYLOAD_SECRET. Use at least 32 non-placeholder characters.',
    )
  }

  if (!mongodbURI) {
    throw new Error('Missing MongoDB MONGODB_URI. Set MONGODB_URI to a MongoDB connection string.')
  }

  if (!isMongoConnectionString(mongodbURI)) {
    throw new Error(
      'Invalid MongoDB MONGODB_URI. Use a connection string starting with "mongodb://" or "mongodb+srv://".',
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

  if (isProduction && overrideRecipientAddress && !allowProductionEmailOverride) {
    throw new Error(
      'Production recipient override is disabled. Set ALLOW_PRODUCTION_EMAIL_OVERRIDE=true to enable it explicitly.',
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
          const rawACL = env.S3_ACL?.trim() || 'none'

          if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
            throw new Error(
              'Incomplete S3 media configuration. Set S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
            )
          }

          let acl: 'private' | 'public-read' | null

          if (rawACL === 'none') {
            acl = null
          } else if (rawACL === 'public-read' || rawACL === 'private') {
            acl = rawACL
          } else {
            throw new Error('Unsupported S3_ACL. Use "none", "public-read", or "private".')
          }

          return {
            provider: 's3' as const,
            acl,
            accessKeyId,
            bucket,
            clientUploads: parseBooleanEnv(env.S3_CLIENT_UPLOADS, false, 'S3_CLIENT_UPLOADS'),
            endpoint,
            forcePathStyle: parseBooleanEnv(env.S3_FORCE_PATH_STYLE, true, 'S3_FORCE_PATH_STYLE'),
            publicURL: normalizeMediaPublicURL(env.S3_PUBLIC_URL),
            region,
            secretAccessKey,
          }
        })()
      : {
          provider: 'localDisk' as const,
        }

  return {
    application: {
      origin: applicationOrigin,
    },
    auth: {
      allowFirstAdminCreation,
    },
    database: {
      url: mongodbURI,
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
      overrideRecipientAddress,
    },
    media,
    payload: {
      secret: payloadSecret,
    },
    operations: {
      mediaReconcileToken,
    },
  }
}

export const runtimeConfig = getRuntimeConfig()
