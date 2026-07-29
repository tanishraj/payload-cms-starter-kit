import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { validateSEOContract } from '@/hooks/validateSEOContract'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  admin: {
    group: 'Taxonomy',
    hidden: hideFromUsersWithoutCapability('manage_taxonomy'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description:
      'Flat keyword labels for cross-linking content — e.g. "scholarship", "AI research", "graduation". Unlike Topics, tags have no hierarchy.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_taxonomy'),
    delete: requireCapability('manage_taxonomy'),
    read: allowPublicReadOrCapability([
      'manage_taxonomy',
      'manage_articles',
      'publish_articles',
      'manage_news_events',
      'publish_news_events',
      'manage_reviews',
      'publish_reviews',
    ]),
    update: requireCapability('manage_taxonomy'),
  },
  hooks: {
    beforeChange: [validateSEOContract()],
  },
  timestamps: true,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            slugField({
              useAsSlug: 'title',
            }),
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description:
                  'Optional short description for editorial context and tag archive metadata.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [...buildSEOFields()],
        },
      ],
    },
  ],
}
