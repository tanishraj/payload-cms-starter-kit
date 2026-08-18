import type { ArrayField, Block, RadioField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import {
  NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS,
  validateNewsEventsTabsConfiguredTabs,
} from '@/blocks/NewsEventsTabs/newsEventsTabsShared'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { NEWS_EVENT_CLASSIFICATIONS } from '@/lib/newsEventClassifications'

export const NewsEventsTabsBlock: Block = {
  admin: getBlockThumbnailAdmin('newsEventsTabs'),
  slug: 'newsEventsTabs',
  interfaceName: 'NewsEventsTabsBlock',
  labels: {
    singular: 'News & Events Tabs',
    plural: 'News & Events Tabs',
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
              admin: { description: 'Small label above the optional section heading.' },
            },
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Optional. The classification tabs can render without a heading.',
              },
            },
            {
              name: 'accentTitle',
              label: 'Accent Title (Italic)',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Header Actions', maxRows: 2 }),
            createContentActionsField({
              name: 'footerActions',
              label: 'Footer Actions',
              maxRows: 2,
            }),
            {
              name: 'allTabLabel',
              label: 'All Tab Label',
              type: 'text',
              defaultValue: 'All',
              admin: {
                description: 'The mandatory first tab. Leave blank to use “All”.',
              },
            },
            {
              name: 'tabs',
              label: 'Classification Tabs',
              type: 'array',
              defaultValue: NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS,
              maxRows: NEWS_EVENT_CLASSIFICATIONS.length,
              labels: {
                singular: 'Tab',
                plural: 'Tabs',
              },
              validate: validateNewsEventsTabsConfiguredTabs,
              admin: {
                description:
                  'Add, remove, rename, or drag tabs into order. Each classification can be used once; All is always first.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'classification',
                  label: 'Category',
                  type: 'select',
                  options: NEWS_EVENT_CLASSIFICATIONS.map(({ adminLabel, value }) => ({
                    label: adminLabel,
                    value,
                  })),
                  required: true,
                } satisfies SelectField,
                {
                  name: 'label',
                  label: 'Display Label',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Visitor-facing label for this tab.',
                  },
                },
              ],
            } satisfies ArrayField,
            {
              name: 'itemsPerTab',
              label: 'Items Per Tab',
              type: 'select',
              defaultValue: '6',
              options: [
                { label: '3', value: '3' },
                { label: '6', value: '6' },
                { label: '9', value: '9' },
                { label: '12', value: '12' },
              ],
              required: true,
              admin: {
                description:
                  'Number of published entries shown initially and appended by each Load More request.',
              },
            } satisfies SelectField,
            {
              name: 'loadMoreLabel',
              label: 'Load More Label',
              type: 'text',
              defaultValue: 'Load More',
              admin: {
                description: 'Shown when the selected tab has more published entries.',
              },
            },
            {
              name: 'newsActionLabel',
              label: 'News Action Label',
              type: 'text',
              defaultValue: 'Read update',
            },
            {
              name: 'eventActionLabel',
              label: 'Event Action Label',
              type: 'text',
              defaultValue: 'View details',
            },
            {
              name: 'emptyStateMessage',
              label: 'Empty State Message',
              type: 'text',
              defaultValue: 'No entries in this classification.',
              admin: {
                description: 'Shown when the selected classification has no published entries.',
              },
            },
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'layoutStyle',
              label: 'Layout',
              type: 'select',
              defaultValue: 'cardGrid',
              options: [
                { label: 'Card Grid', value: 'cardGrid' },
                { label: 'Editorial List', value: 'editorialList' },
              ],
              required: true,
              admin: {
                description: 'Choose cards or a full-width editorial list for the tab results.',
              },
            } satisfies SelectField,
            {
              name: 'cardsPerRow',
              label: 'Cards Per Row',
              type: 'radio',
              defaultValue: '3',
              options: [
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4', value: '4' },
              ],
              required: true,
              admin: {
                condition: (_data, siblingData) => siblingData?.layoutStyle !== 'editorialList',
                description: 'Maximum cards in each desktop row.',
                layout: 'horizontal',
              },
            } satisfies RadioField,
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
              admin: {
                description: 'Header actions only sit beside the heading when aligned left.',
              },
            } satisfies SelectField,
            {
              name: 'headerActionAlignment',
              label: 'Header Action Vertical Alignment',
              type: 'radio',
              defaultValue: 'center',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' },
              ],
              required: true,
              admin: {
                condition: (_data, siblingData) => siblingData?.contentAlignment !== 'center',
                description:
                  'Aligns header actions against the content when they appear beside the heading.',
                layout: 'horizontal',
              },
            } satisfies RadioField,
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
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
