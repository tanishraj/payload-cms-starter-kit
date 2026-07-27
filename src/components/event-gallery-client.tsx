'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Images } from 'lucide-react'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'

import { EventGalleryViewer } from '@/components/event-gallery-viewer'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'

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
}

const subscribeToHydration = () => () => undefined
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

export function EventGalleryClient({ albums }: EventGalleryClientProps) {
  const [activeAlbum, setActiveAlbum] = useState<EventGalleryAlbum | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  )
  const shouldReduceMotion = isHydrated && Boolean(prefersReducedMotion)

  const closeViewer = useCallback(() => {
    setActiveAlbum(null)
    requestAnimationFrame(() => openerRef.current?.focus())
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2" data-event-gallery-grid="true">
        {albums.map((album, index) => {
          const eventDate = formatEventDate(album.eventDate)

          return (
            <motion.article
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
              className="group min-w-0 overflow-hidden rounded-md border border-border bg-background text-foreground"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
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
                className="block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                onClick={(event) => {
                  openerRef.current = event.currentTarget
                  setActiveAlbum(album)
                }}
                type="button"
              >
                <span className="relative block aspect-4/3 overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={album.cover.alt}
                    className="block size-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.03]"
                    decoding="async"
                    height={album.cover.height}
                    loading="lazy"
                    src={album.cover.src}
                    width={album.cover.width}
                  />
                </span>

                <span className="flex items-start justify-between gap-4 px-5 py-4">
                  <span className="min-w-0">
                    <span className="block text-lg leading-tight font-semibold tracking-tight">
                      {album.title}
                    </span>
                    {album.description ? (
                      <span className="mt-1 line-clamp-2 block text-sm leading-6 text-foreground/70">
                        {album.description}
                      </span>
                    ) : eventDate ? (
                      <span className="mt-1 block text-sm leading-6 text-foreground/70">
                        {eventDate}
                      </span>
                    ) : null}
                  </span>

                  <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold">
                    <Images aria-hidden="true" className="size-3.5" />
                    {album.imageCount}
                  </span>
                </span>
              </button>
            </motion.article>
          )
        })}
      </div>

      {activeAlbum ? (
        <EventGalleryViewer album={activeAlbum} onClose={closeViewer} />
      ) : null}
    </>
  )
}
