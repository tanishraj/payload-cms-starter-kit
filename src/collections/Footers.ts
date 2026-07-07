import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { Footer2Block } from '../blocks/Footer2/config'

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
      required: true,
      minRows: 1,
      maxRows: 1,
      blocks: [Footer2Block],
      admin: {
        initCollapsed: true,
        description: 'Select the footer block variant to use for this preset.',
      },
    },
  ],
}
