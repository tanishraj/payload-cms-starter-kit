import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { SiteLogo, type LogoMediaLike } from '@/components/site/SiteLogo'
import { Button } from '@/components/ui/button'
import { resolveHeaderLink } from '@/lib/headerNavigation'
import { getPageHref } from '@/lib/pagePaths'
import { cn } from '@/lib/utils'
import type { Footer56Block as Footer56BlockType, Page } from '@/payload-types'

type Footer56BlockComponentProps = Footer56BlockType & {
  appearance?: BlockAppearance | null
  privacyPolicyPage?: Page | null
  siteAddress?: string | null
  siteEmail?: string | null
  siteLogo?: LogoMediaLike
  siteName?: string | null
  sitePhone?: string | null
  termsAndConditionsPage?: Page | null
  siteSocialLinks?: {
    facebook?: string | null
    instagram?: string | null
    linkedin?: string | null
    youtube?: string | null
  } | null
}

const socialIconByPlatform = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
} as const

const footerLinkListItemClasses =
  'text-foreground/80 transition-colors hover:text-primary focus-visible:text-primary'

export function Footer56BlockComponent({
  appearance,
  bottomLinks,
  copyrightText,
  ctaButtons,
  customLogoDark,
  customLogoLight,
  description,
  linkGroups,
  logoHeight,
  logoMode = 'siteDefault',
  privacyPolicyPage,
  siteAddress,
  siteEmail,
  siteLogo,
  siteName,
  sitePhone,
  termsAndConditionsPage,
  siteSocialLinks,
}: Footer56BlockComponentProps) {
  const resolvedCtas = (ctaButtons ?? [])
    .map((button) => {
      const link = resolveHeaderLink(button)

      if (!link) {
        return null
      }

      return {
        ...link,
        variant: button.variant ?? 'outline',
      }
    })
    .filter((button): button is NonNullable<typeof button> => button !== null)

  const termsHref = getPageHref(termsAndConditionsPage)
  const privacyHref = getPageHref(privacyPolicyPage)

  const resolvedBottomLinks = [
    ...(bottomLinks ?? [])
      .map((link) => resolveHeaderLink(link))
      .filter((link): link is NonNullable<typeof link> => link !== null),
    ...(termsHref ? [{ href: termsHref, label: 'Terms and Conditions', newTab: false }] : []),
    ...(privacyHref ? [{ href: privacyHref, label: 'Privacy Policy', newTab: false }] : []),
  ]

  const resolvedLinkGroups = (linkGroups ?? [])
    .map((group) => ({
      links: (group.links ?? [])
        .map((link) => resolveHeaderLink(link))
        .filter((link): link is NonNullable<typeof link> => link !== null),
      title: group.title?.trim() ?? '',
    }))
    .filter((group) => group.title && group.links.length > 0)

  const fallbackName = siteName?.trim() || 'Site'
  const resolvedLogoHeight = Math.max(20, logoHeight ?? 32)
  const resolvedSiteSocialLinks = Object.entries(siteSocialLinks ?? {})
    .filter((entry): entry is [keyof typeof socialIconByPlatform, string] => {
      const [platform, url] = entry

      return platform in socialIconByPlatform && typeof url === 'string' && url.trim().length > 0
    })
    .map(([platform, url]) => ({ platform, url: url.trim() }))
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  return (
    <section
      className={cn('text-sm', appearanceClasses.className)}
      data-footer56-background={appearance?.background ?? 'none'}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 border-b border-border/70 pb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-6">
            <Link
              aria-label={`Go to ${fallbackName} home page`}
              className="inline-flex items-center"
              href="/"
            >
              <SiteLogo
                customDark={customLogoDark}
                customLight={customLogoLight}
                fallbackText={fallbackName}
                height={resolvedLogoHeight}
                mode={logoMode}
                siteLogo={siteLogo}
              />
            </Link>
            {description ? (
              <p className="max-w-[34ch] text-sm leading-6 text-current/80">{description}</p>
            ) : null}
            {siteAddress || sitePhone || siteEmail ? (
              <div className="flex flex-col gap-3">
                {siteAddress ? (
                  <div className="flex items-start gap-2.5 text-sm leading-6 text-current/75">
                    <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />
                    <p className="max-w-[34ch] whitespace-pre-line">{siteAddress}</p>
                  </div>
                ) : null}
                {sitePhone ? (
                  <div className="flex items-start gap-2.5 text-sm leading-6 text-current/75">
                    <Phone aria-hidden="true" className="mt-1 size-4 shrink-0" />
                    <a
                      className="transition-opacity hover:opacity-70 focus-visible:opacity-70"
                      href={`tel:${sitePhone}`}
                    >
                      {sitePhone}
                    </a>
                  </div>
                ) : null}
                {siteEmail ? (
                  <div className="flex items-start gap-2.5 text-sm leading-6 text-current/75">
                    <Mail aria-hidden="true" className="mt-1 size-4 shrink-0" />
                    <a
                      className="transition-opacity hover:opacity-70 focus-visible:opacity-70"
                      href={`mailto:${siteEmail}`}
                    >
                      {siteEmail}
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
            {resolvedSiteSocialLinks.length ? (
              <ul className="flex flex-wrap gap-4">
                {resolvedSiteSocialLinks.map(({ platform, url }) => {
                  const Icon = socialIconByPlatform[platform]

                  return (
                    <li key={platform}>
                      <a
                        aria-label={`${fallbackName} on ${platform}`}
                        className="inline-flex items-center justify-center text-current/70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                        href={url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
            {resolvedCtas.length ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {resolvedCtas.map((button) => (
                  <Button asChild key={`${button.label}-${button.href}`} variant={button.variant}>
                    <a
                      href={button.href}
                      rel={button.newTab ? 'noreferrer' : undefined}
                      target={button.newTab ? '_blank' : undefined}
                    >
                      {button.label}
                    </a>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {resolvedLinkGroups.map((group, groupIndex) => (
              <div className="flex flex-col gap-4" key={`${group.title}-${groupIndex}`}>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-current/75">
                  {group.title}
                </h3>
                <ul className="flex flex-col gap-3 text-sm">
                  {group.links.map((link, linkIndex) => (
                    <li key={`${group.title}-${link.href}-${linkIndex}`}>
                      <a
                        className={footerLinkListItemClasses}
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
        </div>

        <div className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            {copyrightText ? (
              <p className="text-xs font-normal text-current/65">{copyrightText}</p>
            ) : null}
          </div>
          {resolvedBottomLinks.length ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:justify-end">
              {resolvedBottomLinks.map((link, linkIndex) => (
                <li key={`${link.href}-${linkIndex}`}>
                  <a
                    className="transition-opacity hover:opacity-70 focus-visible:opacity-70"
                    href={link.href}
                    rel={link.newTab ? 'noreferrer' : undefined}
                    target={link.newTab ? '_blank' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
