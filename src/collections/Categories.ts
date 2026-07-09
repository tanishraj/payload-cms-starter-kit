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
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_taxonomy'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Reusable hierarchical content categories for articles and reviews.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_taxonomy'),
    delete: requireCapability('manage_taxonomy'),
    read: allowPublicReadOrCapability([
      'manage_taxonomy',
      'manage_articles',
      'publish_articles',
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
              admin: {
                description: 'Optional parent category for building a reusable category tree.',
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
