'use client'

import 'photoswipe/style.css'

import type PhotoSwipe from 'photoswipe'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { EventGalleryViewerOverlay } from '@/components/event-gallery-viewer-overlay'
import type {
  EventGalleryAlbum,
  EventGalleryImage,
} from '@/lib/eventGalleryShared'

export const createEventGalleryDataSource = (images: EventGalleryImage[]) =>
  images.map((image) => ({
    alt: image.alt,
    height: image.height,
    src: image.src,
    width: image.width,
  }))

type EventGalleryViewerSnapshot = {
  currentIndex: number
  isZoomable: boolean
  isZoomed: boolean
}

type EventGalleryViewerPortal = EventGalleryViewerSnapshot & {
  element: HTMLElement
  pswp: PhotoSwipe
}

export const getEventGalleryViewerSnapshot = (
  pswp: PhotoSwipe,
): EventGalleryViewerSnapshot => {
  const slide = pswp.currSlide

  if (!slide) {
    return {
      currentIndex: pswp.currIndex,
      isZoomable: false,
      isZoomed: false,
    }
  }

  const zoomDifference = Math.abs(
    slide.zoomLevels.secondary - slide.zoomLevels.initial,
  )

  return {
    currentIndex: pswp.currIndex,
    isZoomable: slide.isZoomable() && zoomDifference >= 0.01,
    isZoomed: slide.currZoomLevel > slide.zoomLevels.initial + 0.01,
  }
}

type EventGalleryViewerProps = {
  album: EventGalleryAlbum
  initialIndex?: number
  onClose: () => void
}

export function EventGalleryViewer({
  album,
  initialIndex = 0,
  onClose,
}: EventGalleryViewerProps) {
  const [viewerPortal, setViewerPortal] =
    useState<EventGalleryViewerPortal | null>(null)

  useEffect(() => {
    const hasMultipleImages = album.images.length > 1
    const lightbox = new PhotoSwipeLightbox({
      arrowNext: false,
      arrowPrev: false,
      bgOpacity: 1,
      close: false,
      closeOnVerticalDrag: true,
      counter: false,
      dataSource: createEventGalleryDataSource(album.images),
      hideAnimationDuration: 160,
      loop: hasMultipleImages,
      mainClass: 'event-gallery-lightbox',
      paddingFn: (viewportSize) => ({
        bottom: hasMultipleImages ? (viewportSize.x < 640 ? 112 : 124) : 24,
        left: 16,
        right: 16,
        top: 68,
      }),
      pswpModule: () => import('photoswipe'),
      returnFocus: true,
      showAnimationDuration: 180,
      showHideAnimationType: 'fade',
      wheelToZoom: true,
      zoom: false,
    })

    lightbox.on('uiRegister', () => {
      lightbox.pswp?.ui?.registerElement({
        appendTo: 'root',
        className: 'event-gallery-overlay',
        name: 'event-gallery-overlay',
        onInit: (element, pswp) => {
          const syncViewerPortal = () => {
            const snapshot = getEventGalleryViewerSnapshot(pswp)

            setViewerPortal((currentPortal) => {
              if (
                currentPortal?.element === element &&
                currentPortal.currentIndex === snapshot.currentIndex &&
                currentPortal.isZoomable === snapshot.isZoomable &&
                currentPortal.isZoomed === snapshot.isZoomed
              ) {
                return currentPortal
              }

              return {
                element,
                pswp,
                ...snapshot,
              }
            })
          }

          pswp.on('change', syncViewerPortal)
          pswp.on('zoomPanUpdate', syncViewerPortal)
          syncViewerPortal()
        },
        order: 10,
      })
    })
    lightbox.on('close', onClose)
    lightbox.init()
    lightbox.loadAndOpen(
      Math.min(Math.max(initialIndex, 0), Math.max(album.images.length - 1, 0)),
    )

    return () => {
      lightbox.destroy()
    }
  }, [album, initialIndex, onClose])

  if (!viewerPortal) {
    return null
  }

  const { currentIndex, element, isZoomable, isZoomed, pswp } = viewerPortal

  return createPortal(
    <EventGalleryViewerOverlay
      album={album}
      currentIndex={currentIndex}
      isZoomable={isZoomable}
      isZoomed={isZoomed}
      onClose={() => pswp.close()}
      onNext={() => pswp.next()}
      onPrevious={() => pswp.prev()}
      onSelect={(index) => pswp.goTo(index)}
      onToggleZoom={() => pswp.currSlide?.toggleZoom()}
    />,
    element,
  )
}
