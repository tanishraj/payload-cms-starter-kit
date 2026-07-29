import type { GlobalConfig, NumberField, SelectField } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { createGlobalAuditHook } from '@/hooks/logOperationalAuditEvent'

const entriesPerPageField = {
  name: 'entriesPerPage',
  label: 'Entries Per Page',
  type: 'number',
  defaultValue: 9,
  min: 3,
  max: 24,
  required: true,
  validate: (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 3 && value <= 24
      ? true
      : 'Entries per page must be a whole number between 3 and 24.',
} satisfies NumberField

const sizeField = {
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
} satisfies SelectField

export const NewsEventsSettings: GlobalConfig = {
  slug: 'news-events-settings',
  label: 'Content Settings',
  admin: {
    group: 'Configuration',
    hidden: hideFromUsersWithoutCapability('manage_news_events'),
  },
  access: {
    read: allowPublicReadOrCapability('manage_news_events'),
    readVersions: requireCapability('manage_news_events'),
    update: requireCapability('manage_news_events'),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      createGlobalAuditHook({
        entityType: 'news_events_settings',
        title: 'News & Events Settings',
        getSummary: () => 'News & Events archive settings were updated.',
      }),
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text' },
            { name: 'title', type: 'text', defaultValue: 'News & Events', required: true },
            { name: 'description', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'allLabel', type: 'text', defaultValue: 'All', required: true },
                { name: 'newsLabel', type: 'text', defaultValue: 'News', required: true },
                { name: 'eventsLabel', type: 'text', defaultValue: 'Events', required: true },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'upcomingEventsLabel',
                  type: 'text',
                  defaultValue: 'Upcoming Events',
                  required: true,
                },
                {
                  name: 'pastEventsLabel',
                  type: 'text',
                  defaultValue: 'Past Events',
                  required: true,
                },
                {
                  name: 'readMoreLabel',
                  type: 'text',
                  defaultValue: 'Read More',
                  required: true,
                },
              ],
            },
            {
              name: 'emptyStateTitle',
              type: 'text',
              defaultValue: 'No entries found',
              required: true,
            },
            { name: 'emptyStateDescription', type: 'textarea' },
            entriesPerPageField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [createBlockAppearanceFields({ includeTextOverride: false }), sizeField],
        },
        {
          label: 'SEO',
          fields: [...buildSEOFields()],
        },
      ],
    },
  ],
}
