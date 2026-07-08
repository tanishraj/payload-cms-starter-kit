import { describe, expect, it, vi } from 'vitest'

import { Media } from '@/collections/Media'
import { preventMediaDeletionWhileInUse } from '@/hooks/preventMediaDeletionWhileInUse'
import { buildMediaUsageSummary, findMediaUsage } from '@/lib/mediaUsage'

describe('media governance resolver', () => {
  it('finds supported field-level usage across collections, globals, and nested blocks', async () => {
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        switch (collection) {
          case 'pages':
            return {
              docs: [
                {
                  id: 10,
                  layout: [
                    {
                      blockType: 'hero36',
                      cards: [
                        {
                          image: 7,
                          visualType: 'image',
                        },
                        {
                          image: 7,
                          visualType: 'icon',
                        },
                      ],
                    },
                  ],
                  ogImage: 7,
                  title: 'Home',
                },
              ],
            }
          case 'articles':
            return {
              docs: [
                {
                  featuredImage: { id: 7 },
                  id: 20,
                  ogImage: 99,
                  title: 'Pricing Strategy',
                },
              ],
            }
          case 'reviews':
            return {
              docs: [
                {
                  featuredImage: 5,
                  id: 30,
                  layout: [
                    {
                      blockType: 'contentSpotlight',
                      image: 7,
                    },
                  ],
                  ogImage: 7,
                  title: 'Great Service',
                },
              ],
            }
          case 'headers':
            return {
              docs: [
                {
                  id: 40,
                  layout: [
                    {
                      blockType: 'headerNavbar12',
                      customLogo: 7,
                      logoMode: 'customLogo',
                    },
                  ],
                  title: 'Main Header',
                },
              ],
            }
          case 'footers':
            return {
              docs: [
                {
                  id: 50,
                  layout: [
                    {
                      blockType: 'footer2',
                      customLogo: 7,
                      logoMode: 'siteSettingsLogo',
                    },
                  ],
                  title: 'Site Footer',
                },
              ],
            }
          case 'system-pages':
            return {
              docs: [
                {
                  id: 60,
                  layout: [
                    {
                      blockType: 'systemMaintenance',
                      image: 7,
                    },
                  ],
                  title: 'Maintenance Mode',
                },
              ],
            }
          default:
            throw new Error(`Unexpected collection lookup: ${collection}`)
        }
      }),
      findGlobal: vi.fn(async ({ slug }: { slug: string }) => {
        switch (slug) {
          case 'site-settings':
            return {
              favicon: 3,
              logo: 7,
            }
          case 'seo-settings':
            return {
              defaultImage: 7,
            }
          default:
            throw new Error(`Unexpected global lookup: ${slug}`)
        }
      }),
    }

    const references = await findMediaUsage({
      mediaID: 7,
      payload,
    })

    expect(references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentID: 10,
          documentLabel: 'Home',
          fieldPath: 'ogImage',
          locationLabel: 'Pages > Home > ogImage',
          sourceSlug: 'pages',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentID: 10,
          documentLabel: 'Home',
          fieldPath: 'layout[0].cards[0].image',
          locationLabel: 'Pages > Home > layout[0].cards[0].image',
          sourceSlug: 'pages',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentID: 20,
          documentLabel: 'Pricing Strategy',
          fieldPath: 'featuredImage',
          locationLabel: 'Articles > Pricing Strategy > featuredImage',
          sourceSlug: 'articles',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentID: 30,
          documentLabel: 'Great Service',
          fieldPath: 'ogImage',
          locationLabel: 'Reviews > Great Service > ogImage',
          sourceSlug: 'reviews',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentID: 30,
          documentLabel: 'Great Service',
          fieldPath: 'layout[0].image',
          locationLabel: 'Reviews > Great Service > layout[0].image',
          sourceSlug: 'reviews',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentID: 40,
          documentLabel: 'Main Header',
          fieldPath: 'layout[0].customLogo',
          locationLabel: 'Headers > Main Header > layout[0].customLogo',
          sourceSlug: 'headers',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentID: 60,
          documentLabel: 'Maintenance Mode',
          fieldPath: 'layout[0].image',
          locationLabel: 'System Pages > Maintenance Mode > layout[0].image',
          sourceSlug: 'system-pages',
          sourceType: 'collection',
        }),
        expect.objectContaining({
          documentLabel: 'Site Settings',
          fieldPath: 'logo',
          locationLabel: 'Site Settings > Site Settings > logo',
          sourceSlug: 'site-settings',
          sourceType: 'global',
        }),
        expect.objectContaining({
          documentLabel: 'SEO Settings',
          fieldPath: 'defaultImage',
          locationLabel: 'SEO Settings > SEO Settings > defaultImage',
          sourceSlug: 'seo-settings',
          sourceType: 'global',
        }),
      ]),
    )

    expect(references).toHaveLength(9)
    expect(buildMediaUsageSummary(references)).toBe('Used in 9 locations across 7 entries.')
    expect(buildMediaUsageSummary([])).toBe('Unused asset.')
  })

  it('adds governance and usage fields to the media collection', () => {
    expect(JSON.stringify(Media.fields)).toContain('"name":"isCriticalAsset"')
    expect(JSON.stringify(Media.fields)).toContain('"name":"replacementNotes"')
    expect(JSON.stringify(Media.fields)).toContain('"name":"usageSummary"')
    expect(JSON.stringify(Media.fields)).toContain('"name":"usageDetails"')
    expect(JSON.stringify(Media.fields)).toContain('"virtual":true')
    expect(Media.hooks?.beforeDelete).toBeDefined()
  })

  it('blocks deletion for referenced assets and allows unused assets', async () => {
    const referencedPayload = {
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs:
          collection === 'pages'
            ? [
                {
                  id: 10,
                  ogImage: 7,
                  title: 'Home',
                },
              ]
            : [],
      })),
      findGlobal: vi.fn(async () => null),
    }

    await expect(
      preventMediaDeletionWhileInUse({
        id: 7,
        req: {
          payload: referencedPayload,
        },
      } as never),
    ).rejects.toThrow(
      'Cannot delete media asset because it is still referenced in: Pages > Home > ogImage',
    )

    const unusedPayload = {
      find: vi.fn(async () => ({
        docs: [],
      })),
      findGlobal: vi.fn(async () => null),
    }

    await expect(
      preventMediaDeletionWhileInUse({
        id: 77,
        req: {
          payload: unusedPayload,
        },
      } as never),
    ).resolves.toBeUndefined()
  })
})
