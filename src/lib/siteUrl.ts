import type { RuntimeConfig } from '@/config/runtime'

const fallbackSiteURL = 'http://localhost:3000'

export const getApplicationOrigin = (config: Pick<RuntimeConfig, 'application'>): string =>
  config.application.origin

export const buildLivePreviewURL = (
  pathname: string,
  config: Pick<RuntimeConfig, 'application'>,
): string => new URL(pathname, `${getApplicationOrigin(config)}/`).toString()

export const getSiteURL = (): string => {
  const configuredURL = process.env.NEXT_PUBLIC_SERVER_URL?.trim()

  if (!configuredURL) {
    return fallbackSiteURL
  }

  try {
    return new URL(configuredURL).origin
  } catch {
    return fallbackSiteURL
  }
}

export const toAbsoluteSiteUrl = (pathname: string): string => {
  return new URL(pathname, `${getSiteURL()}/`).toString()
}
