import { readFileSync } from 'node:fs'

import type { Config, Field, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

const { revalidateTagMock } = vi.hoisted(() => ({
  revalidateTagMock: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: revalidateTagMock,
}))

import { NewsEventClassifications } from '@/collections/NewsEventClassifications'
import { findNewsEventClassificationReference } from '@/hooks/newsEventClassificationReferences'
import { protectNewsEventClassificationSystemFields } from '@/hooks/protectNewsEventClassificationSystemFields'
import { preventReferencedNewsEventClassificationDelete } from '@/hooks/preventReferencedNewsEventClassificationDelete'
import {
  CMS_CACHE_TAGS,
  revalidateDeletedNewsEventClassificationCache,
  revalidateNewsEventClassificationsCache,
} from '@/hooks/revalidateCmsContent'
import {
  NEWS_EVENT_CLASSIFICATION_DEFAULTS,
  normalizeNewsEventClassificationRecord,
} from '@/lib/newsEventClassifications'
import { withTrash } from '@/plugins/withTrash'

const findNamedField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field

    if ('fields' in field) {
      const match = findNamedField(field.fields, name)
      if (match) return match
    }

    if ('tabs' in field) {
      for (const tab of field.tabs) {
        if (!('fields' in tab)) continue

        const match = findNamedField(tab.fields, name)
        if (match) return match
      }
    }
  }

  return undefined
}

const createRequest = ({
  classificationLegacyValue = 'news',
  collections = {},
  detailLayout = [],
}: {
  classificationLegacyValue?: string | null
  collections?: Partial<Record<'news-events' | 'pages' | 'reusable-sections', unknown[]>>
  detailLayout?: unknown[]
} = {}) => {
  const find = vi.fn().mockImplementation(async ({ collection, page = 1 }) => ({
    docs: page === 1 ? (collections[collection as keyof typeof collections] ?? []) : [],
    hasNextPage: false,
    nextPage: null,
  }))
  const findByID = vi.fn().mockResolvedValue({ legacyValue: classificationLegacyValue })
  const findGlobal = vi.fn().mockResolvedValue({ layout: detailLayout })
  const req = {
    payload: { find, findByID, findGlobal },
  } as unknown as PayloadRequest

  return { find, findByID, findGlobal, req }
}

const createDeleteHookArgs = (request = createRequest()) => {
  return {
    args: {
      collection: NewsEventClassifications,
      context: {},
      id: 'classification-1',
      req: request.req,
    } as Parameters<typeof preventReferencedNewsEventClassificationDelete>[0],
    ...request,
  }
}

describe('news and event classifications', () => {
  it('defines the central collection schema and access contract', () => {
    expect(NewsEventClassifications.slug).toBe('news-event-classifications')
    expect(NewsEventClassifications.labels).toEqual({
      plural: 'News & Event Classifications',
      singular: 'News & Event Classification',
    })
    expect(NewsEventClassifications.admin).toMatchObject({
      group: 'Content',
      useAsTitle: 'title',
    })
    expect(NewsEventClassifications.versions).toBeUndefined()

    expect(findNamedField(NewsEventClassifications.fields, 'title')).toMatchObject({
      required: true,
      type: 'text',
    })
    expect(findNamedField(NewsEventClassifications.fields, 'slug')).toMatchObject({
      index: true,
      type: 'text',
      unique: true,
    })
    expect(findNamedField(NewsEventClassifications.fields, 'badgeLabel')).toMatchObject({
      type: 'text',
    })
    expect(findNamedField(NewsEventClassifications.fields, 'legacyValue')).toMatchObject({
      admin: { hidden: true },
      index: true,
      options: [
        { label: 'News', value: 'news' },
        { label: 'Events', value: 'event' },
        { label: 'Notice', value: 'notice' },
        { label: 'Holiday', value: 'holiday' },
        { label: 'Achievements', value: 'achievement' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Others', value: 'other' },
      ],
      type: 'select',
      unique: true,
    })
    expect(findNamedField(NewsEventClassifications.fields, 'behavior')).toMatchObject({
      defaultValue: 'story',
      options: [
        { label: 'Story', value: 'story' },
        { label: 'Event', value: 'event' },
      ],
      required: true,
      type: 'select',
    })
    expect(findNamedField(NewsEventClassifications.fields, 'description')).toMatchObject({
      type: 'textarea',
    })
    expect(findNamedField(NewsEventClassifications.fields, 'active')).toMatchObject({
      defaultValue: true,
      required: true,
      type: 'checkbox',
    })
    expect(NewsEventClassifications.hooks?.beforeDelete).toEqual([
      preventReferencedNewsEventClassificationDelete,
    ])
    expect(NewsEventClassifications.hooks?.beforeChange).toEqual([
      protectNewsEventClassificationSystemFields,
    ])
    expect(NewsEventClassifications.hooks?.afterChange).toEqual([
      revalidateNewsEventClassificationsCache,
    ])
    expect(NewsEventClassifications.hooks?.afterDelete).toEqual([
      revalidateDeletedNewsEventClassificationCache,
    ])
  })

  it('revalidates classification-backed News & Events and Page caches', async () => {
    revalidateTagMock.mockClear()

    const doc = { id: 'classification-1', title: 'Campus News' }

    await revalidateNewsEventClassificationsCache({ doc } as never)
    await revalidateDeletedNewsEventClassificationCache({ doc } as never)

    expect(revalidateTagMock.mock.calls).toEqual([
      [CMS_CACHE_TAGS.newsEvents, 'max'],
      [CMS_CACHE_TAGS.pages, 'max'],
      [CMS_CACHE_TAGS.newsEvents, 'max'],
      [CMS_CACHE_TAGS.pages, 'max'],
    ])
  })

  it('allows public and relevant authenticated reads while gating mutations', async () => {
    const publicReq = { user: null } as unknown as PayloadRequest
    const managerReq = {
      user: { capabilities: { manage_news_events: true }, role: 'content_manager' },
    } as unknown as PayloadRequest
    const deniedReq = {
      user: { capabilities: { manage_news_events: false }, role: 'content_manager' },
    } as unknown as PayloadRequest
    const pageManagerReq = {
      user: { capabilities: { manage_pages: true }, role: 'content_manager' },
    } as unknown as PayloadRequest
    const settingsManagerReq = {
      user: { capabilities: { manage_page_settings: true }, role: 'content_manager' },
    } as unknown as PayloadRequest

    expect(await NewsEventClassifications.access?.read?.({ req: publicReq } as never)).toBe(true)
    expect(await NewsEventClassifications.access?.read?.({ req: managerReq } as never)).toBe(true)
    expect(await NewsEventClassifications.access?.read?.({ req: pageManagerReq } as never)).toBe(
      true,
    )
    expect(
      await NewsEventClassifications.access?.read?.({ req: settingsManagerReq } as never),
    ).toBe(true)
    expect(await NewsEventClassifications.access?.read?.({ req: deniedReq } as never)).toBe(false)

    for (const operation of ['create', 'delete', 'update'] as const) {
      expect(
        await NewsEventClassifications.access?.[operation]?.({ req: managerReq } as never),
      ).toBe(true)
      expect(
        await NewsEventClassifications.access?.[operation]?.({ req: deniedReq } as never),
      ).toBe(false)
    }
  })

  it('defines the seven compatibility defaults', () => {
    expect(NEWS_EVENT_CLASSIFICATION_DEFAULTS).toEqual([
      {
        badgeLabel: 'News',
        behavior: 'story',
        legacyValue: 'news',
        slug: 'news',
        title: 'News',
      },
      {
        badgeLabel: 'Event',
        behavior: 'event',
        legacyValue: 'event',
        slug: 'event',
        title: 'Events',
      },
      {
        badgeLabel: 'Notice',
        behavior: 'story',
        legacyValue: 'notice',
        slug: 'notice',
        title: 'Notice',
      },
      {
        badgeLabel: 'Holiday',
        behavior: 'story',
        legacyValue: 'holiday',
        slug: 'holiday',
        title: 'Holiday',
      },
      {
        badgeLabel: 'Achievement',
        behavior: 'story',
        legacyValue: 'achievement',
        slug: 'achievement',
        title: 'Achievements',
      },
      {
        badgeLabel: 'Announcement',
        behavior: 'story',
        legacyValue: 'announcement',
        slug: 'announcement',
        title: 'Announcement',
      },
      {
        badgeLabel: 'Other',
        behavior: 'story',
        legacyValue: 'other',
        slug: 'other',
        title: 'Others',
      },
    ])
  })

  it('normalizes usable populated records and safe fallbacks', () => {
    expect(
      normalizeNewsEventClassificationRecord({
        active: true,
        badgeLabel: 'Event',
        behavior: 'event',
        id: 'classification-1',
        legacyValue: 'event',
        slug: 'events',
        title: 'Events',
      }),
    ).toEqual({
      active: true,
      badgeLabel: 'Event',
      behavior: 'event',
      id: 'classification-1',
      legacyValue: 'event',
      slug: 'events',
      title: 'Events',
    })

    expect(
      normalizeNewsEventClassificationRecord({
        active: undefined,
        badgeLabel: '   ',
        behavior: 'unexpected',
        id: 42,
        slug: '  notice  ',
        title: '  Notice  ',
      }),
    ).toEqual({
      active: true,
      badgeLabel: 'Notice',
      behavior: 'story',
      id: '42',
      legacyValue: null,
      slug: 'notice',
      title: 'Notice',
    })

    expect(
      normalizeNewsEventClassificationRecord({
        active: false,
        id: 'archived',
        slug: 'archive',
        title: 'Archive',
      }),
    ).toMatchObject({ active: false })
    expect(normalizeNewsEventClassificationRecord('classification-1')).toBeNull()
    expect(normalizeNewsEventClassificationRecord({ id: 'classification-1' })).toBeNull()
    expect(normalizeNewsEventClassificationRecord(null)).toBeNull()
  })

  it('normalizes only known legacy values', () => {
    expect(
      normalizeNewsEventClassificationRecord({
        id: 'custom-1',
        legacyValue: 'custom',
        slug: 'custom',
        title: 'Custom',
      }),
    ).toMatchObject({ legacyValue: null })
  })

  it('registers the collection immediately before news-events', () => {
    const source = readFileSync('src/payload.config.ts', 'utf8')

    expect(source).toContain(
      "import { NewsEventClassifications } from './collections/NewsEventClassifications'",
    )
    expect(source).toMatch(/Articles,\s+NewsEventClassifications,\s+NewsEvents,/)
    expect(source).toContain('exclude: [NewsEventClassifications.slug]')
  })

  it('excludes classifications from the global Trash plugin', async () => {
    const config = await withTrash({ exclude: [NewsEventClassifications.slug] })({
      collections: [NewsEventClassifications, { fields: [], slug: 'trash-enabled' }],
    } as unknown as Config)

    expect(
      config.collections?.find(({ slug }) => slug === NewsEventClassifications.slug)?.trash,
    ).toBeUndefined()
    expect(config.collections?.find(({ slug }) => slug === 'trash-enabled')?.trash).toBe(true)
  })

  it.each([
    [
      'current News & Events relationship',
      { 'news-events': [{ classification: 'classification-1', id: 'entry-1' }] },
      [],
      'news-events',
    ],
    [
      'legacy News & Events value',
      { 'news-events': [{ contentType: 'news', id: 'entry-1' }] },
      [],
      'news-events',
    ],
    [
      'current nested Page block relationship',
      {
        pages: [
          {
            id: 'page-1',
            layout: [
              {
                blockType: 'wrapper',
                nested: [{ blockType: 'newsEventsTabs', classifications: ['classification-1'] }],
              },
            ],
          },
        ],
      },
      [],
      'pages',
    ],
    [
      'current detail-template global relationship',
      {},
      [{ blockType: 'newsEventsTabs', classifications: [{ id: 'classification-1' }] }],
      'news-events-detail-template',
    ],
  ] as const)(
    'detects a %s reference',
    async (_label, collections, detailLayout, expectedCollection) => {
      const request = createRequest({
        collections: collections as Partial<
          Record<'news-events' | 'pages' | 'reusable-sections', unknown[]>
        >,
        detailLayout: [...detailLayout],
      })
      const { args } = createDeleteHookArgs(request)

      await expect(preventReferencedNewsEventClassificationDelete(args)).rejects.toMatchObject({
        message: 'Archive this classification before removing its references.',
        status: 409,
      })

      await expect(
        findNewsEventClassificationReference({
          classificationID: 'classification-1',
          req: request.req,
        }),
      ).resolves.toMatchObject({ collection: expectedCollection })
    },
  )

  it('does not treat removed legacy Tabs rows as classification references', async () => {
    const request = createRequest({
      collections: {
        'reusable-sections': [
          {
            id: 'section-1',
            layout: [
              {
                blockType: 'newsEventsTabs',
                tabs: [{ classification: 'news' }],
              },
            ],
          },
        ],
      },
      detailLayout: [{ blockType: 'newsEventsTabs', tabs: [{ classification: 'news' }] }],
    })

    await expect(
      findNewsEventClassificationReference({
        classificationID: 'classification-1',
        req: request.req,
      }),
    ).resolves.toBeNull()
  })

  it('paginates reference scans and excludes trashed records', async () => {
    const request = createRequest()
    request.find
      .mockResolvedValueOnce({ docs: [], hasNextPage: true, nextPage: 2 })
      .mockResolvedValueOnce({
        docs: [{ classification: 'classification-1', id: 'entry-2' }],
        hasNextPage: false,
        nextPage: null,
      })

    await expect(
      findNewsEventClassificationReference({
        classificationID: 'classification-1',
        legacyValue: 'news',
        req: request.req,
      }),
    ).resolves.toEqual({ collection: 'news-events', id: 'entry-2' })
    expect(request.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ draft: true, page: 1, trash: false }),
    )
    expect(request.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ draft: true, page: 2, trash: false }),
    )
  })

  it('allows deletion when the classification is unused', async () => {
    const { args, find, findByID, findGlobal, req } = createDeleteHookArgs()

    await expect(preventReferencedNewsEventClassificationDelete(args)).resolves.toBeUndefined()
    expect(find).toHaveBeenCalledTimes(3)
    expect(findByID).toHaveBeenCalledOnce()
    expect(findGlobal).toHaveBeenCalledOnce()
    expect(find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'news-events',
        req,
      }),
    )
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'pages',
        req,
      }),
    )
    expect(find).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'reusable-sections',
        req,
      }),
    )
  })

  it('prevents callers from assigning the internal legacy value', async () => {
    const request = createRequest()
    const baseArgs = {
      collection: NewsEventClassifications,
      data: { legacyValue: 'news' },
      operation: 'create',
      req: request.req,
    }

    await expect(
      protectNewsEventClassificationSystemFields({
        ...baseArgs,
        context: {},
      } as unknown as Parameters<typeof protectNewsEventClassificationSystemFields>[0]),
    ).rejects.toMatchObject({
      message: 'The internal compatibility value cannot be assigned manually.',
      status: 409,
    })
  })

  it('prevents changing an assigned legacy value', async () => {
    const find = vi.fn()
    const req = { payload: { find } } as unknown as PayloadRequest

    await expect(
      protectNewsEventClassificationSystemFields({
        collection: NewsEventClassifications,
        context: {},
        data: { legacyValue: 'event' },
        operation: 'update',
        originalDoc: { behavior: 'story', id: 'classification-1', legacyValue: 'news' },
        req,
      } as unknown as Parameters<typeof protectNewsEventClassificationSystemFields>[0]),
    ).rejects.toMatchObject({
      message: 'The compatibility value for a seeded classification cannot be changed.',
      status: 409,
    })
    expect(find).not.toHaveBeenCalled()

    await expect(
      protectNewsEventClassificationSystemFields({
        collection: NewsEventClassifications,
        context: {},
        data: { legacyValue: 'news' },
        operation: 'update',
        originalDoc: { behavior: 'story', id: 'classification-2', legacyValue: null },
        req,
      } as unknown as Parameters<typeof protectNewsEventClassificationSystemFields>[0]),
    ).rejects.toMatchObject({
      message: 'The compatibility value for a seeded classification cannot be changed.',
      status: 409,
    })
  })

  it('prevents changing behavior while the classification is referenced', async () => {
    const { find, req } = createRequest({
      collections: {
        pages: [
          {
            id: 'page-1',
            layout: [{ blockType: 'newsEventsTabs', classifications: ['classification-1'] }],
          },
        ],
      },
    })

    await expect(
      protectNewsEventClassificationSystemFields({
        collection: NewsEventClassifications,
        context: {},
        data: { behavior: 'event' },
        operation: 'update',
        originalDoc: { behavior: 'story', id: 'classification-1', legacyValue: null },
        req,
      } as unknown as Parameters<typeof protectNewsEventClassificationSystemFields>[0]),
    ).rejects.toMatchObject({
      message:
        'Remove this classification from News & Events entries and tabs before changing its behavior.',
      status: 409,
    })
    expect(find).toHaveBeenCalledTimes(2)
  })

  it('allows behavior changes while unused and unrelated edits while referenced', async () => {
    const { find, findGlobal, req } = createRequest()
    const baseArgs = {
      collection: NewsEventClassifications,
      context: {},
      operation: 'update',
      originalDoc: { behavior: 'story', id: 'classification-1', legacyValue: 'news' },
      req,
    }

    await expect(
      protectNewsEventClassificationSystemFields({
        ...baseArgs,
        data: { behavior: 'event', legacyValue: 'news' },
      } as unknown as Parameters<typeof protectNewsEventClassificationSystemFields>[0]),
    ).resolves.toMatchObject({ behavior: 'event' })
    expect(find).toHaveBeenCalledTimes(3)
    expect(findGlobal).toHaveBeenCalledOnce()

    find.mockClear()
    await expect(
      protectNewsEventClassificationSystemFields({
        ...baseArgs,
        data: { title: 'Latest News' },
      } as unknown as Parameters<typeof protectNewsEventClassificationSystemFields>[0]),
    ).resolves.toMatchObject({ title: 'Latest News' })
    expect(find).not.toHaveBeenCalled()
  })
})
