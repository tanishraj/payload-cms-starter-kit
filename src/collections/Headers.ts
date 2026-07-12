import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createDraftPublishQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'

export const Headers: CollectionConfig = {
  slug: 'headers',
  labels: {
    singular: 'Header',
    plural: 'Headers',
  },
  admin: {
    group: 'Website Structure',
    hidden: hideFromUsersWithoutCapability('manage_headers'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    description: 'Reusable site header presets powered by header layout blocks.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_headers'),
    delete: requireCapability('manage_headers'),
    read: allowPublicReadOrCapability('manage_headers'),
    readVersions: requireCapability('manage_headers'),
    update: requireCapability('manage_headers'),
  },
  hooks: {
    afterChange: [
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
    slugField({
      useAsSlug: 'title',
    }),
  ],
}
