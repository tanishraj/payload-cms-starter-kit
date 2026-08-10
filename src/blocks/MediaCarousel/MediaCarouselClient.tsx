'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Star, type LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { ContentLink } from '@/components/ContentLink'
import type { CmsActionVariant, ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'
import {
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'


export type MediaCarouselItem = {
  id: string | number
  mediaType: 'video' | 'image'
  src: string
  alt: string
  width?: number
  height?: number
  icon?: string
  title?: string | null
  summary?: string
  action?: ResolvedCmsAction
}

type MediaCarouselClientProps = {
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  appearance?: string
  columns: 2 | 3 | 4
  contentAlignment: 'left' | 'center'
  description?: string
  eyebrow?: string
  items: MediaCarouselItem[]
  sectionActions?: React.ReactNode
  size: RegularBlockSize
  title?: string | null
}

function MediaCard({
  item,
  actionMode,
  actionVariant,
}: {
  item: MediaCarouselItem
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const Icon = item.icon ? (((LucideIcons as Record<string, unknown>)[item.icon] as LucideIcon | undefined) ?? Star) : undefined

  const cardInner = (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="relative aspect-video w-full overflow-hidden">
        {item.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={item.src}
            className="block size-full object-cover object-center"
            controls={false}
            muted
            playsInline
            preload="none"
          />
        ) : (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        {Icon ? (
          <div className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-lg bg-primary">
            <Icon className="size-4 text-primary-foreground" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <p className="text-base font-semibold leading-snug tracking-tight text-current">
          {item.title}
        </p>
        {item.summary ? (
          <p className="text-sm leading-relaxed text-current/70">{item.summary}</p>
        ) : null}
        {item.action ? (
          <div className="mt-2">
            {actionMode === 'button' ? (
              <Button asChild size="sm" variant={actionVariant}>
                <a
                  href={item.action.href}
                  rel={item.action.openInNewTab ? 'noreferrer' : undefined}
                  target={item.action.openInNewTab ? '_blank' : undefined}
                >
                  {item.action.label}
                </a>
              </Button>
            ) : (
              <ContentLink
                href={item.action.href}
                label={item.action.label}
                openInNewTab={item.action.openInNewTab}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )

  const videoHandlers =
    item.mediaType === 'video'
      ? {
          onMouseEnter: () => videoRef.current?.play(),
          onMouseLeave: () => {
            if (videoRef.current) {
              videoRef.current.pause()
              videoRef.current.currentTime = 0
            }
          },
        }
      : {}

  return (
    <div className="group h-full" {...videoHandlers}>
      {cardInner}
    </div>
  )
}

export function MediaCarouselClient({
  actionMode = 'link',
  actionVariant = 'default',
  appearance,
  columns = 3,
  contentAlignment,
  description,
  eyebrow,
  items,
  sectionActions,
  size,
  title,
}: MediaCarouselClientProps) {
  return (
    <section className={cn(regularBlockMobilePaddingClasses[size], appearance)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div
          className={cn(
            'mb-12 flex flex-col gap-4',
            contentAlignment === 'center'
              ? 'mx-auto max-w-3xl items-center text-center'
              : 'items-start text-left',
          )}
        >
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="text-base leading-7 text-current/70">{description}</p>
          ) : null}
          {sectionActions ? <div className="mt-2">{sectionActions}</div> : null}
        </div>
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent className="py-4">
            {items.map((item, index) => (
              <CarouselItem
                key={`${String(item.id)}-${index}`}
                className={cn(
                  'basis-full sm:basis-1/2',
                  columns === 2 && 'lg:basis-1/2',
                  columns === 3 && 'lg:basis-1/3',
                  columns === 4 && 'lg:basis-1/4',
                )}
              >
                <MediaCard item={item} actionMode={actionMode} actionVariant={actionVariant} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-8 flex w-full justify-center gap-4">
            <CarouselPrevious className="static size-12" />
            <CarouselNext className="static size-12" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
