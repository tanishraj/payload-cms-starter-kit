'use client'

import Image from 'next/image'
import { useRef } from 'react'
import {
  Award,
  BarChart2,
  Code2,
  Eye,
  Globe,
  Layers,
  Lock,
  Mic,
  Music,
  Play,
  Rocket,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import {
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BarChart2,
  Code2,
  Eye,
  Globe,
  Layers,
  Lock,
  Mic,
  Music,
  Play,
  Rocket,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
}

export type MediaCarouselItem = {
  id: string | number
  mediaType: 'video' | 'image'
  src: string
  alt: string
  width?: number
  height?: number
  icon?: string
  title: string
  summary?: string
  href?: string
  openInNewTab?: boolean
}

type MediaCarouselClientProps = {
  appearance?: string
  contentAlignment: 'left' | 'center'
  description?: string
  eyebrow?: string
  items: MediaCarouselItem[]
  size: RegularBlockSize
  title: string
}

function MediaCard({ item }: { item: MediaCarouselItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const Icon = item.icon ? ICON_MAP[item.icon] : undefined

  const cardInner = (
    <Card className="h-full min-h-[22rem] bg-muted p-6 shadow-none transition-all group-hover:shadow-md">
      <CardContent className="p-0">
        <div className="relative">
          <div className="relative aspect-video overflow-hidden rounded-lg">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </div>
          {Icon ? (
            <div className="absolute -left-2 -top-3 flex size-9 items-center justify-center rounded-lg bg-primary">
              <Icon className="size-4 text-primary-foreground" />
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <CardTitle className="text-lg font-medium leading-snug tracking-tight text-foreground">
            {item.title}
          </CardTitle>
          {item.summary ? (
            <CardDescription className="text-sm leading-relaxed">{item.summary}</CardDescription>
          ) : null}
        </div>
      </CardContent>
    </Card>
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

  if (item.href) {
    return (
      <a
        href={item.href}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        className="group block h-full"
        {...videoHandlers}
      >
        {cardInner}
      </a>
    )
  }

  return (
    <div className="group h-full" {...videoHandlers}>
      {cardInner}
    </div>
  )
}

export function MediaCarouselClient({
  appearance,
  contentAlignment,
  description,
  eyebrow,
  items,
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
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            {title}
          </h2>
          {description ? (
            <p className="text-lg text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent className="py-4">
            {items.map((item) => (
              <CarouselItem
                key={String(item.id)}
                className="basis-full md:basis-1/2 lg:basis-1/3"
              >
                <MediaCard item={item} />
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
