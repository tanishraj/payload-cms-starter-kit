import { getMediaImageProps } from '@/lib/media'
import { resolveCmsLink } from '@/lib/cmsLinks'
import type { Page } from '@/payload-types'

import {
  HeroCarouselClient,
  type CarouselSlide,
  type HeroCarouselContentAlignment,
} from './HeroCarouselClient'

type HeroButton = {
  label?: string | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  showArrow?: boolean | null
  url?: string | null
  variant?: 'default' | 'link' | 'outline' | 'secondary' | null
}

export type SlideData = {
  backgroundImage?: unknown
  backgroundVideoUrl?: string | null
  eyebrow?: string | null
  id?: string | null
  title?: string | null
  description?: string | null
  buttons?: HeroButton[] | null
}

export function resolveHeroCarouselSlides(slides?: SlideData[] | null): CarouselSlide[] {
  return (slides ?? []).flatMap((slide): CarouselSlide[] => {
    const image = getMediaImageProps({
      media: slide.backgroundImage as never,
      preset: 'hero',
      fallbackAlt: slide.title,
    })
    const videoUrl = slide.backgroundVideoUrl?.trim()

    if (!image && !videoUrl) {
      return []
    }

    const buttons = (slide.buttons ?? []).flatMap((button) => {
      const label = button.label?.trim()
      const link = resolveCmsLink(button)

      return label && link.href
        ? [
            {
              href: link.href,
              label,
              openInNewTab: link.openInNewTab,
              showArrow: Boolean(button.showArrow),
              variant: button.variant ?? 'secondary',
            },
          ]
        : []
    }) as CarouselSlide['buttons']

    return [
      {
        backgroundImageAlt: image?.alt,
        backgroundImageSrc: image?.src,
        backgroundVideoUrl: videoUrl || undefined,
        buttons,
        description: slide.description?.trim() || undefined,
        eyebrow: slide.eyebrow?.trim() || undefined,
        id: slide.id ?? undefined,
        title: slide.title?.trim() || undefined,
      },
    ]
  })
}

type HeroCarouselBlockLike = {
  autoplay?: boolean | null
  contentAlignment?: HeroCarouselContentAlignment | null
  height?: 'compact' | 'default' | 'immersive' | null
  overlayStyle?: 'light' | 'dark' | 'darker' | null
  showArrows?: boolean | null
  showDots?: boolean | null
  slides?: SlideData[] | null
}

export function HeroCarouselBlockComponent({
  slides,
  overlayStyle = 'dark',
  height = 'default',
  contentAlignment = 'left',
  autoplay = true,
  showArrows = true,
  showDots = true,
}: HeroCarouselBlockLike) {
  const resolvedSlides = resolveHeroCarouselSlides(slides)

  if (!resolvedSlides.length) return null

  return (
    <section
      data-hero-carousel="true"
      data-hero-carousel-alignment={contentAlignment ?? 'left'}
      data-hero-carousel-height={height ?? 'default'}
      data-hero-carousel-overlay={overlayStyle ?? 'dark'}
    >
      <HeroCarouselClient
        autoplay={autoplay ?? true}
        contentAlignment={contentAlignment ?? 'left'}
        height={height ?? 'default'}
        overlayStyle={overlayStyle ?? 'dark'}
        showArrows={showArrows ?? true}
        showDots={showDots ?? true}
        slides={resolvedSlides}
      />
    </section>
  )
}
