'use client'

import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { ActionButtonContent } from '@/components/ActionButtonContent'
import { ContentLink } from '@/components/ContentLink'
import { Button } from '@/components/ui/button'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export type CarouselSlide = {
  backgroundImageAlt?: string
  backgroundImageSrc?: string
  backgroundVideoUrl?: string
  buttons?: Array<{
    href: string
    label: string
    openInNewTab?: boolean
    showArrow: boolean
    variant?: 'default' | 'link' | 'outline' | 'secondary'
  }>
  description?: string | null
  eyebrow?: string | null
  id?: string
  title?: string | null
}

export type HeroCarouselContentAlignment = 'left' | 'center' | 'right'

type HeroCarouselClientProps = {
  autoplay?: boolean
  contentAlignment?: HeroCarouselContentAlignment
  height?: 'compact' | 'default' | 'immersive'
  overlayStyle?: 'light' | 'dark' | 'darker'
  showArrows?: boolean
  showDots?: boolean
  slides: CarouselSlide[]
}

const heightClasses = {
  compact: 'min-h-[50dvh]',
  default: 'min-h-[70dvh]',
  immersive: 'h-dvh min-h-[42.5rem]',
} as const

const overlayClasses = {
  light: 'bg-black/30',
  dark: 'bg-black/50',
  darker: 'bg-black/72',
} as const

const contentAlignmentClasses = {
  left: {
    actions: 'justify-start',
    container: 'justify-start',
    content: 'items-start text-left',
  },
  center: {
    actions: 'justify-center',
    container: 'justify-center',
    content: 'items-center text-center',
  },
  right: {
    actions: 'justify-end',
    container: 'justify-end',
    content: 'items-end text-right',
  },
} as const

export function HeroCarouselClient({
  autoplay = true,
  contentAlignment = 'left',
  height = 'default',
  overlayStyle = 'dark',
  showArrows = true,
  showDots = true,
  slides,
}: HeroCarouselClientProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const plugins = useMemo(
    () => (autoplay && slides.length > 1 ? [Autoplay({ delay: 6000 })] : undefined),
    [autoplay, slides.length],
  )

  useEffect(() => {
    if (!api) return

    const updateSelection = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setScrollSnaps(api.scrollSnapList())
    }

    updateSelection()
    api.on('reInit', updateSelection).on('select', updateSelection)

    return () => {
      api.off('reInit', updateSelection).off('select', updateSelection)
    }
  }, [api])

  if (slides.length === 0) return null

  return (
    <Carousel
      className="overflow-hidden"
      opts={{ loop: slides.length > 1 }}
      plugins={plugins}
      setApi={setApi}
    >
      <CarouselContent className="ml-0">
        {slides.map((slide, index) => {
          const Heading = index === 0 ? 'h1' : 'h2'

          return (
            <CarouselItem
              className="pl-0"
              key={slide.id ?? slide.backgroundVideoUrl ?? slide.backgroundImageSrc ?? index}
            >
              <div
                className={cn(
                  'group relative flex items-center overflow-hidden px-4 py-24 md:px-12 lg:px-40',
                  heightClasses[height],
                )}
                data-hero-carousel-slide={index}
              >
                <div className="absolute inset-0">
                  {slide.backgroundVideoUrl ? (
                    <video
                      autoPlay
                      className="size-full object-cover object-center"
                      loop
                      muted
                      playsInline
                      src={slide.backgroundVideoUrl}
                    />
                  ) : slide.backgroundImageSrc ? (
                    <Image
                      fill
                      alt={slide.backgroundImageAlt ?? ''}
                      className="object-cover object-center"
                      priority={index === 0}
                      sizes="100vw"
                      src={slide.backgroundImageSrc}
                    />
                  ) : null}
                  <div className={cn('absolute inset-0', overlayClasses[overlayStyle])} />
                </div>

                <div
                  className={cn(
                    'relative mx-auto flex w-full max-w-screen-2xl',
                    contentAlignmentClasses[contentAlignment].container,
                  )}
                >
                  <div
                    className={cn(
                      'flex max-w-3xl flex-col gap-4 text-white',
                      contentAlignmentClasses[contentAlignment].content,
                    )}
                  >
                    {slide.eyebrow ? (
                      <SectionEyebrow
                        className="tracking-[0.28em] text-white/75"
                        surface="darkOverlay"
                      >
                        {slide.eyebrow}
                      </SectionEyebrow>
                    ) : null}
                    {slide.title ? (
                      <Heading className="font-serif font-semibold text-5xl leading-none tracking-tight text-balance md:text-6xl lg:text-7xl">
                        {slide.title}
                      </Heading>
                    ) : null}
                    {slide.description ? (
                      <p className="max-w-2xl text-base leading-7 text-balance text-white/85 lg:text-lg">
                        {slide.description}
                      </p>
                    ) : null}
                    {slide.buttons?.length ? (
                      <div
                        className={cn(
                          'mt-1 flex flex-wrap gap-3',
                          contentAlignmentClasses[contentAlignment].actions,
                        )}
                      >
                        {slide.buttons.map((button) =>
                          button.variant === 'link' ? (
                            <ContentLink
                              className="text-white"
                              href={button.href}
                              key={`${button.label}-${button.href}`}
                              label={button.label}
                              openInNewTab={button.openInNewTab}
                            />
                          ) : (
                            <Button
                              asChild
                              key={`${button.label}-${button.href}`}
                              size="lg"
                              variant={button.variant ?? 'secondary'}
                            >
                              <a
                                href={button.href}
                                rel={button.openInNewTab ? 'noreferrer' : undefined}
                                target={button.openInNewTab ? '_blank' : undefined}
                              >
                                <ActionButtonContent
                                  label={button.label}
                                  showArrow={button.showArrow}
                                />
                              </a>
                            </Button>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </CarouselItem>
          )
        })}
      </CarouselContent>

      {showArrows && slides.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-4 md:px-8 lg:px-12">
          <Button
            aria-label="Previous slide"
            className="pointer-events-auto"
            onClick={() => api?.scrollPrev()}
            size="icon-lg"
            variant="secondary"
          >
            <ChevronLeft data-icon="inline-start" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            aria-label="Next slide"
            className="pointer-events-auto"
            onClick={() => api?.scrollNext()}
            size="icon-lg"
            variant="secondary"
          >
            <ChevronRight data-icon="inline-start" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      ) : null}

      {showDots && slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3">
          {scrollSnaps.map((_, index) => (
            <button
              aria-current={selectedIndex === index ? 'true' : undefined}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                'size-2.5 rounded-md border border-white transition-colors',
                selectedIndex === index ? 'bg-white' : 'bg-transparent',
              )}
              key={index}
              onClick={() => api?.scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </Carousel>
  )
}
