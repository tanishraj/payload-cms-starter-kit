import type { CollectionConfig } from 'payload'

import { pageBlocks } from '@/blocks'
import { slugify } from '@/lib/slugify'

const resolvePagePath = (slug?: string | null) => {
  const normalized = slugify(slug || 'home')

  return normalized === 'home' ? '/' : `/${normalized}`
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => resolvePagePath(data?.slug as string | undefined),
    },
    preview: (data) => resolvePagePath(data?.slug as string | undefined),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Use "home" for the homepage.',
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'intro',
      type: 'textarea',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
      required: true,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') {
          return data
        }

        const source =
          typeof data.slug === 'string' && data.slug.length > 0 ? data.slug : typeof data.title === 'string' ? data.title : ''

        return {
          ...data,
          slug: slugify(source || 'home'),
        }
      },
    ],
  },
  timestamps: true,
  versions: {
    drafts: true,
  },
}
