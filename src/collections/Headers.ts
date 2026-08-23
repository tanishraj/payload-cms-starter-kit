import { type CollectionConfig } from 'payload'

import {
  allowDraftPublishedReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { HeaderNavbar12Block } from '@/blocks/HeaderNavbar12/config'
import { projectSlugField } from '@/fields/projectSlugField'
import { createDraftPublishQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'
import { revalidateGlobalsCache } from '@/hooks/revalidateCmsContent'

export const Headers: CollectionConfig = {
  slug: 'headers',
  labels: {
    singular: 'Header',
    plural: 'Headers',
  },
  admin: {
    group: 'Site Structure',
    hidden: hideFromUsersWithoutCapability('manage_headers'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    description: 'Reusable site header presets powered by header layout blocks.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_headers'),
    delete: requireCapability('manage_headers'),
    read: allowDraftPublishedReadOrCapability('manage_headers'),
    readVersions: requireCapability('manage_headers'),
    update: requireCapability('manage_headers'),
  },
  hooks: {
    afterChange: [
      revalidateGlobalsCache,
      createDraftPublishQueueHook({
        sourceAdminPathPrefix: '/admin/collections/headers',
        sourceCollection: 'headers',
        summary: (_doc, title) => `${title} has unpublished draft changes.`,
        titleField: 'title',
      }),
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
    },
    projectSlugField({
      useAsSlug: 'title',
    }),
    {
      name: 'layout',
      type: 'blocks',
      blocks: [HeaderNavbar12Block],
      admin: {
        initCollapsed: true,
      },
    },
  ],
}
