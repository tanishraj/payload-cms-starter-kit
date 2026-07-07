import { Footer2 } from '@/components/footer2'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Footer2Block as Footer2BlockData, SiteSetting } from '@/payload-types'
import { resolveNavigationLink } from '@/lib/navigationLinks'
import { resolveFooterSections } from '@/lib/navigationStructures'

export function Footer2BlockComponent({
  siteSettings,
  ...props
}: Footer2BlockData & {
  siteSettings: SiteSetting
}) {
  const siteLogo = isMediaDoc(siteSettings.logo) ? siteSettings.logo : null
  const customLogo = isMediaDoc(props.customLogo) ? props.customLogo : null
  const logoImage =
    props.logoMode === 'customLogo' ? customLogo ?? siteLogo : siteLogo ?? customLogo
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
          title: siteSettings.siteName || resolvedLogoImage.alt,
        }
      : undefined

  const sections = resolveFooterSections(props)

  const legalLinks = props.legalLinks?.flatMap((entry) => {
    const { href, openInNewTab, title } = resolveNavigationLink(entry.link)
    const name = entry.name?.trim() || title

    if (!href || !name) {
      return []
    }

    return [
      {
        name,
        href,
        openInNewTab,
      },
    ]
  })

  return (
    <Footer2
      logo={logo}
      description={props.description ?? undefined}
      sections={sections}
      copyright={props.copyright ?? undefined}
      legalLinks={legalLinks}
    />
  )
}
