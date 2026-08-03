import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'

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
  { label: 'Rocket', value: 'Rocket' },
  { label: 'Sparkles', value: 'Sparkles' },
  { label: 'Target', value: 'Target' },
  { label: 'Award', value: 'Award' },
  { label: 'Lightbulb', value: 'Lightbulb' },
  { label: 'GraduationCap', value: 'GraduationCap' },
  { label: 'BookOpen', value: 'BookOpen' },
  { label: 'FlaskConical', value: 'FlaskConical' },
  { label: 'Building', value: 'Building2' },
]

const itemsField: ArrayField = {
  name: 'items',
  label: 'Bento Items',
  type: 'array',
  minRows: 2,
  maxRows: 8,
  admin: {
    initCollapsed: true,
    description: 'Each item is a bento cell. Size controls how much grid space it occupies.',
  },
  fields: [
    {
      name: 'size',
      label: 'Cell Size',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Full Width (spans all columns)', value: 'full' },
        { label: 'Large (2/3 width)', value: 'large' },
        { label: 'Medium (1/3 width)', value: 'medium' },
        { label: 'Small (fits remaining)', value: 'small' },
      ],
    } satisfies SelectField,
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'select',
      options: ICON_OPTIONS,
      admin: { description: 'Icon shown when no image is set.' },
    } satisfies SelectField,
    {
      name: 'image',
      label: 'Background / Feature Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'accentColor',
      label: 'Accent Color',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Accent', value: 'accent' },
      ],
    } satisfies SelectField,
    {
      name: 'linkUrl',
      label: 'Link URL',
      type: 'text',
      admin: { description: 'Optional — makes the entire cell a clickable link.' },
    },
  ],
}

export const BentoGridBlock: Block = {
  slug: 'bentoGrid',
  interfaceName: 'BentoGridBlock',
  labels: {
    singular: 'Bento Grid',
    plural: 'Bento Grids',
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
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            itemsField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields(),
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
