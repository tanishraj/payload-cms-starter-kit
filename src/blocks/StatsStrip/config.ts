import type { ArrayField, Block, CheckboxField, NumberField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

const itemsField = {
  name: 'items',
  type: 'array',
  minRows: 1,
  admin: {
    initCollapsed: true,
  },
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
  admin: getBlockThumbnailAdmin('statsStrip'),
  labels: {
    singular: 'Stats Strip',
    plural: 'Stats Strips',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [itemsField],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
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
        },
      ],
    } satisfies TabsField,
  ],
}
