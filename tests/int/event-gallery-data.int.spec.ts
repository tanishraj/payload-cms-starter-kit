import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', () => ({ getPayload: mocks.getPayload }))

import {
  getDraftEventGalleryAlbums,
  getPublishedEventGalleryAlbums,
} from '@/lib/eventGallery'
import { normalizeEventGalleryAlbums } from '@/lib/eventGalleryShared'

beforeEach(() => {
  mocks.find.mockReset()
  mocks.getPayload.mockReset()
  mocks.find.mockResolvedValue({ docs: [] })
  mocks.getPayload.mockResolvedValue({ find: mocks.find })
})

describe('event gallery data path', () => {
  it('normalizes valid images, uses the first as cover, and sorts newest first', () => {
    const albums = normalizeEventGalleryAlbums([
      {
        id: 1,
        title: 'Yoga Day',
        createdAt: '2026-06-21T00:00:00.000Z',
        images: [
          {
            id: 'row-1',
            image: {
              id: 10,
              alt: 'Yoga session',
              url: '/media/yoga.jpg',
              width: 1600,
              height: 900,
            },
            caption: 'Morning session',
          },
        ],
      },
      {
        id: 2,
        title: 'New Batch Day',
        createdAt: '2026-07-25T00:00:00.000Z',
        images: [
          {
            id: 'row-2',
            image: {
              id: 11,
              alt: 'New students',
              url: '/media/batch.jpg',
              width: 1600,
              height: 900,
            },
          },
          {
            id: 'broken',
            image: 999,
          },
        ],
      },
    ])

    expect(albums.map((album) => album.title)).toEqual(['New Batch Day', 'Yoga Day'])
    expect(albums[0]).toMatchObject({
      cover: { src: '/media/batch.jpg' },
      imageCount: 1,
    })
    expect(albums[1]?.images[0]?.caption).toBe('Morning session')
  })

  it('filters albums without a title or resolvable image', () => {
    expect(
      normalizeEventGalleryAlbums([
        {
          id: 1,
          title: 'No images',
          createdAt: '2026-07-25T00:00:00.000Z',
          images: [{ image: 12 }],
        },
        {
          id: 2,
          title: ' ',
          createdAt: '2026-07-26T00:00:00.000Z',
          images: [
            {
              image: {
                id: 13,
                alt: 'Hidden',
                url: '/media/hidden.jpg',
                width: 1600,
                height: 900,
              },
            },
          ],
        },
      ]),
    ).toEqual([])
  })

  it('queries published and draft albums newest first without pagination', async () => {
    await getPublishedEventGalleryAlbums()
    await getDraftEventGalleryAlbums()

    expect(mocks.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'gallery-albums',
        depth: 1,
        draft: false,
        pagination: false,
        sort: '-createdAt',
        where: { _status: { equals: 'published' } },
      }),
    )
    expect(mocks.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'gallery-albums',
        depth: 1,
        draft: true,
        pagination: false,
        sort: '-createdAt',
      }),
    )
  })
})
