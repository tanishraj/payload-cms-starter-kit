import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'

const mediaAssetTypeOptions = [
  {
    label: 'General',
    value: 'general',
  },
  {
    label: 'Logo',
    value: 'logo',
  },
  {
    label: 'Hero',
    value: 'hero',
  },
  {
    label: 'SEO',
    value: 'seo',
  },
  {
    label: 'Icon',
    value: 'icon',
  },
  {
    label: 'Document',
    value: 'document',
  },
] as const

const imageOnlyAssetTypes = new Set(['hero', 'logo', 'seo'])

const beforeValidate: CollectionBeforeValidateHook = async ({ data, operation, originalDoc }) => {
  if (!data || (operation !== 'create' && operation !== 'update')) {
    return data
  }

  const assetType = typeof data.assetType === 'string' ? data.assetType : originalDoc?.assetType
  const mimeType = typeof data.mimeType === 'string' ? data.mimeType : originalDoc?.mimeType

  if (assetType && imageOnlyAssetTypes.has(assetType) && (!mimeType || !mimeType.startsWith('image/'))) {
    const labels: Record<string, string> = {
      hero: 'Hero',
      logo: 'Logo',
      seo: 'SEO',
    }

    throw new Error(`${labels[assetType]} assets must use an uploaded image file.`)
  }

  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_media'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'assetType', 'alt', 'updatedAt'],
    listSearchableFields: ['title', 'alt', 'filename'],
  },
  access: {
    create: requireCapability('manage_media'),
    delete: requireCapability('manage_media'),
    read: allowPublicReadOrCapability('manage_media'),
    readVersions: requireCapability('manage_media'),
    update: requireCapability('manage_media'),
  },
  hooks: {
    beforeValidate: [beforeValidate],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Internal asset name used in the admin panel.',
      },
    },
    {
      name: 'assetType',
      label: 'Asset Type',
      type: 'select',
      defaultValue: 'general',
      options: [...mediaAssetTypeOptions],
      admin: {
        description:
          'Use Logo, Hero, and SEO for image assets only. Logo: prefer transparent background and clean padding. Hero: prefer wide, high-resolution imagery for desktop layouts. SEO: prefer Open Graph-friendly images around 1200x630.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for accessibility and SEO. Keep logo alt concise, describe meaningful hero imagery, and write SEO alt as a clear preview description.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      admin: {
        description: 'Optional labels to make assets easier to find later.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'value',
          label: 'Tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description:
          'Optional internal notes about where or how this asset should be used, plus any preferred sizing or placement guidance for editors.',
      },
    },
  ],
  upload: true,
}
