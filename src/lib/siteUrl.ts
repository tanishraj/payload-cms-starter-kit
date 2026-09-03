import type { RuntimeConfig } from '@/config/runtime'
import { publicApplicationOrigin } from '@/config/publicOrigin'

export const getApplicationOrigin = (config: Pick<RuntimeConfig, 'application'>): string =>
  config.application.origin

export const buildLivePreviewURL = (
  pathname: string,
  config: Pick<RuntimeConfig, 'application'>,
): string => new URL(pathname, `${getApplicationOrigin(config)}/`).toString()

export const getSiteURL = (): string => {
  return publicApplicationOrigin
}

export const toAbsoluteSiteUrl = (pathname: string): string => {
  return new URL(pathname, `${getSiteURL()}/`).toString()
}
