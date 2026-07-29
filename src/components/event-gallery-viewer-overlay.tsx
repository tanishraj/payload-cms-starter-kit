'use client'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Minimize2Icon,
  Maximize2Icon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

import type {
  EventGalleryAlbum,
  EventGalleryImage,
} from '@/lib/eventGalleryShared'
import { cn } from '@/lib/utils'

export type EventGalleryViewerOverlayProps = {
  album: EventGalleryAlbum
  currentIndex: number
  isZoomable: boolean
  isZoomed: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onSelect: (index: number) => void
  onToggleZoom: () => void
}

export const getEventGalleryCaption = (
  image: EventGalleryImage,
  albumTitle: string,
): string | undefined => {
  const caption = image.caption?.trim()

  if (caption) {
    return caption
  }

  const alt = image.alt.trim()

  if (!alt || alt.toLocaleLowerCase() === albumTitle.trim().toLocaleLowerCase()) {
    return undefined
  }

  return alt
}

export const getAdjacentImageIndexes = (
  length: number,
  currentIndex: number,
): { next: number; previous: number } | null => {
  if (length <= 1) {
    return null
  }

  return {
    next: (currentIndex + 1) % length,
    previous: (currentIndex - 1 + length) % length,
  }
}

const getCounter = (currentIndex: number, total: number) => {
  const width = Math.max(2, String(total).length)

  return `${String(currentIndex + 1).padStart(width, '0')} / ${String(total).padStart(width, '0')}`
}

const glassButtonClasses =
  'pointer-events-auto flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

export function EventGalleryViewerOverlay({
  album,
  currentIndex,
  isZoomable,
  isZoomed,
  onClose,
  onNext,
  onPrevious,
  onSelect,
  onToggleZoom,
}: EventGalleryViewerOverlayProps) {
  const activeThumbnailRef = useRef<HTMLButtonElement>(null)
  const currentImage = album.images[currentIndex]
  const adjacentIndexes = getAdjacentImageIndexes(album.images.length, currentIndex)
  const caption = currentImage
    ? getEventGalleryCaption(currentImage, album.title)
    : undefined

  useEffect(() => {
    activeThumbnailRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [currentIndex])

  return (
    <div
      className="pointer-events-none absolute inset-0 select-none text-white"
      data-event-gallery-viewer-overlay="true"
    >
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 flex items-center gap-3 bg-linear-to-b from-black/55 via-black/20 to-transparent px-4 pb-10 pt-4 sm:px-5 sm:pt-5">
        <div aria-atomic="true" aria-live="polite" className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight">
            {album.title}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-white/55">
            {getCounter(currentIndex, album.images.length)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isZoomable ? (
            <button
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
              className={cn(glassButtonClasses, 'size-9')}
              data-event-gallery-control="true"
              onClick={onToggleZoom}
              type="button"
            >
              {isZoomed ? (
                <Minimize2Icon className="size-4" />
              ) : (
                <Maximize2Icon className="size-4" />
              )}
            </button>
          ) : null}
          <button
            aria-label="Close gallery"
            className={cn(glassButtonClasses, 'size-9')}
            data-event-gallery-control="true"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </header>

      {/* Prev / Next arrows */}
      {adjacentIndexes && !isZoomed ? (
        <>
          <button
            aria-label="Previous image"
            className={cn(
              glassButtonClasses,
              'absolute left-3 top-1/2 size-10 -translate-y-1/2 sm:left-4 sm:size-11',
            )}
            data-event-gallery-control="true"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            aria-label="Next image"
            className={cn(
              glassButtonClasses,
              'absolute right-3 top-1/2 size-10 -translate-y-1/2 sm:right-4 sm:size-11',
            )}
            data-event-gallery-control="true"
            onClick={onNext}
            type="button"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </>
      ) : null}

      {/* Bottom: caption + thumbnail strip */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-linear-to-t from-black/60 via-black/20 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-5">
        {caption ? (
          <p
            className="max-w-xl text-center text-xs leading-5 text-white/80 sm:text-sm"
            data-testid="event-gallery-caption"
          >
            {caption}
          </p>
        ) : null}

        {adjacentIndexes ? (
          <div className="pointer-events-auto overflow-hidden rounded-xl bg-black/40 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-inset ring-white/10">
            <div className="flex max-w-[min(80vw,42rem)] gap-1.5 overflow-x-auto scrollbar-none">
              {album.images.map((image, index) => {
                const isActive = index === currentIndex

                return (
                  <button
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`View image ${index + 1} of ${album.images.length}`}
                    className={cn(
                      'size-12 shrink-0 cursor-pointer overflow-hidden rounded-lg outline-none transition-[opacity,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none sm:size-14',
                      isActive
                        ? 'opacity-100 shadow-[0_0_0_2px_white]'
                        : 'opacity-45 hover:opacity-80',
                    )}
                    key={image.id}
                    onClick={() => onSelect(index)}
                    ref={isActive ? activeThumbnailRef : undefined}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="size-full object-cover"
                      decoding="async"
                      src={image.src}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
