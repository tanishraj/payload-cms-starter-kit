import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Articles } from '@/collections/Articles'

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

describe('articles collection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    payloadMocks.findGlobal.mockResolvedValue({
      defaultDescription: 'Global SEO description',
      defaultImage: null,
      defaultTitle: 'Global SEO title',
      robots: 'index,follow',
    })
  })

  it('defines a writing-first body field and article workflow controls', () => {
    const tabsField = Articles.fields.find((field) => field.type === 'tabs')

    expect(tabsField).toBeDefined()
    expect(JSON.stringify(tabsField)).toContain('"name":"body"')
    expect(JSON.stringify(tabsField)).toContain('"type":"richText"')
    expect(JSON.stringify(tabsField)).toContain('"name":"metaTitle"')
    expect(JSON.stringify(tabsField)).toContain('"name":"workflowState"')
  })

  it('queries only published articles by slug', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [{ id: 7, slug: 'launch-notes', title: 'Launch Notes' }],
    })

    const { getArticleBySlug } = await loadContentEntries()
    const article = await getArticleBySlug('launch-notes')

    expect(article?.slug).toBe('launch-notes')
    expect(payloadMocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'articles',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { slug: { equals: 'launch-notes' } },
            { _status: { equals: 'published' } },
          ]),
        }),
      }),
    )
  })
})
