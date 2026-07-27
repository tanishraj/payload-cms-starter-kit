import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  EventGalleryViewerOverlay,
  getAdjacentImageIndexes,
  getEventGalleryCaption,
} from '@/components/event-gallery-viewer-overlay'
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

afterEach(cleanup)

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
