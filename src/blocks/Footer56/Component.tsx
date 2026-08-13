import type { Footer56Block as Footer56BlockType, Page } from '@/payload-types'

import { getMediaImageProps } from '@/lib/media'
import { resolveCmsActions } from '@/lib/cmsLinks'
import { getPageHref } from '@/lib/pagePaths'
import { resolveHeaderLink } from '@/lib/headerNavigation'
import { Footer56 } from '@/components/footer56'
import { type LogoMediaLike } from '@/components/site/SiteLogo'
import {
  resolveSiteSocialLinks,
  type SiteSocialLinks,
} from '@/blocks/shared/siteSocialLinks'

type FooterSection = {
  title: string
  links: {
    name: string
    href: string
  }[]
}

type FooterSocialLink = {
  icon: React.ReactElement
  href: string
  label: string
}

type Footer56BlockComponentProps = Footer56BlockType & {
  siteAddress?: string | null
  siteEmail?: string | null
  siteLogo?: LogoMediaLike
  siteName?: string | null
  sitePhone?: string | null
  privacyPolicyPage?: Page | null
  termsAndConditionsPage?: Page | null
  siteSocialLinks?: SiteSocialLinks
}

const resolveSections = (
  linkGroups?: Footer56BlockType['linkGroups'] | null,
) => {
  return (linkGroups ?? [])
    .map((group) => {
      const links = (group.links ?? [])
        .map((link) => resolveHeaderLink(link))
        .map((resolved) => (resolved ? { name: resolved.label, href: resolved.href } : null))
        .filter((link): link is { name: string; href: string } => Boolean(link))

      if (!group.title?.trim() || links.length === 0) {
        return null
      }

      return {
        title: group.title,
        links,
      }
    })
    .filter((group): group is FooterSection => group !== null)
}

const resolveSocialLinks = (siteSocialLinks?: SiteSocialLinks): FooterSocialLink[] =>
  resolveSiteSocialLinks(siteSocialLinks).map(({ Icon, href, label }) => ({
    href,
    icon: <Icon className="size-5" />,
    label,
  }))

const resolveLegalLinks = (
  bottomLinks?: Footer56BlockType['bottomLinks'],
  privacyPolicyPage?: Page | null,
  termsAndConditionsPage?: Page | null,
) => {
  const resolvedBottomLinks = (bottomLinks ?? [])
    .map((link) => resolveHeaderLink(link))
    .filter((link): link is NonNullable<ReturnType<typeof resolveHeaderLink>> => Boolean(link))
    .map((link) => ({ name: link.label, href: link.href }))

  const privacyHref = getPageHref(privacyPolicyPage)
  const termsHref = getPageHref(termsAndConditionsPage)

  return [
    ...resolvedBottomLinks,
    ...(termsHref ? [{ href: termsHref, name: 'Terms and Conditions' }] : []),
    ...(privacyHref ? [{ href: privacyHref, name: 'Privacy Policy' }] : []),
  ]
}

export function Footer56BlockComponent({
  bottomLinks,
  copyrightText,
  ctaButtons,
  customLogoDark,
  customLogoLight,
  description,
  linkGroups,
  appearance,
  logoHeight,
  logoMode = 'siteDefault',
  privacyPolicyPage,
  siteAddress,
  siteEmail,
  siteLogo,
  siteName,
  sitePhone,
  size,
  termsAndConditionsPage,
  siteSocialLinks,
}: Footer56BlockComponentProps) {
  const resolvedSiteName = siteName?.trim() || 'Shadcnblocks.com'
  const fallbackLogoHref = logoMode === 'customLogo' ? '/' : '/'
  const resolvedLogoHeight = typeof logoHeight === 'number' ? logoHeight : 28

  const resolvedLogo = (() => {
    const media = logoMode === 'customLogo' ? (customLogoLight ?? customLogoDark) : siteLogo

    const mediaProps = getMediaImageProps({
      media: media as never,
      preset: 'logo',
      fallbackAlt: siteName ?? 'Logo',
    })

    if (!mediaProps) {
      return undefined
    }

      return {
        alt: mediaProps.alt,
        src: mediaProps.src,
        title: resolvedSiteName,
        url: fallbackLogoHref,
        width: mediaProps.width,
        height: resolvedLogoHeight,
      }
    })()

  return (
    <Footer56
      // `ctaButtons` is a bespoke link array with no per-row display mode, and
      // these are buttons by definition, so force the mode here.
      actions={resolveCmsActions(ctaButtons, 'button')}
      addressLines={siteAddress?.split('\n').map((line) => line.trim()).filter(Boolean)}
      copyright={copyrightText ?? undefined}
      description={description ?? undefined}
      legalLinks={resolveLegalLinks(
        bottomLinks,
        privacyPolicyPage,
        termsAndConditionsPage,
      )}
      appearance={appearance}
      phone={sitePhone ?? undefined}
      email={siteEmail ?? undefined}
      size={size ?? 'default'}
      sections={resolveSections(linkGroups)}
      socialLinks={resolveSocialLinks(siteSocialLinks)}
      logo={
        resolvedLogo ?? {
          alt: resolvedSiteName,
          src: '/images/logo/shadcnblocks-logo-word.svg',
          title: resolvedSiteName,
          url: '/',
          width: 192,
          height: resolvedLogoHeight,
        }
      }
    />
  )
}
