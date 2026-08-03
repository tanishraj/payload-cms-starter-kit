import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'

const awardsField = {
  name: 'awards',
  label: 'Awards & Accreditations',
  type: 'array',
  minRows: 1,
  maxRows: 30,
  admin: { initCollapsed: true },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      admin: { description: 'e.g. "NAAC A+ Accreditation" or "QS World University Rankings #201"' },
    },
    {
      name: 'organization',
      label: 'Issuing Organization',
      type: 'text',
      admin: { description: 'e.g. "NAAC", "QS", "NIRF", "NBA"' },
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      defaultValue: 'accreditation',
      options: [
        { label: 'Accreditation', value: 'accreditation' },
        { label: 'Ranking', value: 'ranking' },
        { label: 'Award', value: 'award' },
        { label: 'Recognition', value: 'recognition' },
        { label: 'Milestone', value: 'milestone' },
      ],
    } satisfies SelectField,
    {
      name: 'year',
      label: 'Year',
      type: 'text',
      admin: { description: 'e.g. "2024" or "2023–2024"' },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      admin: { description: 'Optional detail about this award or ranking.' },
    },
  ],
} satisfies ArrayField

export const AwardsListBlock: Block = {
  slug: 'awardsList',
  interfaceName: 'AwardsListBlock',
  labels: {
    singular: 'Awards & Accreditations',
    plural: 'Awards & Accreditations',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text', admin: { description: 'Small label, e.g. "Our Achievements"' } },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            awardsField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
            } satisfies SelectField,
            {
              name: 'variant',
              label: 'Variant',
              type: 'select',
              defaultValue: 'cards',
              options: [
                { label: 'Cards grid', value: 'cards' },
                { label: 'Table list', value: 'table' },
                { label: 'Compact rows', value: 'rows' },
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
