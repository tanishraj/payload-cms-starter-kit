import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/news-events-tabs/route'

const { getNewsEventPageMock } = vi.hoisted(() => ({
  getNewsEventPageMock: vi.fn(),
}))

vi.mock('@/lib/newsEvents', async () => {
  const actual = await vi.importActual<typeof import('@/lib/newsEvents')>('@/lib/newsEvents')

  return {
    ...actual,
    getNewsEventPage: getNewsEventPageMock,
  }
})

describe('News & Events Tabs route', () => {
  beforeEach(() => {
    getNewsEventPageMock.mockReset()
  })

  it('returns the requested published classification page', async () => {
    const page = { docs: [], hasNextPage: true, page: 2 }
    getNewsEventPageMock.mockResolvedValue(page)

    const response = await GET(
      new Request('http://localhost/api/news-events-tabs?classification=notice&page=2&limit=6'),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(page)
    expect(getNewsEventPageMock).toHaveBeenCalledWith(
      'notice',
      2,
      6,
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    )
  })

  it.each([
    ['', 'Classification is invalid.'],
    ['classification=invalid&page=1&limit=6', 'Classification is invalid.'],
    ['classification=news&page=0&limit=6', 'Page must be a positive integer.'],
    ['classification=news&page=1.5&limit=6', 'Page must be a positive integer.'],
    ['classification=news&page=1&limit=5', 'Limit must be one of 3, 6, 9, or 12.'],
    ['classification=news&page=1', 'Limit must be one of 3, 6, 9, or 12.'],
  ])('rejects invalid query %s without querying Payload', async (query, message) => {
    const response = await GET(new Request(`http://localhost/api/news-events-tabs?${query}`))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message })
    expect(getNewsEventPageMock).not.toHaveBeenCalled()
  })

  it('returns a generic error when loading fails', async () => {
    getNewsEventPageMock.mockRejectedValue(new Error('database unavailable'))

    const response = await GET(
      new Request('http://localhost/api/news-events-tabs?classification=all&page=1&limit=6'),
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ message: 'Unable to load News & Events.' })
  })
})
