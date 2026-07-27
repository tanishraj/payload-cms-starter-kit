import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

type MockPhotoSwipe = {
  close: ReturnType<typeof vi.fn>
  currIndex: number
  currSlide: {
    currZoomLevel: number
    isZoomable: () => boolean
    toggleZoom: ReturnType<typeof vi.fn>
    zoomLevels: {
      initial: number
      secondary: number
    }
  }
  element: HTMLElement
  goTo: ReturnType<typeof vi.fn>
  next: ReturnType<typeof vi.fn>
  on: (name: string, callback: () => void) => void
  prev: ReturnType<typeof vi.fn>
  ui: {
    registerElement: ReturnType<typeof vi.fn>
  }
}

type MockPhotoSwipeLightbox = {
  destroy: ReturnType<typeof vi.fn>
  emit: (name: string) => void
  init: ReturnType<typeof vi.fn>
  loadAndOpen: ReturnType<typeof vi.fn>
  options: Record<string, unknown>
  pswp: MockPhotoSwipe
}

type MockUIElementDefinition = {
  onInit: (element: HTMLElement, pswp: MockPhotoSwipe) => void
}

const photoSwipeHarness = vi.hoisted(() => ({
  instance: null as MockPhotoSwipeLightbox | null,
}))

vi.mock('photoswipe/lightbox', () => ({
  default: class MockPhotoSwipeLightbox {
    handlers = new Map<string, Set<() => void>>()
    pswpHandlers = new Map<string, Set<() => void>>()
    options: Record<string, unknown>
    pswp: MockPhotoSwipe
    destroy = vi.fn(() => {
      this.pswp.element.remove()
    })
    init = vi.fn()

    constructor(options: Record<string, unknown>) {
      this.options = options
      const root = document.createElement('div')
      document.body.append(root)

      this.pswp = {
        close: vi.fn(),
        currIndex: 0,
        currSlide: {
          currZoomLevel: 1,
          isZoomable: () => true,
          toggleZoom: vi.fn(),
          zoomLevels: {
            initial: 1,
            secondary: 2,
          },
        },
        element: root,
        goTo: vi.fn(),
        next: vi.fn(),
        on: (name, callback) => {
          const callbacks = this.pswpHandlers.get(name) ?? new Set()

          callbacks.add(callback)
          this.pswpHandlers.set(name, callbacks)
        },
        prev: vi.fn(),
        ui: {
          registerElement: vi.fn((definition: MockUIElementDefinition) => {
            const element = document.createElement('div')

            root.append(element)
            definition.onInit(element, this.pswp)
          }),
        },
      }

      photoSwipeHarness.instance = this
    }

    on(name: string, callback: () => void) {
      const callbacks = this.handlers.get(name) ?? new Set()

      callbacks.add(callback)
      this.handlers.set(name, callbacks)
    }

    emit(name: string) {
      this.handlers.get(name)?.forEach((callback) => callback())
      this.pswpHandlers.get(name)?.forEach((callback) => callback())
    }

    loadAndOpen = vi.fn((index: number) => {
      this.pswp.currIndex = index
      this.emit('uiRegister')
    })
  },
}))

import {
  EventGalleryViewerOverlay,
  getAdjacentImageIndexes,
  getEventGalleryCaption,
} from '@/components/event-gallery-viewer-overlay'
import { EventGalleryViewer } from '@/components/event-gallery-viewer'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'

const album: EventGalleryAlbum = {
  cover: {
    alt: 'Opening ceremony',
    height: 900,
    id: 'image-1',
    src: '/media/opening.jpg',
    width: 1600,
  },
  createdAt: '2026-07-26T00:00:00.000Z',
  id: 'album-1',
  imageCount: 3,
  images: [
    {
      alt: 'Opening ceremony',
      height: 900,
      id: 'image-1',
      src: '/media/opening.jpg',
      width: 1600,
    },
    {
      alt: 'Independence Day',
      caption: 'Students celebrate together',
      height: 900,
      id: 'image-2',
      src: '/media/celebration.jpg',
      width: 1600,
    },
    {
      alt: 'Closing performance',
      height: 900,
      id: 'image-3',
      src: '/media/performance.jpg',
      width: 1600,
    },
  ],
  title: 'Independence Day',
}

const originalScrollIntoView = Element.prototype.scrollIntoView

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
})

afterEach(() => {
  cleanup()
  photoSwipeHarness.instance = null
})

describe('EventGalleryViewerOverlay', () => {
  it('derives looped adjacent images and useful captions', () => {
    expect(getAdjacentImageIndexes(3, 0)).toEqual({ next: 1, previous: 2 })
    expect(getAdjacentImageIndexes(1, 0)).toBeNull()
    expect(getEventGalleryCaption(album.images[0]!, album.title)).toBe('Opening ceremony')
    expect(getEventGalleryCaption(album.images[1]!, album.title)).toBe(
      'Students celebrate together',
    )
    expect(
      getEventGalleryCaption(
        { ...album.images[0]!, alt: ' independence day ' },
        album.title,
      ),
    ).toBeUndefined()
  })

  it('renders metadata, side previews, controls, caption, and thumbnails', () => {
    const onClose = vi.fn()
    const onNext = vi.fn()
    const onPrevious = vi.fn()
    const onSelect = vi.fn()
    const onToggleZoom = vi.fn()

    render(
      <EventGalleryViewerOverlay
        album={album}
        currentIndex={1}
        isZoomable
        isZoomed={false}
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
        onSelect={onSelect}
        onToggleZoom={onToggleZoom}
      />,
    )

    expect(screen.getByText('Independence Day')).toBeTruthy()
    expect(screen.getByText('02 / 03')).toBeTruthy()
    expect(screen.getByText('Students celebrate together')).toBeTruthy()
    expect(screen.getByTestId('event-gallery-preview-previous').getAttribute('src')).toBe(
      '/media/opening.jpg',
    )
    expect(screen.getByTestId('event-gallery-preview-next').getAttribute('src')).toBe(
      '/media/performance.jpg',
    )
    expect(
      screen.getByTestId('event-gallery-preview-next').parentElement?.className,
    ).toContain('hidden')
    expect(
      screen.getByTestId('event-gallery-preview-next').parentElement?.className,
    ).toContain('lg:block')
    expect(
      screen.getByRole('button', { name: 'View image 2 of 3' }).getAttribute('aria-current'),
    ).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close gallery' }))
    fireEvent.click(screen.getByRole('button', { name: 'View image 3 of 3' }))

    expect(onPrevious).toHaveBeenCalledOnce()
    expect(onNext).toHaveBeenCalledOnce()
    expect(onToggleZoom).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(2)

    const brokenPreview = screen.getByTestId('event-gallery-preview-next')
    fireEvent.error(brokenPreview)
    expect(brokenPreview.parentElement?.hasAttribute('hidden')).toBe(true)
  })

  it('hides multi-image UI and repeated-title captions for one image', () => {
    render(
      <EventGalleryViewerOverlay
        album={{
          ...album,
          imageCount: 1,
          images: [{ ...album.images[0]!, alt: album.title }],
        }}
        currentIndex={0}
        isZoomable={false}
        isZoomed={false}
        onClose={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        onSelect={vi.fn()}
        onToggleZoom={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Previous image' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next image' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'View image 1 of 1' })).toBeNull()
    expect(screen.queryByTestId('event-gallery-caption')).toBeNull()
    expect(screen.getByRole('button', { name: 'Zoom in' }).hasAttribute('disabled')).toBe(
      true,
    )
  })

  it('switches zoom semantics and hides previews while enlarged', () => {
    render(
      <EventGalleryViewerOverlay
        album={album}
        currentIndex={0}
        isZoomable
        isZoomed
        onClose={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        onSelect={vi.fn()}
        onToggleZoom={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy()
    expect(screen.queryByTestId('event-gallery-preview-previous')).toBeNull()
    expect(screen.queryByTestId('event-gallery-preview-next')).toBeNull()
  })
})

describe('EventGalleryViewer PhotoSwipe bridge', () => {
  it('disables default UI and routes overlay controls through PhotoSwipe', async () => {
    const onClose = vi.fn()

    render(<EventGalleryViewer album={album} initialIndex={1} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByText('02 / 03')).toBeTruthy()
    })

    const lightbox = photoSwipeHarness.instance!

    expect(lightbox.options).toMatchObject({
      arrowNext: false,
      arrowPrev: false,
      close: false,
      closeOnVerticalDrag: true,
      counter: false,
      loop: true,
      mainClass: 'event-gallery-lightbox',
      returnFocus: true,
      wheelToZoom: true,
      zoom: false,
    })
    expect(lightbox.loadAndOpen).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    fireEvent.click(screen.getByRole('button', { name: 'View image 3 of 3' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close gallery' }))

    expect(lightbox.pswp.prev).toHaveBeenCalledOnce()
    expect(lightbox.pswp.next).toHaveBeenCalledOnce()
    expect(lightbox.pswp.currSlide.toggleZoom).toHaveBeenCalledOnce()
    expect(lightbox.pswp.goTo).toHaveBeenCalledWith(2)
    expect(lightbox.pswp.close).toHaveBeenCalledOnce()

    lightbox.pswp.currIndex = 2
    lightbox.pswp.currSlide.currZoomLevel = 2
    lightbox.emit('change')
    lightbox.emit('zoomPanUpdate')

    await waitFor(() => {
      expect(screen.getByText('03 / 03')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy()
    })

    lightbox.emit('close')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
