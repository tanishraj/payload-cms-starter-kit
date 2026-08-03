import type { ArrayField, Block, CheckboxField, RadioField, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionModeField, createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'

type ProgramItemSiblingData = {
  linkType?: 'none' | 'page' | 'custom' | null
}

const isPageLink = (_data: unknown, siblingData: ProgramItemSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: ProgramItemSiblingData) =>
  siblingData?.linkType === 'custom'

const hasLink = (_data: unknown, siblingData: ProgramItemSiblingData) =>
  siblingData?.linkType !== 'none' && siblingData?.linkType != null

const programsField: ArrayField = {
  name: 'programs',
  label: 'Programs',
  type: 'array',
  minRows: 1,
  maxRows: 24,
  admin: {
    initCollapsed: true,
    description: 'Each card represents one academic program or course.',
  },
  fields: [
    {
      name: 'image',
      label: 'Cover Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      label: 'Department / Category',
      type: 'text',
      admin: {
        description: 'Used for the filter tabs (e.g. Engineering, Management, Sciences).',
      },
    },
    {
      name: 'badge',
      label: 'Badge',
      type: 'text',
      admin: {
        description: 'Short label on the card (e.g. AICTE Approved, New Batch 2025).',
      },
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short program overview, 1–2 sentences.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'duration',
          label: 'Duration',
          type: 'text',
          admin: {
            description: 'e.g. 4 Years',
            width: '50%',
          },
        },
        {
          name: 'intake',
          label: 'Intake',
          type: 'text',
          admin: {
            description: 'e.g. 60 Seats',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'linkType',
      label: 'Link',
      type: 'radio',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
      admin: { layout: 'horizontal' },
    } satisfies RadioField,
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: isPageLink },
    },
    {
      name: 'url',
      label: 'Custom URL',
      type: 'text',
      admin: { condition: isCustomLink },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: hasLink },
    } satisfies CheckboxField,
  ],
}

export const ProgramGridBlock: Block = {
  admin: getBlockThumbnailAdmin('programGrid'),
  slug: 'programGrid',
  interfaceName: 'ProgramGridBlock',
  labels: {
    singular: 'Program Grid',
    plural: 'Program Grids',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
              admin: { description: 'Small label above the section title.' },
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            programsField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            createContentActionModeField(),
            {
              name: 'actionVariant',
              label: 'Button Variant',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Primary', value: 'default' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
              ],
              admin: {
                condition: (_, siblingData) => siblingData?.actionMode === 'button',
              },
            } satisfies SelectField,
            {
              name: 'columns',
              label: 'Columns (Grid mode)',
              type: 'select',
              defaultValue: '3',
              options: [
                { label: '2 columns', value: '2' },
                { label: '3 columns', value: '3' },
                { label: '4 columns', value: '4' },
              ],
              required: true,
              admin: {
                condition: (_, siblingData) => siblingData?.viewMode === 'grid',
              },
            } satisfies SelectField,
            {
              name: 'viewMode',
              label: 'View Mode',
              type: 'select',
              defaultValue: 'grid',
              options: [
                { label: 'Card Grid', value: 'grid' },
                { label: 'List', value: 'list' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'showFilter',
              label: 'Show Category Filter',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Displays tabs so visitors can filter programs by department/category.',
              },
            } satisfies CheckboxField,
            {
              name: 'ctaLabel',
              label: 'Card CTA Label',
              type: 'text',
              defaultValue: 'Learn More',
              admin: {
                description: 'Label for the link button on each program card.',
              },
            },
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
              required: true,
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
