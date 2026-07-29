import type { ArrayField, Block, RadioField, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

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

type ItemSiblingData = {
  linkType?: 'none' | 'page' | 'custom' | null
}

const isPageLink = (_data: unknown, siblingData: ItemSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: ItemSiblingData) =>
  siblingData?.linkType === 'custom'

const hasLink = (_data: unknown, siblingData: ItemSiblingData) =>
  siblingData?.linkType !== 'none' && siblingData?.linkType != null

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
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short supporting text shown below the title.',
      },
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
    },
  ],
}

export const MediaCarouselBlock: Block = {
  slug: 'mediaCarousel',
  interfaceName: 'MediaCarouselBlock',
  labels: {
    singular: 'Media Carousel',
    plural: 'Media Carousels',
  },
  admin: {},
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
            {
              name: 'description',
              type: 'textarea',
            },
            itemsField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            {
              name: 'contentAlignment',
              label: 'Header Alignment',
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
              label: 'Size',
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
