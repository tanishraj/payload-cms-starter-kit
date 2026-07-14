import type { ArrayField, Block, CheckboxField, NumberField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { statsStripThumbnail } from './thumbnail'

const itemsField = {
  name: 'items',
  type: 'array',
  minRows: 1,
  fields: [
    {
      name: 'prefix',
      type: 'text',
    },
    {
      name: 'value',
      type: 'number',
      required: true,
    },
    {
      name: 'suffix',
      type: 'text',
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
  ],
} satisfies ArrayField

export const StatsStripBlock: Block = {
  slug: 'statsStrip',
  interfaceName: 'StatsStripBlock',
  admin: {
    images: {
      thumbnail: {
        alt: 'Stats strip block preview',
        url: statsStripThumbnail,
      },
    },
  },
  labels: {
    singular: 'Stats Strip',
    plural: 'Stats Strips',
  },
  fields: [
    itemsField,
    createBlockAppearanceFields(),
    {
      name: 'animationEnabled',
      type: 'checkbox',
      defaultValue: true,
    } satisfies CheckboxField,
    {
      name: 'animationDuration',
      type: 'number',
      defaultValue: 1200,
      required: true,
    } satisfies NumberField,
    {
      name: 'triggerOnce',
      type: 'checkbox',
      defaultValue: true,
    } satisfies CheckboxField,
  ],
}
