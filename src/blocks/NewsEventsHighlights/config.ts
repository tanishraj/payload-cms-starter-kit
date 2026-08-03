import type { Block, NumberField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

export const NewsEventsHighlightsBlock: Block = {
  slug: 'newsEventsHighlights',
  interfaceName: 'NewsEventsHighlightsBlock',
  admin: getBlockThumbnailAdmin('newsEventsHighlights'),
  labels: {
    singular: 'News & Events Highlights',
    plural: 'News & Events Highlights',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text' },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            createContentActionsField({ maxRows: 1 }),
            {
              name: 'itemCount',
              label: 'Number of Items',
              type: 'number',
              defaultValue: 3,
              min: 1,
              max: 6,
              required: true,
            } satisfies NumberField,
            {
              name: 'emptyStateMessage',
              label: 'Empty State Message',
              type: 'text',
              admin: {
                description:
                  'Optional message shown when no published news or upcoming events exist.',
              },
            },
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            createContentActionModeField(),
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
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
