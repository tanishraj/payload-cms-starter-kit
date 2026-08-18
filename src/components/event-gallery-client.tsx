'use client'

import Image from 'next/image'
import { Images } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'

import { EventGalleryViewer } from '@/components/event-gallery-viewer'
import type { EventGalleryResolvedOverlay } from '@/components/event-gallery'
import {
  getEventGalleryQuiltGridClassName,
  getEventGalleryQuiltRowSpanClassName,
  getEventGalleryQuiltRowSpans,
  type EventGalleryCardTextLayout,
} from '@/components/event-gallery-presentation'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'
import { cn } from '@/lib/utils'

const eventDateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

const formatEventDate = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : eventDateFormatter.format(date)
}

type EventGalleryClientProps = {
  albums: EventGalleryAlbum[]
  cardTextLayout?: EventGalleryCardTextLayout
  overlay: EventGalleryResolvedOverlay
  showCardOverlay?: boolean
  showEventDate?: boolean
  showImageCount?: boolean
}

const contentPositionClasses = {
  center: 'items-end justify-center text-center',
  middleCenter: 'items-center justify-center text-center',
  split: 'items-end justify-start text-left',
} as const satisfies Record<EventGalleryCardTextLayout, string>

type EventGalleryCardContentProps = {
  album: EventGalleryAlbum
  eventDate?: string
  layout: EventGalleryCardTextLayout
  overlay: EventGalleryResolvedOverlay
  showEventDate: boolean
  showImageCount: boolean
}

function EventGalleryCardContent({
  album,
  eventDate,
  layout,
  overlay,
  showEventDate,
  showImageCount,
}: EventGalleryCardContentProps) {
  const hasEventDate = showEventDate && Boolean(eventDate)
  const hasMetadata = showImageCount || hasEventDate
  const contentAlignment = layout === 'split' ? 'left' : 'center'
  const isLeftAligned = contentAlignment === 'left'

  return (
    <div
      className={cn('absolute inset-0 flex p-4 sm:p-5', contentPositionClasses[layout])}
      data-event-gallery-card-content="true"
      data-event-gallery-card-position={layout}
    >
      <div
        className={cn(
          'flex min-w-0 flex-col',
          layout === 'middleCenter' ? 'w-full max-w-sm' : 'w-full',
          isLeftAligned ? 'items-start text-left' : 'items-center text-center',
        )}
        data-event-gallery-content-alignment={contentAlignment}
      >
        {hasMetadata ? (
          <div
            className={cn(
              'mb-3 flex w-full flex-col gap-2 font-mono text-xs font-normal uppercase tracking-wider',
              isLeftAligned ? 'items-start text-left' : 'items-center text-center',
              overlay.text.eyebrow,
            )}
            data-event-gallery-card-meta="true"
            data-event-gallery-metadata-layout="stacked"
          >
            {showImageCount ? (
              <span
                aria-label={`${album.imageCount} ${album.imageCount === 1 ? 'image' : 'images'}`}
                className="inline-flex items-center justify-center gap-1.5"
                data-event-gallery-image-count="true"
              >
                <Images aria-hidden="true" className="size-3.5" />
                {album.imageCount}
              </span>
            ) : null}
            {hasEventDate ? <span className="max-w-full truncate">{eventDate}</span> : null}
          </div>
        ) : null}
        <p
          className={cn(
            'line-clamp-2 font-[family-name:var(--font-text)] text-lg font-semibold tracking-tight text-balance sm:text-xl',
            overlay.text.title,
            isLeftAligned ? 'max-w-md' : 'mx-auto max-w-md',
          )}
        >
          {album.title}
        </p>
      </div>
    </div>
  )
}

const subscribeToHydration = () => () => undefined
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

export function EventGalleryClient({
  albums,
  cardTextLayout = 'split',
  overlay,
  showCardOverlay = true,
  showEventDate = true,
  showImageCount = true,
}: EventGalleryClientProps) {
  const [activeAlbum, setActiveAlbum] = useState<EventGalleryAlbum | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  )
  const shouldReduceMotion = isHydrated && Boolean(prefersReducedMotion)
  const gridColumnsClassName = getEventGalleryQuiltGridClassName(albums.length)

  const closeViewer = useCallback(() => {
    setActiveAlbum(null)
    requestAnimationFrame(() => openerRef.current?.focus())
  }, [])

  return (
    <>
      <div
        className={cn(
          'grid auto-rows-56 gap-3 sm:auto-rows-60 sm:gap-4 lg:auto-rows-64 lg:gap-5',
          gridColumnsClassName,
        )}
        data-event-gallery-layout="rectangular-quilt"
      >
        {albums.map((album, index) => {
          const eventDate = formatEventDate(album.eventDate)
          const rowSpans = getEventGalleryQuiltRowSpans(albums.length, index)
          const rowSpanClassName = getEventGalleryQuiltRowSpanClassName(rowSpans)

          return (
            <motion.article
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
              className={cn('group min-h-0 min-w-0', rowSpanClassName)}
              data-event-gallery-row-span-lg={rowSpans.lg}
              data-event-gallery-row-span-sm={rowSpans.sm}
              data-event-gallery-row-span-xl={rowSpans.xl}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              key={album.id}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: Math.min(index * 0.08, 0.32), duration: 0.5 }
              }
              viewport={{ amount: 0.2, once: true }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            >
              <button
                aria-label={`Open ${album.title} gallery with ${album.imageCount} ${
                  album.imageCount === 1 ? 'image' : 'images'
                }`}
                className="block h-full w-full cursor-pointer overflow-hidden rounded-md border border-border text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                data-block-surface={overlay.blockSurface}
                onClick={(event) => {
                  openerRef.current = event.currentTarget
                  setActiveAlbum(album)
                }}
                type="button"
              >
                <div className="relative h-full min-h-0 w-full overflow-hidden">
                  <Image
                    fill
                    alt={album.cover.alt}
                    className="object-cover transition-transform duration-700 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.03]"
                    src={album.cover.src}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                  />

                  {showCardOverlay ? (
                    <>
                      <div
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none absolute',
                          overlay.frameClassName,
                          overlay.className,
                        )}
                        data-event-gallery-card-overlay="true"
                      />
                      <EventGalleryCardContent
                        album={album}
                        eventDate={eventDate}
                        layout={cardTextLayout}
                        overlay={overlay}
                        showEventDate={showEventDate}
                        showImageCount={showImageCount}
                      />
                    </>
                  ) : null}
                </div>
              </button>
            </motion.article>
          )
        })}
      </div>

      {activeAlbum ? <EventGalleryViewer album={activeAlbum} onClose={closeViewer} /> : null}
    </>
  )
}
