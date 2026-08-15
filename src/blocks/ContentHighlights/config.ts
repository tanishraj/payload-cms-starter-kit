import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createCardTabs } from '@/blocks/shared/cardThemeFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'

type MarkerSiblingData = {
  markerMode?: 'custom' | 'hidden' | 'numbered' | null
}

type HeaderLayoutSiblingData = {
  headerLayout?: 'split' | 'stacked' | null
}

const isCustomMarker = (_data: unknown, siblingData: MarkerSiblingData) =>
  siblingData?.markerMode === 'custom'

const isStackedHeader = (_data: unknown, siblingData: HeaderLayoutSiblingData) =>
  siblingData?.headerLayout !== 'split'

const isSplitHeader = (_data: unknown, siblingData: HeaderLayoutSiblingData) =>
  siblingData?.headerLayout === 'split'

const itemsField = {
  name: 'items',
  label: 'Items',
  type: 'array',
  minRows: 1,
  maxRows: 6,
  required: true,
  admin: {
    initCollapsed: true,
  },
  fields: [
    createCardTabs({
      contentFields: [
        {
          name: 'markerMode',
          label: 'Marker',
          type: 'select',
          defaultValue: 'numbered',
          options: [
            { label: 'Numbered', value: 'numbered' },
            { label: 'Custom Label', value: 'custom' },
            { label: 'Hidden', value: 'hidden' },
          ],
          required: true,
          admin: {
            description: 'Choose how this card is identified before its title.',
          },
        } satisfies SelectField,
        {
          name: 'markerLabel',
          label: 'Custom Label',
          type: 'text',
          admin: {
            condition: isCustomMarker,
            description: 'Short text such as Clinical, Year 1, or Research.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        createContentActionsField({ name: 'cardAction', label: 'Card Action', maxRows: 1 }),
      ],
    }),
  ],
} satisfies ArrayField

export const ContentHighlightsBlock: Block = {
  slug: 'contentHighlights',
  interfaceName: 'ContentHighlightsBlock',
  admin: getBlockThumbnailAdmin('contentHighlights'),
  labels: {
    singular: 'Content Highlights',
    plural: 'Content Highlights',
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
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'accentTitle',
              label: 'Accent Title (Italic)',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField(),
            createContentActionsField({
              name: 'footerActions',
              label: 'Footer Actions',
              maxRows: 2,
            }),
            itemsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'layout',
              label: 'Layout',
              type: 'select',
              defaultValue: 'highlightsGrid',
              options: [
                { label: 'Editorial List', value: 'editorialRow' },
                { label: 'Calm Grid', value: 'highlightsGrid' },
                { label: 'Simple Grid', value: 'simpleGrid' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'headerLayout',
              label: 'Header Layout',
              type: 'select',
              defaultValue: 'stacked',
              options: [
                { label: 'Stacked', value: 'stacked' },
                { label: 'Split', value: 'split' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              required: true,
              admin: {
                condition: isStackedHeader,
              },
            } satisfies SelectField,
            {
              name: 'splitContentAlignment',
              label: 'Content Vertical Alignment',
              type: 'select',
              defaultValue: 'top',
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Center', value: 'center' },
                { label: 'Bottom', value: 'bottom' },
              ],
              required: true,
              admin: {
                condition: isSplitHeader,
              },
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
