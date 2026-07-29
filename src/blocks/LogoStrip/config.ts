import type { ArrayField, Block, CheckboxField, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

const logosField: ArrayField = {
  name: 'logos',
  label: 'Logos',
  type: 'array',
  minRows: 1,
  maxRows: 40,
  admin: {
    initCollapsed: true,
    description: 'Upload each accreditation, partner, or employer logo.',
  },
  fields: [
    {
      name: 'image',
      label: 'Logo Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      admin: {
        description: 'Short label shown below the logo (e.g. NAAC A+, ISO 9001).',
      },
    },
    {
      name: 'url',
      label: 'Link URL',
      type: 'text',
      admin: {
        description: 'Optional — makes the logo a clickable link.',
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: true,
    } satisfies CheckboxField,
  ],
}

export const LogoStripBlock: Block = {
  slug: 'logoStrip',
  interfaceName: 'LogoStripBlock',
  labels: {
    singular: 'Logo Strip',
    plural: 'Logo Strips',
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
              label: 'Label',
              type: 'text',
              admin: {
                description: 'Short label above the logos (e.g. Accredited By, Our Partners).',
              },
            },
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Optional section heading.',
              },
            },
            logosField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            {
              name: 'displayMode',
              label: 'Display Mode',
              type: 'select',
              defaultValue: 'marquee',
              options: [
                { label: 'Scrolling Marquee', value: 'marquee' },
                { label: 'Static Grid', value: 'grid' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'showLabels',
              label: 'Show Labels',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show the text label below each logo.',
              },
            } satisfies CheckboxField,
            {
              name: 'grayscale',
              label: 'Grayscale Logos',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Display logos in greyscale — they reveal colour on hover.',
              },
            } satisfies CheckboxField,
            {
              name: 'logoHeight',
              label: 'Logo Height',
              type: 'select',
              defaultValue: 'md',
              options: [
                { label: 'Small (32px)', value: 'sm' },
                { label: 'Medium (48px)', value: 'md' },
                { label: 'Large (64px)', value: 'lg' },
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
