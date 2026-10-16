import { scopedResourceAccess } from '@/access/sectionAccess'
import { enforceSectionOwnership, sectionOwnershipField } from '@/fields/sectionOwnership'
import type { CollectionConfig } from 'payload'

import { reusableSectionBuilderBlocks } from '@/blocks/blockCatalog'
import { validateUniqueBlockAnchorIDs } from '@/blocks/shared/blockAnchor'
import { hideUnlessFeature } from '@/access/featureAccess'
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
    hidden: hideUnlessFeature('reusableSections'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  access: {
    create: scopedResourceAccess('reusable-sections', 'reusableSections', 'create'),
    delete: scopedResourceAccess('reusable-sections', 'reusableSections', 'delete'),
    read: scopedResourceAccess('reusable-sections', 'reusableSections', 'read'),
    readVersions: scopedResourceAccess('reusable-sections', 'reusableSections', 'versions'),
    update: scopedResourceAccess('reusable-sections', 'reusableSections', 'update'),
  },
  hooks: {
    beforeChange: [enforceSectionOwnership],
    beforeValidate: [enforceSectionOwnership],
    afterChange: [
      revalidateGlobalsCache,
      createCollectionAuditHook({
        entityType: 'reusable-section',
        feature: 'reusableSections',
        getSummary: ({ doc }) => `Reusable section "${doc.title}" was updated.`,
        titleField: 'title',
      }),
    ],
  },
  versions: { drafts: true },
  timestamps: true,
  fields: [
    sectionOwnershipField(),
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
      validate: validateUniqueBlockAnchorIDs,
    },
  ],
}
