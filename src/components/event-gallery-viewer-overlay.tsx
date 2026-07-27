'use client'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  Minimize2Icon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
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

type AdjacentPreviewProps = {
  direction: 'next' | 'previous'
  image: EventGalleryImage
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

function AdjacentPreview({ direction, image }: AdjacentPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'event-gallery-side-preview absolute top-1/2 hidden h-[46vh] w-24 -translate-y-1/2 overflow-hidden opacity-30 lg:block xl:w-28',
        direction === 'previous' ? 'left-0' : 'right-0',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="size-full object-cover"
        data-testid={`event-gallery-preview-${direction}`}
        decoding="async"
        onError={(event) => {
          event.currentTarget.parentElement?.setAttribute('hidden', '')
        }}
        src={image.src}
      />
    </div>
  )
}

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
      behavior: 'auto',
      block: 'nearest',
      inline: 'center',
    })
  }, [currentIndex])

  return (
    <div
      className="pointer-events-none absolute inset-0 text-foreground"
      data-event-gallery-viewer-overlay="true"
    >
      {adjacentIndexes && !isZoomed ? (
        <>
          <AdjacentPreview
            direction="previous"
            image={album.images[adjacentIndexes.previous]!}
            key={`previous-${album.images[adjacentIndexes.previous]!.id}`}
          />
          <AdjacentPreview
            direction="next"
            image={album.images[adjacentIndexes.next]!}
            key={`next-${album.images[adjacentIndexes.next]!.id}`}
          />
        </>
      ) : null}

      <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-5">
        <div
          aria-atomic="true"
          aria-live="polite"
          className="min-w-0 pt-1 text-shadow-sm"
        >
          <p className="truncate text-xs font-semibold tracking-[0.14em] uppercase">
            {album.title}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {getCounter(currentIndex, album.images.length)}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            className="pointer-events-auto size-11"
            data-event-gallery-control="true"
            disabled={!isZoomable}
            onClick={onToggleZoom}
            size="icon-lg"
            type="button"
            variant="outline"
          >
            {isZoomed ? (
              <Minimize2Icon data-icon="inline-start" />
            ) : (
              <Maximize2Icon data-icon="inline-start" />
            )}
          </Button>
          <Button
            aria-label="Close gallery"
            className="pointer-events-auto size-11"
            data-event-gallery-control="true"
            onClick={onClose}
            size="icon-lg"
            type="button"
            variant="outline"
          >
            <XIcon data-icon="inline-start" />
          </Button>
        </div>
      </header>

      {adjacentIndexes ? (
        <>
          <Button
            aria-label="Previous image"
            className="pointer-events-auto absolute top-1/2 left-3 size-11 -translate-y-1/2 rounded-full sm:left-5"
            data-event-gallery-control="true"
            onClick={onPrevious}
            size="icon-lg"
            type="button"
            variant="outline"
          >
            <ChevronLeftIcon data-icon="inline-start" />
          </Button>
          <Button
            aria-label="Next image"
            className="pointer-events-auto absolute top-1/2 right-3 size-11 -translate-y-1/2 rounded-full sm:right-5"
            data-event-gallery-control="true"
            onClick={onNext}
            size="icon-lg"
            type="button"
            variant="outline"
          >
            <ChevronRightIcon data-icon="inline-start" />
          </Button>
        </>
      ) : null}

      <div className="absolute inset-x-4 bottom-4 flex flex-col items-center gap-3 sm:inset-x-6 sm:bottom-5">
        {caption ? (
          <p
            className="max-w-2xl text-center text-xs leading-5 text-foreground/85 text-shadow-sm sm:text-sm"
            data-testid="event-gallery-caption"
          >
            {caption}
          </p>
        ) : null}

        {adjacentIndexes ? (
          <div className="pointer-events-auto max-w-full overflow-hidden rounded-md border border-border bg-background/75 p-1.5 shadow-2xl backdrop-blur-xl">
            <div className="flex max-w-[min(76vw,44rem)] gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {album.images.map((image, index) => {
                const isActive = index === currentIndex

                return (
                  <button
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`View image ${index + 1} of ${album.images.length}`}
                    className="size-12 shrink-0 cursor-pointer overflow-hidden rounded-[calc(var(--radius)-2px)] border border-transparent opacity-55 outline-none transition-[opacity,border-color] duration-200 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none data-[active=true]:border-foreground data-[active=true]:opacity-100 sm:size-14"
                    data-active={isActive}
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
