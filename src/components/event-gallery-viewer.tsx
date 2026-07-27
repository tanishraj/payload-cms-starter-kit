'use client'

import 'photoswipe/style.css'

import PhotoSwipeLightbox from 'photoswipe/lightbox'
import type PhotoSwipe from 'photoswipe'
import { useEffect } from 'react'

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

const updateThumbnailState = (container: HTMLElement, currentIndex: number) => {
  container.querySelectorAll<HTMLButtonElement>('[data-event-gallery-thumbnail]').forEach(
    (button, index) => {
      const isCurrent = index === currentIndex

      button.dataset.active = String(isCurrent)
      button.setAttribute('aria-current', isCurrent ? 'true' : 'false')

      if (isCurrent) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    },
  )
}

const registerViewerUI = ({
  album,
  pswp,
}: {
  album: EventGalleryAlbum
  pswp: PhotoSwipe
}) => {
  pswp.ui?.registerElement({
    appendTo: 'root',
    className:
      'pointer-events-none absolute inset-x-16 bottom-24 z-10 text-center text-sm text-white drop-shadow-md',
    name: 'event-gallery-caption',
    onInit: (element, instance) => {
      const updateCaption = () => {
        const image = album.images[instance.currIndex]

        element.textContent = image?.caption || image?.alt || album.title
      }

      instance.on('change', updateCaption)
      updateCaption()
    },
    order: 8,
  })

  pswp.ui?.registerElement({
    appendTo: 'root',
    className:
      'absolute inset-x-0 bottom-0 z-10 flex h-20 items-center justify-center border-t border-border bg-background/95 px-4 backdrop-blur',
    name: 'event-gallery-thumbnails',
    onInit: (element, instance) => {
      const strip = document.createElement('div')

      strip.className =
        'flex max-w-full items-center gap-2 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

      album.images.forEach((image, index) => {
        const button = document.createElement('button')
        const thumbnail = document.createElement('img')

        button.type = 'button'
        button.dataset.eventGalleryThumbnail = String(index)
        button.className =
          'relative size-14 shrink-0 overflow-hidden rounded-md border-2 border-transparent opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-primary data-[active=true]:opacity-100'
        button.setAttribute('aria-label', `View image ${index + 1} of ${album.images.length}`)
        button.addEventListener('click', () => instance.goTo(index))

        thumbnail.alt = ''
        thumbnail.className = 'pointer-events-none size-full object-cover'
        thumbnail.decoding = 'async'
        thumbnail.src = image.src

        button.append(thumbnail)
        strip.append(button)
      })

      element.append(strip)

      const updateThumbnails = () => updateThumbnailState(strip, instance.currIndex)

      instance.on('change', updateThumbnails)
      updateThumbnails()
    },
    order: 9,
  })
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
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      bgOpacity: 0.98,
      closeOnVerticalDrag: true,
      dataSource: createEventGalleryDataSource(album.images),
      loop: album.images.length > 1,
      mainClass: 'event-gallery-lightbox',
      paddingFn: () => ({
        bottom: 116,
        left: 16,
        right: 16,
        top: 52,
      }),
      pswpModule: () => import('photoswipe'),
      returnFocus: true,
      wheelToZoom: true,
    })

    lightbox.on('uiRegister', () => {
      if (lightbox.pswp) {
        registerViewerUI({ album, pswp: lightbox.pswp })
      }
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

  return null
}
