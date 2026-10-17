import { type CollectionConfig, type RelationshipFieldSingleValidation } from 'payload'
import { scopedPageAccess, hideUnlessSectionFeature } from '@/access/sectionAccess'
import { enforcePageSection } from '@/hooks/enforcePageSection'

import { pageBuilderBlocks } from '@/blocks/blockCatalog'
import { validateUniqueBlockAnchorIDs } from '@/blocks/shared/blockAnchor'
import type { Page } from '@/payload-types'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { runtimeConfig } from '@/config/runtime.server'
import { publicationMetadataFields } from '@/fields/publicationMetadataFields'
import { restorePageVersionEndpoint } from '@/endpoints/restorePageVersion'
import {
  requireSafePageRestoration,
  markRestoredPageDraft,
  auditPageRestoration,
  isPageDraftRestoration,
} from '@/lib/pageDraftRestoration'
import { createPageFromRecipeEndpoint } from '@/endpoints/createPageFromRecipe'
import { projectSlugField } from '@/fields/projectSlugField'
import { enforcePublicationPolicy } from '@/hooks/enforcePublicationPolicy'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { buildLivePreviewURL } from '@/lib/siteUrl'

import { createRedirectsForChangedPagePath } from '../hooks/createRedirectsForChangedPagePath'
import { populatePageUrlPreview } from '../hooks/populatePageUrlPreview'
import { preventReferencedPageUnpublish } from '../hooks/preventReferencedPageUnpublish'
import {
  syncNavigationLinkAfterChange,
  syncNavigationLinkAfterDelete,
} from '../hooks/syncNavigationLinkForPage'
import { revalidateDeletedPageCache, revalidatePagesCache } from '../hooks/revalidateCmsContent'

const extractPageID = (
  value: string | number | Page | null | undefined,
): string | number | null => {
  if (typeof value === 'number' || typeof value === 'string') {
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
  const parentID = extractPageID(value as string | number | Page | null | undefined)

  if (!parentID || id == null) {
    return true
  }

  const currentPageID = id

  if (parentID === currentPageID) {
    return 'A page cannot be its own parent.'
  }

  const visited = new Set<string | number>([currentPageID])
  let nextParentID: string | number | null = parentID

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

    nextParentID = extractPageID(parentPage.parent as string | number | Page | null | undefined)
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

const auditPageChange = createCollectionAuditHook({
  entityType: 'page',
  feature: 'pages',
  getSummary: ({ doc, previousDoc }) =>
    `Publication status changed from ${previousDoc?._status ?? 'draft'} to ${doc._status ?? 'draft'}.`,
  titleField: 'title',
})

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '@/components/admin/PageCreateView#PageCreateView',
          },
        },
      },
    },
    group: 'Content',
    hidden: hideUnlessSectionFeature('pages'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description:
      'Flexible website pages with reusable layout blocks, SEO controls, and publishing settings. History restores create drafts; review them before publishing.',
    listSearchableFields: ['title', 'slug'],
    livePreview: {
      breakpoints: [...previewBreakpoints],
      url: ({ data }) => {
        if (!data?.id) {
          return null
        }

        return buildLivePreviewURL(`/preview/page/${data.id}`, runtimeConfig)
      },
    },
  },
  access: {
    create: scopedPageAccess('create'),
    delete: scopedPageAccess('delete'),
    read: scopedPageAccess('read'),
    readVersions: scopedPageAccess('versions'),
    update: scopedPageAccess('update'),
  },
  endpoints: [createPageFromRecipeEndpoint, restorePageVersionEndpoint],
  hooks: {
    beforeOperation: [requireSafePageRestoration],
    afterOperation: [auditPageRestoration],
    beforeValidate: [markRestoredPageDraft, enforcePageSection],
    afterRead: [populatePageUrlPreview],
    afterChange: [
      revalidatePagesCache,
      syncNavigationLinkAfterChange,
      createRedirectsForChangedPagePath,
      (args) => (isPageDraftRestoration(args.context) ? args.doc : auditPageChange(args)),
    ],
    afterDelete: [syncNavigationLinkAfterDelete, revalidateDeletedPageCache],
    beforeChange: [
      enforcePageSection,
      validateSEOContract(),
      enforcePublicationPolicy('pages', 'pages'),
      preventReferencedPageUnpublish,
    ],
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
      admin: {
        description:
          'Name this page so your team can find it. Edit the visible page content in the blocks below.',
      },
    },
    projectSlugField({
      useAsSlug: 'title',
    }),
    {
      name: 'parent',
      type: 'relationship',
      index: true,
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
        description:
          'Site Managers must choose a parent in an assigned section when creating a Page. Moving between sections and managing section roots require an Admin.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'pageEditingGuide',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/PageEditingGuideField#PageEditingGuideField',
                },
              },
            },
            {
              name: 'layout',
              label: 'Layout',
              labels: { singular: 'Block', plural: 'Blocks' },
              type: 'blocks',
              blocks: pageBuilderBlocks,
              required: false,
              validate: validateUniqueBlockAnchorIDs,
              admin: {
                description:
                  'Choose Add Block to build the page. Fill in each block, use Save Draft and check Live Preview. Publish only when the page is ready.',
                initCollapsed: true,
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [...buildSEOFields()],
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
          ],
        },
      ],
    },
    ...publicationMetadataFields('pages'),
  ],
}
