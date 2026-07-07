import {
  slugField,
  type CollectionConfig,
  type RelationshipFieldSingleValidation,
} from 'payload'

import type { Page } from '@/payload-types'
import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { robotsFieldOptions } from '@/lib/seo'

import { FormBlock } from '../blocks/Form/config'
import { Hero36Block } from '../blocks/Hero36/config'
import { createRedirectsForChangedPagePath } from '../hooks/createRedirectsForChangedPagePath'
import { migrateLegacyPageLinksBeforeChange } from '../hooks/migrateLegacyReusableLinks'
import { populatePageUrlPreview } from '../hooks/populatePageUrlPreview'
import { preventReferencedPageUnpublish } from '../hooks/preventReferencedPageUnpublish'
import {
  syncNavigationLinkAfterChange,
  syncNavigationLinkAfterDelete,
} from '../hooks/syncNavigationLinkForPage'

const extractPageID = (value: number | Page | null | undefined): number | null => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    return value.id
  }

  return null
}

const validateParentRelationship: RelationshipFieldSingleValidation = async (
  value,
  { id, req },
) => {
  const parentID = extractPageID(value as number | Page | null | undefined)

  if (!parentID || id == null) {
    return true
  }

  const currentPageID = typeof id === 'string' ? Number(id) : id

  if (parentID === currentPageID) {
    return 'A page cannot be its own parent.'
  }

  const visited = new Set<number>([currentPageID])
  let nextParentID: number | null = parentID

  while (nextParentID != null) {
    if (visited.has(nextParentID)) {
      return 'This parent selection would create a circular page hierarchy.'
    }

    visited.add(nextParentID)

    const parentPage = await req.payload.findByID({
      collection: 'pages',
      id: nextParentID,
      depth: 0,
      req,
    })

    nextParentID = extractPageID(parentPage.parent as number | Page | null | undefined)
  }

  return true
}

const previewBreakpoints = [
  {
    name: 'desktop',
    label: 'Desktop',
    width: 1440,
    height: 900,
  },
  {
    name: 'tablet',
    label: 'Tablet',
    width: 834,
    height: 1112,
  },
  {
    name: 'mobile',
    label: 'Mobile',
    width: 390,
    height: 844,
  },
] as const

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_pages'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description:
      'Flexible website pages with reusable layout blocks, SEO controls, and publishing settings.',
    listSearchableFields: ['title', 'slug'],
    livePreview: {
      breakpoints: [...previewBreakpoints],
      url: ({ data }) => {
        if (!data?.id) {
          return null
        }

        const appURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        return `${appURL}/preview/page/${data.id}`
      },
    },
  },
  access: {
    create: requireCapability('manage_pages'),
    delete: requireCapability('manage_pages'),
    read: allowPublicReadOrCapability('manage_pages'),
    readVersions: requireCapability('manage_pages'),
    update: requireCapability('manage_pages'),
  },
  hooks: {
    afterRead: [populatePageUrlPreview],
    afterChange: [syncNavigationLinkAfterChange, createRedirectsForChangedPagePath],
    afterDelete: [syncNavigationLinkAfterDelete],
    beforeChange: [preventReferencedPageUnpublish, migrateLegacyPageLinksBeforeChange],
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      useAsSlug: 'title',
    }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [Hero36Block, FormBlock],
              admin: {
                initCollapsed: true,
                description:
                  'Compose the page with reusable frontend sections.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'canonicalURL',
                  label: 'Canonical URL Override',
                  type: 'text',
                  admin: {
                    description:
                      'Optional. Leave empty to use the resolved public page URL. Supports relative paths or full URLs.',
                    width: '50%',
                  },
                },
                {
                  name: 'robots',
                  type: 'select',
                  options: [...robotsFieldOptions],
                  admin: {
                    description:
                      'Optional. Leave empty to inherit the global robots setting for this page.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ogTitle',
                  label: 'Open Graph Title',
                  type: 'text',
                  admin: {
                    description:
                      'Optional. Leave empty to use the page SEO title, then global defaults.',
                    width: '50%',
                  },
                },
                {
                  name: 'ogImage',
                  label: 'Open Graph Image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional. Leave empty to use the global default social image.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'ogDescription',
              label: 'Open Graph Description',
              type: 'textarea',
              admin: {
                description:
                  'Optional. Leave empty to use the page SEO description, then global defaults.',
              },
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'publicUrlPreview',
              label: 'Public URL',
              type: 'text',
              virtual: true,
              admin: {
                readOnly: true,
                description: 'Resolved from the current saved slug and parent hierarchy.',
              },
            },
            {
              name: 'parent',
              type: 'relationship',
              relationTo: 'pages',
              filterOptions: ({ id }) => {
                if (id == null) {
                  return true
                }

                return {
                  id: {
                    not_equals: id,
                  },
                }
              },
              validate: validateParentRelationship,
              admin: {
                description: 'Use this for nested page hierarchies like /services/web-development.',
              },
            },
          ],
        },
      ],
    },
  ],
}
