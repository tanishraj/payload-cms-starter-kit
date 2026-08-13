import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/components/event-gallery-viewer', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('@/components/event-gallery-viewer')
  >()

  return {
    ...original,
    EventGalleryViewer: ({
      album,
      onClose,
    }: {
      album: { title: string }
      onClose: () => void
    }) => (
      <div data-testid="event-gallery-viewer">
        {album.title}
        <button onClick={onClose} type="button">
          Close test viewer
        </button>
      </div>
    ),
  }
})

import { EventGallery } from '@/components/event-gallery'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'

const albums: EventGalleryAlbum[] = [
  {
    cover: {
      alt: 'Yoga session',
      height: 900,
      id: 'image-1',
      src: '/media/yoga.jpg',
      width: 1600,
    },
    createdAt: '2026-07-26T00:00:00.000Z',
    description: 'A day of movement and community.',
    eventDate: '2026-06-21T00:00:00.000Z',
    id: 'album-1',
    imageCount: 2,
    images: [
      {
        alt: 'Yoga session',
        height: 900,
        id: 'image-1',
        src: '/media/yoga.jpg',
        width: 1600,
      },
      {
        alt: 'Group meditation',
        caption: 'Closing meditation',
        height: 900,
        id: 'image-2',
        src: '/media/meditation.jpg',
        width: 1600,
      },
    ],
    title: 'Yoga Day',
  },
  {
    cover: {
      alt: 'Students arriving',
      height: 900,
      id: 'image-3',
      src: '/media/students.jpg',
      width: 1600,
    },
    createdAt: '2026-07-25T00:00:00.000Z',
    id: 'album-2',
    imageCount: 1,
    images: [
      {
        alt: 'Students arriving',
        height: 900,
        id: 'image-3',
        src: '/media/students.jpg',
        width: 1600,
      },
    ],
    title: 'New Batch Day',
  },
]

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      disconnect() {}
      observe() {}
      takeRecords() {
        return []
      }
      unobserve() {}
    },
  )
})

afterAll(() => vi.unstubAllGlobals())
afterEach(cleanup)

describe('event gallery presentation', () => {
  it('uses shared section sizing and renders album cards in the provided order', () => {
    const html = renderToStaticMarkup(
      <EventGallery
        albums={albums}
        alignment="center"
        appearance={{ background: 'subtle', border: 'topAndBottom' }}
        description="Recent events"
        eyebrow="Moments"
        size="compact"
        title="Event gallery"
      />,
    )

    expect(html).toContain('data-event-gallery="true"')
    expect(html).toContain('data-event-gallery-alignment="center"')
    expect(html).toContain('data-event-gallery-size="compact"')
    expect(html).toContain('bg-subtle')
    expect(html.indexOf('Yoga Day')).toBeLessThan(html.indexOf('New Batch Day'))
    expect(html).toContain('Open Yoga Day gallery with 2 images')
  })

  it('opens the selected album viewer and restores focus when it closes', async () => {
    render(<EventGallery albums={albums} title="Event gallery" />)

    const opener = screen.getByRole('button', {
      name: 'Open Yoga Day gallery with 2 images',
    })

    fireEvent.click(opener)

    expect(screen.getByTestId('event-gallery-viewer').textContent).toContain('Yoga Day')

    fireEvent.click(screen.getByRole('button', { name: 'Close test viewer' }))

    await waitFor(() => {
      expect(document.activeElement).toBe(opener)
    })
  })

  it('returns nothing when albums are empty', () => {
    expect(renderToStaticMarkup(<EventGallery albums={[]} title="Event gallery" />)).toBe('')
  })
})
