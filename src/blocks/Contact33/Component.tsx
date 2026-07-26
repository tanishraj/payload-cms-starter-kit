import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { Contact33 } from '@/components/contact33'
import type { Contact33FormLike } from '@/lib/contact33Form'
import { getMediaImageProps } from '@/lib/media'
import type { Media } from '@/payload-types'

type Contact33BlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: 'center' | 'left' | 'right' | null
  description?: string | null
  eyebrow?: string | null
  form?: Contact33FormLike | number | string | null
  image?: unknown
  imageAlt?: string | null
  imagePosition?: 'left' | 'right' | null
  size?: 'comfortable' | 'compact' | 'default' | null
  title?: string | null
}

export function Contact33BlockComponent({
  appearance,
  contentAlignment = 'left',
  description,
  eyebrow,
  form,
  image,
  imageAlt,
  imagePosition = 'right',
  size = 'default',
  title,
}: Contact33BlockLike) {
  const resolvedTitle = title?.trim()
  const resolvedImageAlt = imageAlt?.trim()
  const resolvedImage = getMediaImageProps({
    fallbackAlt: resolvedImageAlt || resolvedTitle,
    media: image as Media | number | string | null,
    preset: 'generic',
  })
  const resolvedForm =
    form && typeof form === 'object' ? (form as Contact33FormLike) : null

  if (!resolvedTitle || !resolvedImage || !resolvedImageAlt) {
    return null
  }

  return (
    <Contact33
      appearance={appearance}
      contentAlignment={contentAlignment ?? 'left'}
      description={description?.trim()}
      eyebrow={eyebrow?.trim()}
      form={resolvedForm}
      image={{ ...resolvedImage, alt: resolvedImageAlt }}
      imagePosition={imagePosition ?? 'right'}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
