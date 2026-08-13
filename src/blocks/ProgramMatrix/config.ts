import type { ArrayField, Block, CheckboxField, RadioField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createCardTabs } from '@/blocks/shared/cardThemeFields'
import { createContentActionsWithModeFields } from '@/blocks/shared/contentActionsFields'
import { createIconField } from '@/blocks/shared/iconField'

type ProgrammeItemSiblingData = {
  linkType?: 'none' | 'page' | 'custom' | null
}

const isPageLink = (_data: unknown, siblingData: ProgrammeItemSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: ProgrammeItemSiblingData) =>
  siblingData?.linkType === 'custom'

const hasLink = (_data: unknown, siblingData: ProgrammeItemSiblingData) =>
  siblingData?.linkType === 'page' || siblingData?.linkType === 'custom'

const itemsField: ArrayField = {
  name: 'items',
  label: 'Programmes',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 24,
  admin: {
    initCollapsed: true,
    description: 'Each row represents one academic programme or structured offering.',
  },
  fields: [
    createCardTabs({
      contentFields: [
        createIconField({
          description:
            'Lucide icon name, such as Hospital, hospital, GraduationCap, or graduation-cap.',
        }),
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'metadata',
          type: 'text',
          admin: {
            description: 'Short detail such as 4.5 Years + 1 Year Internship.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
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
          admin: {
            layout: 'horizontal',
          },
        } satisfies RadioField,
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: isPageLink,
          },
        },
        {
          name: 'url',
          label: 'Custom URL',
          type: 'text',
          admin: {
            condition: isCustomLink,
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: hasLink,
          },
        } satisfies CheckboxField,
      ],
    }),
  ],
}

export const ProgramMatrixBlock: Block = {
  admin: getBlockThumbnailAdmin('programMatrix'),
  slug: 'programMatrix',
  interfaceName: 'ProgramMatrixBlock',
  labels: {
    singular: 'Program Matrix',
    plural: 'Program Matrices',
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
              admin: {
                description: 'Small label above the section title.',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            { name: 'accentTitle', label: 'Accent Title (Italic)', type: 'text' },
            {
              name: 'description',
              type: 'textarea',
            },
            ...createContentActionsWithModeFields({ label: 'Section Actions', maxRows: 2 }),
            ...createContentActionsWithModeFields({ name: 'footerActions', label: 'Footer Actions', maxRows: 2 }),
            itemsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'actionVariant',
              label: 'Programme Button Variant',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Primary', value: 'default' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
              ],
              admin: {
                condition: (_data, siblingData) => siblingData?.actionMode === 'button',
              },
            } satisfies SelectField,
            {
              name: 'itemActionLabel',
              label: 'Programme Action Label',
              type: 'text',
              defaultValue: 'Learn More',
            },
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              required: true,
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              required: true,
              options: [
                { label: 'None', value: 'none' },
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
