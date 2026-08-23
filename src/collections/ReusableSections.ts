import type { CollectionConfig } from 'payload'

import { reusableSectionBuilderBlocks } from '@/blocks/blockCatalog'
import {
  allowDraftPublishedReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { revalidateGlobalsCache } from '@/hooks/revalidateCmsContent'

export const ReusableSections: CollectionConfig = {
  slug: 'reusable-sections',
  labels: {
    singular: 'Reusable Section',
    plural: 'Reusable Sections',
  },
  admin: {
    description:
      'Shared block groups that sync across every page that references them. Edit once, update everywhere.',
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_pages'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  access: {
    create: requireCapability('manage_pages'),
    delete: requireCapability('manage_pages'),
    read: allowDraftPublishedReadOrCapability('manage_pages'),
    readVersions: requireCapability('manage_pages'),
    update: requireCapability('manage_pages'),
  },
  hooks: {
    afterChange: [
      revalidateGlobalsCache,
      createCollectionAuditHook({
        entityType: 'reusable-section',
        getSummary: ({ doc }) => `Reusable section "${doc.title}" was updated.`,
        titleField: 'title',
      }),
    ],
  },
  versions: { drafts: true },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name shown in the admin and in the block picker.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      // Reusable Section is intentionally excluded to prevent direct recursive selection.
      blocks: reusableSectionBuilderBlocks,
    },
  ],
}
