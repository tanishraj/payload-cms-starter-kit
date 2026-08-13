import Image from 'next/image'
import Link from 'next/link'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { resolveSiteSocialLinks, type SiteSocialLinks } from '@/blocks/shared/siteSocialLinks'
import { type LogoMediaLike } from '@/components/site/SiteLogo'
import { resolveHeaderLink } from '@/lib/headerNavigation'
import { getMediaImageProps } from '@/lib/media'
import { getPageHref } from '@/lib/pagePaths'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type FooterMinimalLink = {
  label?: string | null
  linkType?: 'custom' | 'page' | null
  openInNewTab?: boolean | null
  page?: unknown
  url?: string | null
}

type FooterMinimalLinkGroup = {
  includeSiteContact?: boolean | null
  links?: FooterMinimalLink[] | null
  title?: string | null
}

type FooterMinimalBlockLike = {
  appearance?: BlockAppearance | null
  bottomLinks?: FooterMinimalLink[] | null
  copyrightText?: string | null
  customLogo?: unknown
  description?: string | null
  linkGroups?: FooterMinimalLinkGroup[] | null
  logoHeight?: number | null
  logoMode?: 'customLogo' | 'nameOnly' | 'siteDefault' | null
  privacyPolicyPage?: Page | null
  showSiteName?: boolean | null
  showSocialLinks?: boolean | null
  siteAddress?: string | null
  siteEmail?: string | null
  siteLogo?: LogoMediaLike
  siteName?: string | null
  sitePhone?: string | null
  siteSocialLinks?: SiteSocialLinks
  size?: RegularBlockSize | null
  socialIconStyle?: 'plain' | 'tile' | null
  socialPlacement?: 'bottomBar' | 'brand' | null
  termsAndConditionsPage?: Page | null
}

// tel: only tolerates digits and a leading +, so strip the display formatting.
const toTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// A leading + then digits and the usual separators, long enough to be a number.
const phonePattern = /^\+?[\d][\d\s()./-]{5,}$/

/**
 * A contact row typed as a plain custom URL would otherwise render as a relative
 * link and go nowhere, so promote bare emails and phone numbers to mailto: and
 * tel:. Anything already carrying a scheme, or looking like a path, is untouched.
 */
const toContactHref = (href: string) => {
  if (href.includes(':') || href.startsWith('/') || href.startsWith('#')) {
    return href
  }

  if (emailPattern.test(href)) {
    return `mailto:${href}`
  }

  if (phonePattern.test(href)) {
    return toTelHref(href)
  }

  return href
}

const resolveLinks = (links?: FooterMinimalLink[] | null) =>
  (links ?? []).flatMap((link) => {
    const resolved = resolveHeaderLink(link as never)

    return resolved ? [{ ...resolved, href: toContactHref(resolved.href) }] : []
  })

export function FooterMinimalBlockComponent({
  appearance,
  bottomLinks,
  copyrightText,
  customLogo,
  description,
  linkGroups,
  logoHeight,
  logoMode = 'siteDefault',
  privacyPolicyPage,
  showSiteName = true,
  showSocialLinks = true,
  siteAddress,
  siteEmail,
  siteLogo,
  siteName,
  sitePhone,
  siteSocialLinks,
  size = 'default',
  socialIconStyle = 'tile',
  socialPlacement = 'brand',
  termsAndConditionsPage,
}: FooterMinimalBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedSiteName = siteName?.trim()
  const resolvedLogoHeight = typeof logoHeight === 'number' ? logoHeight : 44

  const logo =
    logoMode === 'nameOnly'
      ? undefined
      : getMediaImageProps({
          media: (logoMode === 'customLogo' ? customLogo : siteLogo) as never,
          preset: 'logo',
          fallbackAlt: resolvedSiteName ?? 'Logo',
        })

  // Falls back to the Site Settings address so the column is never left empty.
  const bodyLines = (description?.trim() || siteAddress?.trim() || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const resolvedPhone = sitePhone?.trim()
  const resolvedEmail = siteEmail?.trim()

  const groups = (linkGroups ?? []).flatMap((group) => {
    const title = group.title?.trim()
    // Site contact details lead the column, ahead of any manual links.
    const contactLinks = group.includeSiteContact
      ? [
          ...(resolvedPhone
            ? [{ href: toTelHref(resolvedPhone), label: resolvedPhone, newTab: false }]
            : []),
          ...(resolvedEmail
            ? [{ href: `mailto:${resolvedEmail}`, label: resolvedEmail, newTab: false }]
            : []),
        ]
      : []
    const links = [...contactLinks, ...resolveLinks(group.links)]

    return title && links.length ? [{ links, title }] : []
  })

  // Both legal links are driven by Site Settings, under fixed labels so the
  // wording stays consistent no matter what those pages are titled. Editors who
  // also added them by hand would otherwise see them twice, so match on href.
  const manualLegalLinks = resolveLinks(bottomLinks)
  const linkedHrefs = new Set(manualLegalLinks.map((link) => link.href))

  const legalPageLinks = (
    [
      [termsAndConditionsPage, 'Terms & Conditions'],
      [privacyPolicyPage, 'Privacy Policy'],
    ] as const
  ).flatMap(([page, label]) => {
    const href = getPageHref(page)

    if (!href || linkedHrefs.has(href)) {
      return []
    }

    linkedHrefs.add(href)

    return [{ href, label, newTab: false }]
  })

  const legalLinks = [...manualLegalLinks, ...legalPageLinks]

  const socialLinks = showSocialLinks === false ? [] : resolveSiteSocialLinks(siteSocialLinks)
  const resolvedCopyright = copyrightText?.trim() || resolvedSiteName

  // Tinting from `currentColor` keeps the tiles legible on both the navy brand
  // surface and a light one, without branching on the surface.
  const socialList =
    socialLinks.length > 0 ? (
      <ul className="flex flex-wrap items-center gap-3" data-footer-minimal-social="true">
        {socialLinks.map(({ Icon, href, label, platform }) => (
          <li key={platform}>
            <a
              aria-label={label}
              className={cn(
                'inline-flex items-center justify-center transition-colors',
                socialIconStyle === 'tile'
                  ? 'size-10 rounded-[var(--radius)] bg-current/10 text-current hover:bg-current/20'
                  : 'text-current/70 hover:text-current',
              )}
              data-footer-minimal-social-link={platform}
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    ) : null

  return (
    <footer
      className={cn(
        regularBlockMobilePaddingClasses[size ?? 'default'],
        appearanceClasses.className,
      )}
      data-footer-minimal-background={appearanceClasses.background}
      data-footer-minimal-block="true"
    >
      <div className={regularBlockContainerClasses}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="flex flex-col gap-6" data-footer-minimal-brand="true">
            <Link className="inline-flex items-center gap-4" href="/">
              {logo ? (
                <Image
                  alt={logo.alt}
                  className="h-auto w-auto"
                  height={resolvedLogoHeight}
                  src={logo.src}
                  style={{ height: resolvedLogoHeight, objectFit: 'contain', width: 'auto' }}
                  width={logo.width ?? 160}
                />
              ) : null}
              {showSiteName !== false && resolvedSiteName ? (
                <span className="max-w-[18ch] text-sm font-semibold uppercase leading-snug tracking-wide text-current">
                  {resolvedSiteName}
                </span>
              ) : null}
            </Link>

            {bodyLines.length > 0 ? (
              <div className="flex flex-col gap-1 text-sm leading-6 text-current/70">
                {bodyLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            {socialPlacement !== 'bottomBar' ? socialList : null}
          </div>

          {groups.map((group) => (
            <div key={group.title} data-footer-minimal-group="true">
              <h2 className="text-sm font-semibold text-current">{group.title}</h2>
              <ul className="mt-5 flex flex-col gap-3 text-sm">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}-${link.label}`}>
                    <a
                      className="text-current/70 transition-colors hover:text-current"
                      href={link.href}
                      rel={link.newTab ? 'noreferrer' : undefined}
                      target={link.newTab ? '_blank' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {resolvedCopyright || legalLinks.length > 0 || socialPlacement === 'bottomBar' ? (
          <div
            className="mt-12 flex flex-col gap-4 border-t border-current/15 pt-6 text-xs md:flex-row md:items-center md:justify-between"
            data-footer-minimal-bottom-bar="true"
          >
            {resolvedCopyright ? <p className="text-current/60">{resolvedCopyright}</p> : <span />}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {socialPlacement === 'bottomBar' ? socialList : null}
              {legalLinks.length > 0 ? (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {legalLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <a
                        className="text-current/60 transition-colors hover:text-current"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  )
}
