import type { NavigationLink, Page } from '@/payload-types'

import { resolveNavigationLink } from './navigationLinks'
import { getPageHref } from './pagePaths'

export type CmsLinkValue = {
  link?: string | number | NavigationLink | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: string | number | Page | null
  url?: string | null
}

export type CmsActionVariant = 'default' | 'outline' | 'secondary'

export type CmsActionValue = CmsLinkValue & {
  label?: string | null
  variant?: CmsActionVariant | null
}

export type ResolvedCmsAction = {
  href: string
  label: string
  openInNewTab?: boolean
  variant: CmsActionVariant
}

export const resolveCmsLink = (value: CmsLinkValue): { href?: string; openInNewTab?: boolean } => {
  const reusableLink = resolveNavigationLink(value.link)
  const legacyHref = value.linkType === 'page' ? getPageHref(value.page) : (value.url ?? undefined)
  const href = reusableLink.href ?? legacyHref

  if (!href) {
    return {}
  }

  return {
    href,
    openInNewTab: value.openInNewTab ?? reusableLink.openInNewTab ?? undefined,
  }
}

export const resolveCmsActions = (actions?: CmsActionValue[] | null): ResolvedCmsAction[] =>
  (actions ?? []).flatMap((action) => {
    const label = action.label?.trim()
    const destination = resolveCmsLink(action)

    return label && destination.href
      ? [
          {
            href: destination.href,
            label,
            openInNewTab: destination.openInNewTab,
            variant: action.variant ?? 'default',
          },
        ]
      : []
  })
