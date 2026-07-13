import { HeaderNavbar } from '@/components/header/HeaderNavbar'
import { SiteLogo, type LogoMediaLike } from '@/components/site/SiteLogo'
import { resolveHeaderLink, resolveHeaderMenuItems } from '@/lib/headerNavigation'
import type { HeaderNavbar12Block as HeaderNavbar12BlockType } from '@/payload-types'

type HeaderNavbar12BlockComponentProps = HeaderNavbar12BlockType & {
  siteLogo?: LogoMediaLike
  siteName?: string | null
}

export function HeaderNavbar12BlockComponent({
  ctaButtons,
  customLogoDark,
  customLogoLight,
  logoHeight,
  logoMode,
  menuItems,
  navAlignment,
  siteLogo,
  siteName,
  size,
}: HeaderNavbar12BlockComponentProps) {
  const resolvedMenuItems = resolveHeaderMenuItems(menuItems)
  const resolvedCtas = (ctaButtons ?? [])
    .map((item) => {
      const link = resolveHeaderLink(item)

      if (!link) {
        return null
      }

      return {
        ...link,
        variant: item.variant ?? 'default',
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const logo = (
    <a
      aria-label={`Go to ${siteName?.trim() || 'home page'}`}
      className="inline-flex items-center"
      href="/"
    >
      <SiteLogo
        customDark={customLogoDark}
        customLight={customLogoLight}
        fallbackText={siteName?.trim() || 'Site'}
        height={logoHeight ?? 32}
        mode={logoMode ?? 'siteDefault'}
        siteLogo={siteLogo}
      />
    </a>
  )

  return (
    <HeaderNavbar
      ctas={resolvedCtas}
      logo={logo}
      menuItems={resolvedMenuItems}
      navAlignment={navAlignment ?? 'center'}
      size={size ?? 'default'}
    />
  )
}
