import {
  slugField,
  type CollectionConfig,
} from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { systemPageTypeOptions, type SystemPageType } from '@/lib/systemPageTypes'

import { System404Block } from '../blocks/System404/config'
import { SystemComingSoonBlock } from '../blocks/SystemComingSoon/config'
import { SystemMaintenanceBlock } from '../blocks/SystemMaintenance/config'
import { migrateLegacySystemPageLinksBeforeChange } from '../hooks/migrateLegacyReusableLinks'
import { preventReferencedSystemPageInvalidation } from '../hooks/preventReferencedSystemPageInvalidation'

const blockTypeBySystemPageType: Record<SystemPageType, 'system404' | 'systemMaintenance' | 'systemComingSoon'> =
  {
    '404': 'system404',
    maintenance: 'systemMaintenance',
    comingSoon: 'systemComingSoon',
  }

const validateSystemLayout = (
  value: unknown,
  { data }: { data?: { type?: SystemPageType | null } },
) => {
  if (!Array.isArray(value) || value.length === 0) {
    return 'Layout requires one block.'
  }

  const selectedType = data?.type

  if (!selectedType) {
    return true
  }

  const expectedBlockType = blockTypeBySystemPageType[selectedType]
  const [firstBlock] = value

  if (!firstBlock || typeof firstBlock !== 'object' || !('blockType' in firstBlock)) {
    return 'Layout contains an invalid block.'
  }

  if (firstBlock.blockType !== expectedBlockType) {
    return 'Selected block must match the system page type.'
  }

  return true
}

export const SystemPages: CollectionConfig = {
  slug: 'system-pages',
  labels: {
    singular: 'System Page',
    plural: 'System Pages',
  },
  admin: {
    group: 'Site Structure',
    hidden: hideFromUsersWithoutCapability('manage_system_pages'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'updatedAt'],
    description: 'Reusable presets for 404, maintenance, and coming soon experiences.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_system_pages'),
    delete: requireCapability('manage_system_pages'),
    read: allowPublicReadOrCapability('manage_system_pages'),
    readVersions: requireCapability('manage_system_pages'),
    update: requireCapability('manage_system_pages'),
  },
  hooks: {
    beforeChange: [
      preventReferencedSystemPageInvalidation,
      migrateLegacySystemPageLinksBeforeChange,
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
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: '404',
              options: [...systemPageTypeOptions],
              admin: {
                description:
                  'Choose which system behavior this preset is intended for. Only matching presets appear in System Defaults.',
              },
            },
            {
              name: 'layout',
              label: 'Layout',
              type: 'blocks',
              required: true,
              minRows: 1,
              maxRows: 1,
              blocks: [System404Block, SystemMaintenanceBlock, SystemComingSoonBlock],
              validate: validateSystemLayout,
              admin: {
                initCollapsed: true,
                description:
                  'Choose one system block variant for this preset. The selected block must match the system page type.',
              },
            },
          ],
        },
        {
          label: 'Meta',
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
          ],
        },
      ],
    },
  ],
}
