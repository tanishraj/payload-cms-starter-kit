import type { ArrayField, Block, CheckboxField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

const itemsField = {
  name: 'items',
  label: 'Images',
  type: 'array',
  minRows: 1,
  maxRows: 8,
  required: true,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      label: 'Background Position',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      required: true,
    } satisfies SelectField,
    {
      name: 'title',
      type: 'text',
    },
    createContentActionsField({
      includeDisplayMode: true,
      label: 'Action',
      maxRows: 1,
      name: 'action',
    }),
  ],
} satisfies ArrayField

export const ImageMosaicBlock: Block = {
  slug: 'imageMosaic',
  interfaceName: 'ImageMosaicBlock',
  admin: getBlockThumbnailAdmin('imageMosaic'),
  labels: {
    singular: 'Image Mosaic',
    plural: 'Image Mosaics',
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
            createContentActionsField(),
            itemsField,
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
            {
              name: 'showImageOverlays',
              label: 'Show Image Titles and Actions',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
