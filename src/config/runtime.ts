export type RuntimeConfig = {
  database:
    | {
        provider: 'sqlite'
        url: string
      }
    | {
        provider: 'postgres'
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
}

const isPostgresConnectionString = (value: string): boolean =>
  value.startsWith('postgres://') || value.startsWith('postgresql://')

const getDatabaseProvider = (env: NodeJS.ProcessEnv): 'sqlite' | 'postgres' => {
  if (!env.DATABASE_PROVIDER || env.DATABASE_PROVIDER === 'sqlite') {
    return 'sqlite'
  }

  if (env.DATABASE_PROVIDER === 'postgres') {
    return 'postgres'
  }

  throw new Error('Unsupported DATABASE_PROVIDER. Use "sqlite" or "postgres".')
}

export const getRuntimeConfig = (env: NodeJS.ProcessEnv = process.env): RuntimeConfig => {
  const databaseProvider = getDatabaseProvider(env)
  const isProduction = env.NODE_ENV === 'production'
  const isVercel = Boolean(env.VERCEL)
  const postgresUrl = env.POSTGRES_URL || env.DATABASE_URL || ''

  const database =
    databaseProvider === 'postgres'
      ? (() => {
          if (!postgresUrl || !isPostgresConnectionString(postgresUrl)) {
            throw new Error('Missing Postgres connection string. Set POSTGRES_URL or DATABASE_URL.')
          }

          return {
            provider: 'postgres' as const,
            url: postgresUrl,
          }
        })()
      : (() => {
          if (!env.DATABASE_URL) {
            throw new Error('Missing SQLite DATABASE_URL. Set DATABASE_URL to a local file path.')
          }

          if (isVercel && isProduction) {
            throw new Error(
              'SQLite is only supported for local development. Use DATABASE_PROVIDER=postgres on Vercel.',
            )
          }

          return {
            provider: 'sqlite' as const,
            url: env.DATABASE_URL,
          }
        })()

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

  return {
    database,
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
  }
}
