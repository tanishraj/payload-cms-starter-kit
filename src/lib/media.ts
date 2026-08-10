import { getSiteURL } from '@/lib/siteUrl'
import type { Media } from '@/payload-types'

export type MediaPreset = 'favicon' | 'generic' | 'hero' | 'logo' | 'seo' | 'system'

type ResolvedMediaImage = {
  alt: string
  src: string
  width?: number
  height?: number
}

const defaultSiteURL = getSiteURL()

export const isMediaDoc = (value: string | number | Media | null | undefined): value is Media => {
  return typeof value === 'object' && value !== null
}

export const getMediaAbsoluteUrl = (
  media: string | number | Media | null | undefined,
): string | undefined => {
  if (!isMediaDoc(media) || !media.url) {
    return undefined
  }

  const url = media.url.trim()

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return new URL(url, defaultSiteURL).toString()
}

const getMediaAltFallback = (preset: MediaPreset): string => {
  switch (preset) {
    case 'favicon':
      return 'Favicon'
    case 'hero':
      return 'Hero image'
    case 'logo':
      return 'Site logo'
    case 'seo':
      return 'Social sharing image'
    case 'system':
      return 'System page image'
    default:
      return 'Media asset'
  }
}

export const getMediaImageProps = ({
  media,
  preset = 'generic',
  fallbackAlt,
}: {
  fallbackAlt?: string | null
  media: string | number | Media | null | undefined
  preset?: MediaPreset
}): ResolvedMediaImage | undefined => {
  const src = getMediaAbsoluteUrl(media)

  if (!src) {
    return undefined
  }

  const alt =
    (isMediaDoc(media) ? media.alt?.trim() : '') || fallbackAlt?.trim() || getMediaAltFallback(preset)

  return {
    alt,
    src,
    width: isMediaDoc(media) && typeof media.width === 'number' ? media.width : undefined,
    height: isMediaDoc(media) && typeof media.height === 'number' ? media.height : undefined,
  }
}
