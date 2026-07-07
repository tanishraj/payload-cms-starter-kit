import { Navbar12 } from '@/components/navbar12'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type {
  HeaderNavbar12Block as HeaderNavbar12BlockData,
  SiteSetting,
} from '@/payload-types'
import { resolveNavigationLink } from '@/lib/navigationLinks'
import { resolveHeaderNavigationItems } from '@/lib/navigationStructures'

type NavbarLink = {
  openInNewTab?: boolean
  title: string
  url?: string
  description?: string
  items?: NavbarLink[]
}

type SecondaryAction = NonNullable<HeaderNavbar12BlockData['secondaryActions']>[number]

const mapAction = (
  item:
    | SecondaryAction
    | HeaderNavbar12BlockData['cta']
    | null
    | undefined,
) => {
  if (!item) {
    return null
  }

  const { href, openInNewTab, title } = resolveNavigationLink(item.link)

  if (!href || !(item.label?.trim() || title)) {
    return null
  }

  return {
    title: item.label?.trim() || title || '',
    url: href,
    openInNewTab,
  }
}

export function HeaderNavbar12BlockComponent({
  block,
  siteSettings,
}: {
  block: HeaderNavbar12BlockData
  siteSettings: SiteSetting
}) {
  const siteLogo = isMediaDoc(siteSettings.logo) ? siteSettings.logo : null
  const customLogo = isMediaDoc(block.customLogo) ? block.customLogo : null
  const logoImage = block.logoMode === 'customLogo' ? customLogo ?? siteLogo : siteLogo ?? customLogo
  const resolvedLogoImage = getMediaImageProps({
    media: logoImage,
    preset: 'logo',
    fallbackAlt: siteSettings.siteName || 'Site logo',
  })
  const logo =
    resolvedLogoImage
      ? {
          url: '/',
          src: resolvedLogoImage.src,
          alt: resolvedLogoImage.alt,
        }
      : undefined

  const navigationItems = resolveHeaderNavigationItems(block)

  const secondaryButtons = (block.secondaryActions ?? [])
    .map((item) => mapAction(item))
    .filter((item): item is NonNullable<ReturnType<typeof mapAction>> => item !== null)

  const primaryButton =
    block.cta?.enabled === false ? null : mapAction(block.cta ?? null)

  return (
    <Navbar12
      logo={logo}
      navigationItems={navigationItems}
      secondaryButtons={secondaryButtons}
      primaryButton={primaryButton}
    />
  )
}
