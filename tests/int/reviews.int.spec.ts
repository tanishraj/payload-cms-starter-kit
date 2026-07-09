import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Reviews } from '@/collections/Reviews'

const payloadMocks = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
}))

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()

  return {
    ...actual,
    getPayload: vi.fn(async () => ({
      find: payloadMocks.find,
      findGlobal: payloadMocks.findGlobal,
    })),
  }
})

vi.mock('@payload-config', () => ({
  default: {},
}))

const loadContentEntries = async () => {
  vi.resetModules()
  return import('@/lib/contentEntries')
}

describe('reviews collection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    payloadMocks.findGlobal.mockResolvedValue({
      defaultDescription: 'Global SEO description',
      defaultImage: null,
      defaultTitle: 'Global SEO title',
      robots: 'index,follow',
    })
  })

  it('includes the shared content spotlight block and structured rating fields', () => {
    expect(Reviews.admin?.defaultColumns).toContain('primaryCategory')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"rating"')
    expect(JSON.stringify(Reviews.fields)).toContain('"value":"5"')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"primaryCategory"')
    expect(JSON.stringify(Reviews.fields)).toContain('"relationTo":"categories"')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"tags"')
    expect(JSON.stringify(Reviews.fields)).toContain('"relationTo":"tags"')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"categories"')
    expect(JSON.stringify(Reviews.fields)).toContain('"slug":"contentSpotlight"')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"metaTitle"')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"sourceSubmission"')
    expect(JSON.stringify(Reviews.fields)).toContain('"name":"workflowState"')
  })

  it('queries only published reviews by slug', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [{ id: 8, slug: 'great-service', title: 'Great Service' }],
    })

    const { getReviewBySlug } = await loadContentEntries()
    const review = await getReviewBySlug('great-service')

    expect(review?.slug).toBe('great-service')
    expect(payloadMocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { slug: { equals: 'great-service' } },
            { _status: { equals: 'published' } },
          ]),
        }),
      }),
    )
  })
})
