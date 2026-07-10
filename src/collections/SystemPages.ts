import {
  slugField,
  type CollectionConfig,
} from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { createWorkflowQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'
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
    group: 'Website Structure',
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
    afterChange: [
      createWorkflowQueueHook({
        sourceAdminPathPrefix: '/admin/collections/system-pages',
        sourceCollection: 'system-pages',
        states: [
          {
            queueType: 'approval',
            reasonCode: 'system-page-review-required',
            summary: (_doc, title) => `${title} is awaiting editorial approval.`,
            workflowState: 'in_review',
          },
          {
            priority: () => 'high',
            queueType: 'approval',
            reasonCode: 'system-page-scheduled-publication',
            summary: (_doc, title) => `${title} is scheduled and requires publication oversight.`,
            workflowState: 'scheduled',
          },
        ],
        titleField: 'title',
      }),
      createCollectionAuditHook({
        entityType: 'system_page',
        getSummary: ({ doc, previousDoc }) =>
          `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
        titleField: 'title',
      }),
    ],
    beforeChange: [
      validateSEOContract(),
      enforceEditorialWorkflow('publish_system_pages', 'system-pages'),
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
          label: 'SEO',
          fields: [...buildSEOFields()],
        },
        {
          label: 'Workflow',
          fields: [
            {
              name: 'workflowState',
              type: 'select',
              defaultValue: 'draft',
              options: [...editorialWorkflowStateOptions],
              required: true,
            },
            {
              name: 'scheduledPublishAt',
              type: 'date',
              admin: {
                condition: (_, siblingData) => siblingData?.workflowState === 'scheduled',
              },
            },
            {
              name: 'changeSummary',
              type: 'textarea',
            },
            {
              name: 'lastReviewedAt',
              type: 'date',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'lastReviewedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'publishedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
}
