import Image from 'next/image'
import type { Media } from '@/payload-types'

export type LogoMediaLike =
  | {
      alt?: string | null
      height?: number | null
      url?: string | null
      width?: number | null
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

const getLogoImageProps = (
  media: LogoMediaLike | undefined,
  fallbackText: string,
  displayHeight: number,
) => {
  if (!media || typeof media !== 'object') {
    return undefined
  }

  const src = typeof media.url === 'string' && media.url.trim() ? media.url : undefined

  if (!src) {
    return undefined
  }

  const alt =
    (typeof media.alt === 'string' && media.alt.trim() ? media.alt.trim() : undefined) || fallbackText
  const sourceWidth = typeof media.width === 'number' && media.width > 0 ? media.width : null
  const sourceHeight = typeof media.height === 'number' && media.height > 0 ? media.height : null
  const fallbackSize = Math.max(1, Math.round(displayHeight))
  const width = sourceWidth ?? fallbackSize
  const height = sourceHeight ?? fallbackSize
  const renderedWidth =
    sourceWidth && sourceHeight
      ? Math.max(1, Math.round(displayHeight * (sourceWidth / sourceHeight)))
      : fallbackSize

  return {
    alt,
    height,
    sizes: `${renderedWidth}px`,
    src,
    width,
  }
}

export function SiteLogo({
  customDark,
  customLight,
  fallbackText,
  height,
  mode,
  siteLogo,
}: SiteLogoProps) {
  const lightLogo = mode === 'customLogo' ? customLight : siteLogo
  const darkLogo = mode === 'customLogo' ? customDark || customLight : siteLogo

  const lightImage = getLogoImageProps(lightLogo, fallbackText, height)
  const darkImage = getLogoImageProps(darkLogo, fallbackText, height)

  if (!lightImage) {
    return <span className="inline-flex items-center font-semibold tracking-tight text-foreground">{fallbackText}</span>
  }

  if (!darkImage || darkImage.src === lightImage.src) {
    return (
      <Image
        alt={lightImage.alt}
        className="block h-auto w-auto object-contain"
        src={lightImage.src}
        width={lightImage.width}
        height={lightImage.height}
        sizes={lightImage.sizes}
        style={{ height }}
      />
    )
  }

  return (
    <>
      <Image
        alt={lightImage.alt}
        className="block h-auto w-auto object-contain dark:hidden"
        src={lightImage.src}
        width={lightImage.width}
        height={lightImage.height}
        sizes={lightImage.sizes}
        style={{ height }}
      />
      <Image
        alt={darkImage.alt}
        className="hidden h-auto w-auto object-contain dark:block"
        src={darkImage.src}
        width={darkImage.width}
        height={darkImage.height}
        sizes={darkImage.sizes}
        style={{ height }}
      />
    </>
  )
}
