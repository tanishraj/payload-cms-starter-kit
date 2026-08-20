import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('next/og', () => ({
  ImageResponse: class {
    element: unknown

    constructor(element: unknown) {
      this.element = element
    }
  },
}))

import NewsEventOgImage from '@/app/(frontend)/news-events/[slug]/opengraph-image'

describe('News & Events detail OpenGraph image', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPayload.mockResolvedValue({
      find: mocks.find,
      findGlobal: mocks.findGlobal,
    })
    mocks.find.mockResolvedValue({
      docs: [
        {
          classification: {
            active: true,
            badgeLabel: 'CME',
            behavior: 'event',
            id: 'classification-cme',
            legacyValue: null,
            slug: 'continuing-medical-education',
            title: 'Continuing Medical Education',
          },
          excerpt: 'A specialist learning event.',
          title: 'Clinical learning symposium',
        },
      ],
    })
    mocks.findGlobal.mockResolvedValue({ logo: null, siteName: 'SNMIH' })
  })

  it('populates and renders the resolved classification badge label', async () => {
    const response = await NewsEventOgImage({
      params: Promise.resolve({ slug: 'clinical-learning-symposium' }),
    })
    const markup = renderToStaticMarkup((response as unknown as { element: ReactNode }).element)

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'news-events',
        depth: 1,
        select: expect.objectContaining({ classification: true }),
      }),
    )
    expect(markup).toContain('CME')
    expect(markup).toContain('Clinical learning symposium')
  })
})
