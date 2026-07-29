import type { Block, SelectField, TabsField } from 'payload'


import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

export const EventGalleryBlock: Block = {
  slug: 'eventGallery',
  interfaceName: 'EventGalleryBlock',
  admin: getBlockThumbnailAdmin('eventGallery'),
  labels: {
    plural: 'Event Galleries',
    singular: 'Event Gallery',
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
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'galleryAlbums',
              label: 'Gallery Albums',
              type: 'relationship',
              relationTo: 'gallery-albums',
              hasMany: true,
              required: true,
              admin: {
                allowCreate: true,
                description:
                  'Select the albums displayed by this block. Create an album here or reorder selected albums for Manual display order.',
                isSortable: true,
              },
            },
            {
              name: 'displayOrder',
              label: 'Display Order',
              type: 'select',
              defaultValue: 'latestEventDate',
              options: [
                {
                  label: 'Latest Event Date',
                  value: 'latestEventDate',
                },
                {
                  label: 'Manual',
                  value: 'manual',
                },
              ],
              required: true,
            } satisfies SelectField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            {
              name: 'cardTextLayout',
              label: 'Card Text Placement',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Split — title left, count right', value: 'split' },
                { label: 'Center — all text centered', value: 'center' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              required: true,
            } satisfies SelectField,
            {
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
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
