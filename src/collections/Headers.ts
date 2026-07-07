import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { HeaderNavbar12Block } from '../blocks/HeaderNavbar12/config'

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
    read: allowPublicReadOrCapability('manage_headers'),
    readVersions: requireCapability('manage_headers'),
    update: requireCapability('manage_headers'),
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
      blocks: [HeaderNavbar12Block],
      admin: {
        initCollapsed: true,
        description: 'Select the header block variant to use for this preset.',
      },
    },
  ],
}
