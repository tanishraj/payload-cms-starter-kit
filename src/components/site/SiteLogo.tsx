import type { Media } from '@/payload-types'

export type LogoMediaLike =
  | {
      alt?: string | null
      url?: string | null
    }
  | Media
  | null
  | number
  | string

type SiteLogoProps = {
  customDark?: LogoMediaLike
  customLight?: LogoMediaLike
  fallbackText: string
  height: number
  mode: 'siteDefault' | 'customLogo'
  siteLogo?: LogoMediaLike
}

const getLogoImageProps = (media: LogoMediaLike | undefined, fallbackText: string) => {
  if (!media || typeof media !== 'object') {
    return undefined
  }

  const src = typeof media.url === 'string' && media.url.trim() ? media.url : undefined

  if (!src) {
    return undefined
  }

  const alt =
    (typeof media.alt === 'string' && media.alt.trim() ? media.alt.trim() : undefined) || fallbackText

  return {
    alt,
    src,
  }
}

export function SiteLogo({ customDark, customLight, fallbackText, height, mode, siteLogo }: SiteLogoProps) {
  const lightLogo = mode === 'customLogo' ? customLight : siteLogo
  const darkLogo = mode === 'customLogo' ? customDark || customLight : siteLogo

  const lightImage = getLogoImageProps(lightLogo, fallbackText)
  const darkImage = getLogoImageProps(darkLogo, fallbackText)

  if (!lightImage) {
    return <span className="inline-flex items-center font-semibold tracking-tight text-foreground">{fallbackText}</span>
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={lightImage.alt}
        className="block h-auto w-auto object-contain dark:hidden"
        src={lightImage.src}
        style={{ height }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={(darkImage ?? lightImage).alt}
        className="hidden h-auto w-auto object-contain dark:block"
        src={(darkImage ?? lightImage).src}
        style={{ height }}
      />
    </>
  )
}
