import type { ArrayField, Block, SelectField, TabsField, TextField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'

const valuesField = {
  name: 'values',
  label: 'Values / Pillars',
  type: 'array',
  maxRows: 8,
  admin: {
    initCollapsed: true,
    description: 'Optional: list core values or pillars below the body text.',
  },
  fields: [
    {
      name: 'icon',
      label: 'Icon Name',
      type: 'text',
      admin: { description: 'Lucide icon name — e.g. "Star", "Rocket", "GraduationCap". Browse all icons at lucide.dev/icons' },
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
} satisfies ArrayField

const statsField = {
  name: 'stats',
  label: 'Key Stats',
  type: 'array',
  maxRows: 4,
  admin: {
    initCollapsed: true,
    description: 'Optional inline stats shown alongside the about text.',
  },
  fields: [
    {
      name: 'value',
      label: 'Value',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "25,000+" or "A+"' },
    } satisfies TextField,
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Students Enrolled" or "NAAC Grade"' },
    } satisfies TextField,
  ],
} satisfies ArrayField

export const AboutSectionBlock: Block = {
  admin: getBlockThumbnailAdmin('aboutSection'),
  slug: 'aboutSection',
  interfaceName: 'AboutSectionBlock',
  labels: {
    singular: 'About Section',
    plural: 'About Sections',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text', admin: { description: 'e.g. "About Us" or "Our Story"' } },
            { name: 'title', type: 'text' },
            {
              name: 'body',
              label: 'Body Text',
              type: 'textarea',
              required: true,
              admin: { description: 'Main about text. Paragraphs separated by blank lines are rendered as separate paragraphs.' },
            },
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Featured image — shown beside the text in split layouts.' },
            },
            statsField,
            valuesField,
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
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
              name: 'variant',
              label: 'Variant',
              type: 'select',
              defaultValue: 'split',
              options: [
                { label: 'Split (text + image side by side)', value: 'split' },
                { label: 'Centered (text centered, image below)', value: 'centered' },
                { label: 'Text only', value: 'text' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'imagePosition',
              label: 'Image Side',
              type: 'select',
              defaultValue: 'right',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
              admin: { condition: (_data, siblingData) => siblingData?.variant === 'split' },
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
