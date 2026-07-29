'use client'

import { Images } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'

import { EventGalleryViewer } from '@/components/event-gallery-viewer'
import type { EventGalleryCardTextLayout } from '@/components/event-gallery'
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
  cardTextLayout?: EventGalleryCardTextLayout
}

const subscribeToHydration = () => () => undefined
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

export function EventGalleryClient({ albums, cardTextLayout = 'center' }: EventGalleryClientProps) {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-event-gallery-grid="true">
        {albums.map((album, index) => {
          const eventDate = formatEventDate(album.eventDate)

          return (
            <motion.article
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
              className="group"
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
                className="block w-full cursor-pointer overflow-hidden rounded-xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                onClick={(event) => {
                  openerRef.current = event.currentTarget
                  setActiveAlbum(album)
                }}
                type="button"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={album.cover.alt}
                    className="block size-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04]"
                    decoding="async"
                    height={album.cover.height}
                    loading="lazy"
                    src={album.cover.src}
                    width={album.cover.width}
                  />

                  {/* Overlay — flat for center, gradient for split */}
                  {cardTextLayout === 'center' ? (
                    <div className="absolute inset-0 bg-black/50 transition-colors duration-500 [@media(hover:hover)]:group-hover:bg-black/40" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-black/10" />
                  )}

                  {/* Info */}
                  {cardTextLayout === 'center' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center sm:px-8 md:px-12">
                      <div className="flex flex-col items-center gap-1.5">
                        {eventDate ? (
                          <p className="text-xs font-medium uppercase tracking-wider text-white/80 sm:text-sm md:text-base">
                            {eventDate}
                          </p>
                        ) : null}
                        <p className="text-2xl font-light tracking-tight text-white sm:text-3xl md:text-4xl">
                          {album.title}
                        </p>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                        <Images aria-hidden="true" className="size-3.5" />
                        {album.imageCount}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="min-w-0">
                        {eventDate ? (
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/80 sm:text-sm">
                            {eventDate}
                          </p>
                        ) : null}
                        <p className="max-w-xs text-2xl font-light tracking-tight text-white sm:text-3xl">
                          {album.title}
                        </p>
                      </div>
                      <span className="mb-1 inline-flex shrink-0 items-center gap-1.5 self-end rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                        <Images aria-hidden="true" className="size-3.5" />
                        {album.imageCount}
                      </span>
                    </div>
                  )}
                </div>
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
