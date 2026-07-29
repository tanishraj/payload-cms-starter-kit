import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { validateSEOContract } from '@/hooks/validateSEOContract'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Topic',
    plural: 'Topics',
  },
  admin: {
    group: 'Taxonomy',
    hidden: hideFromUsersWithoutCapability('manage_taxonomy'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description:
      'Hierarchical editorial sections — e.g. Admissions, Research, Campus Life. Each topic can own an archive page and have child topics.',
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
              name: 'parent',
              type: 'relationship',
              relationTo: 'categories',
              label: 'Parent Topic',
              admin: {
                description: 'Optional parent topic — e.g. "Research" could sit under "Academics".',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Optional short description for archive pages and editorial context.',
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
