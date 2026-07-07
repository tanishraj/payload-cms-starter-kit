export type RuntimeConfig = {
  database: {
    provider: 'sqlite'
    url: string
  }
  email: {
    provider: 'resend' | 'none'
    apiKey: string | null
    fromAddress: string | null
    fromName: string
  }
}

export const getRuntimeConfig = (): RuntimeConfig => {
  const emailProvider =
    process.env.EMAIL_PROVIDER === 'resend' ||
    (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
      ? 'resend'
      : 'none'

  return {
    database: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || '',
    },
    email: {
      provider: emailProvider,
      apiKey: process.env.RESEND_API_KEY || null,
      fromAddress: process.env.RESEND_FROM_EMAIL || null,
      fromName: process.env.RESEND_FROM_NAME || 'Website',
    },
  }
}
