import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

const ICON_OPTIONS = [
  { label: 'Star', value: 'Star' },
  { label: 'Zap', value: 'Zap' },
  { label: 'Eye', value: 'Eye' },
  { label: 'Shield', value: 'Shield' },
  { label: 'Globe', value: 'Globe' },
  { label: 'Code', value: 'Code2' },
  { label: 'Layers', value: 'Layers' },
  { label: 'Settings', value: 'Settings2' },
  { label: 'Users', value: 'Users' },
  { label: 'Chart', value: 'BarChart2' },
  { label: 'Lock', value: 'Lock' },
  { label: 'Play', value: 'Play' },
  { label: 'Rocket', value: 'Rocket' },
  { label: 'Sparkles', value: 'Sparkles' },
  { label: 'Target', value: 'Target' },
  { label: 'Award', value: 'Award' },
  { label: 'Music', value: 'Music' },
  { label: 'Mic', value: 'Mic' },
]

const itemsField: ArrayField = {
  name: 'items',
  label: 'Slides',
  type: 'array',
  minRows: 1,
  maxRows: 12,
  admin: {
    initCollapsed: true,
    description: 'Each slide can display a video or image. Videos play on hover automatically.',
  },
  fields: [
    {
      name: 'media',
      label: 'Media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload a video (.mp4, .webm) or image. Type is detected from the file.',
      },
    },
    {
      name: 'icon',
      label: 'Icon Badge',
      type: 'select',
      options: ICON_OPTIONS,
      admin: {
        description: 'Optional icon overlaid on the media thumbnail.',
      },
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short supporting text shown below the title.',
      },
    },
    createContentActionsField({ maxRows: 1, label: 'Action', name: 'actions' }),
  ],
}

export const MediaCarouselBlock: Block = {
  admin: getBlockThumbnailAdmin('mediaCarousel'),
  slug: 'mediaCarousel',
  interfaceName: 'MediaCarouselBlock',
  labels: {
    singular: 'Media Carousel',
    plural: 'Media Carousels',
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
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2, name: 'sectionActions' }),
            itemsField,
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
              label: 'Columns',
              type: 'select',
              defaultValue: '3',
              options: [
                { label: '2 columns', value: '2' },
                { label: '3 columns', value: '3' },
                { label: '4 columns', value: '4' },
              ],
              required: true,
            } satisfies SelectField,
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
