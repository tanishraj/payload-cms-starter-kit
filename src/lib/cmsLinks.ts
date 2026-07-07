import type { NavigationLink, Page } from '@/payload-types'

import { resolveNavigationLink } from './navigationLinks'
import { getPageHref } from './pagePaths'

export type CmsLinkValue = {
  link?: number | NavigationLink | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: number | Page | null
  url?: string | null
}

export const resolveCmsLink = (
  value: CmsLinkValue,
): { href?: string; openInNewTab?: boolean } => {
  const reusableLink = resolveNavigationLink(value.link)
  const legacyHref =
    value.linkType === 'page' ? getPageHref(value.page) : value.url ?? undefined
  const href = reusableLink.href ?? legacyHref

  if (!href) {
    return {}
  }

  return {
    href,
    openInNewTab: value.openInNewTab ?? reusableLink.openInNewTab ?? undefined,
  }
}
