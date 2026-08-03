import type { ArrayField, Block, RadioField, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField, createContentActionModeField } from '@/blocks/shared/contentActionsFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'

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
  { label: 'Lightbulb', value: 'Lightbulb' },
  { label: 'CheckCircle', value: 'CheckCircle2' },
  { label: 'Heart', value: 'Heart' },
  { label: 'BookOpen', value: 'BookOpen' },
  { label: 'GraduationCap', value: 'GraduationCap' },
  { label: 'FlaskConical', value: 'FlaskConical' },
  { label: 'Microscope', value: 'Microscope' },
  { label: 'Building', value: 'Building2' },
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
  type: 'array',
  minRows: 1,
  maxRows: 24,
  admin: {
    initCollapsed: true,
    description: 'Each item shows an icon, title, and optional description.',
  },
  fields: [
    {
      name: 'icon',
      label: 'Icon',
      type: 'select',
      required: true,
      defaultValue: 'Star',
      options: ICON_OPTIONS,
    } satisfies SelectField,
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
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
    },
  ],
}

export const IconGridBlock: Block = {
  admin: getBlockThumbnailAdmin('iconGrid'),
  slug: 'iconGrid',
  interfaceName: 'IconGridBlock',
  labels: {
    singular: 'Icon Grid',
    plural: 'Icon Grids',
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
              admin: { description: 'Small label shown above the title.' },
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Optional supporting paragraph below the title.' },
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            itemsField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields(),
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
              name: 'itemActionLabel',
              label: 'Item Action Label',
              type: 'text',
              defaultValue: 'Learn More',
              admin: {
                description: 'Label shown on the button or link for each item.',
              },
            },
            {
              name: 'variant',
              label: 'Card Style',
              type: 'select',
              defaultValue: 'card',
              options: [
                { label: 'Card (bordered box)', value: 'card' },
                { label: 'Minimal (icon + text, no box)', value: 'minimal' },
                { label: 'Icon Top (centered icon above title)', value: 'iconTop' },
              ],
            } satisfies SelectField,
            {
              name: 'columns',
              label: 'Columns',
              type: 'select',
              defaultValue: '3',
              options: [
                { label: '2 Columns', value: '2' },
                { label: '3 Columns', value: '3' },
                { label: '4 Columns', value: '4' },
              ],
            } satisfies SelectField,
            {
              name: 'iconStyle',
              label: 'Icon Style',
              type: 'select',
              defaultValue: 'square',
              options: [
                { label: 'Square (filled bg)', value: 'square' },
                { label: 'Circle (filled bg)', value: 'circle' },
                { label: 'Outline (border only)', value: 'outline' },
                { label: 'Plain (no container)', value: 'plain' },
              ],
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
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
