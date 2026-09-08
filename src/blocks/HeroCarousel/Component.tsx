import { getMediaImageProps } from '@/lib/media'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import type {
  MediaOverlayCoverage,
  MediaOverlayDirection,
  MediaOverlayStrength,
  MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'

import {
  HeroCarouselClient,
  type CarouselSlide,
  type HeroCarouselContentAlignment,
} from './HeroCarouselClient'

export type SlideData = {
  backgroundImage?: unknown
  backgroundVideoUrl?: string | null
  eyebrow?: string | null
  id?: string | null
  title?: string | null
  description?: string | null
  buttons?: CmsActionValue[] | null
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

    const buttons = resolveCmsActions(
      slide.buttons?.map((button) => ({
        ...button,
        variant: button.variant ?? 'secondary',
      })),
      'button',
    )

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
  overlayCoverage?: MediaOverlayCoverage | null
  overlayDirection?: MediaOverlayDirection | null
  overlayStyle?: MediaOverlayStrength | null
  showArrows?: boolean | null
  showDots?: boolean | null
  showPauseControl?: boolean | null
  slides?: SlideData[] | null
  themeMode?: MediaOverlayTone | null
}

export function HeroCarouselBlockComponent({
  slides,
  themeMode = 'auto',
  overlayStyle = 'dark',
  overlayDirection = 'vertical',
  overlayCoverage = 'full',
  height = 'default',
  contentAlignment = 'left',
  autoplay = true,
  showArrows = true,
  showDots = true,
  showPauseControl = false,
}: HeroCarouselBlockLike) {
  const resolvedSlides = resolveHeroCarouselSlides(slides)

  if (!resolvedSlides.length) return null

  return (
    <section
      data-hero-carousel="true"
      data-hero-carousel-alignment={contentAlignment ?? 'left'}
      data-hero-carousel-height={height ?? 'default'}
      data-hero-carousel-overlay-coverage={overlayCoverage ?? 'full'}
      data-hero-carousel-overlay-direction={overlayDirection ?? 'vertical'}
      data-hero-carousel-overlay={overlayStyle ?? 'dark'}
      data-hero-carousel-theme={themeMode ?? 'auto'}
    >
      <HeroCarouselClient
        autoplay={autoplay ?? true}
        contentAlignment={contentAlignment ?? 'left'}
        height={height ?? 'default'}
        overlayCoverage={overlayCoverage ?? 'full'}
        overlayDirection={overlayDirection ?? 'vertical'}
        overlayStyle={overlayStyle ?? 'dark'}
        showArrows={showArrows ?? true}
        showDots={showDots ?? true}
        showPauseControl={showPauseControl ?? false}
        slides={resolvedSlides}
        themeMode={themeMode ?? 'auto'}
      />
    </section>
  )
}
