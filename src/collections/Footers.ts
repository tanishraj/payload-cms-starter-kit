import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { Footer56Block } from '@/blocks/Footer56/config'
import { FooterMinimalBlock } from '@/blocks/FooterMinimal/config'
import { createDraftPublishQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'
import { revalidateGlobalsCache } from '@/hooks/revalidateCmsContent'

export const Footers: CollectionConfig = {
  slug: 'footers',
  labels: {
    singular: 'Footer',
    plural: 'Footers',
  },
  admin: {
    group: 'Site Structure',
    hidden: hideFromUsersWithoutCapability('manage_footers'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    description: 'Reusable site footer presets powered by footer layout blocks.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_footers'),
    delete: requireCapability('manage_footers'),
    read: allowPublicReadOrCapability('manage_footers'),
    readVersions: requireCapability('manage_footers'),
    update: requireCapability('manage_footers'),
  },
  hooks: {
    afterChange: [
      revalidateGlobalsCache,
      createDraftPublishQueueHook({
        sourceAdminPathPrefix: '/admin/collections/footers',
        sourceCollection: 'footers',
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
    slugField({
      useAsSlug: 'title',
    }),
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Footer56Block, FooterMinimalBlock],
      admin: {
        initCollapsed: true,
      },
    },
  ],
}
