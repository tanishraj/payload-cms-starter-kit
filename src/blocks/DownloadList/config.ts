import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'

const downloadsField: ArrayField = {
  name: 'downloads',
  label: 'Downloads',
  type: 'array',
  minRows: 1,
  admin: {
    initCollapsed: true,
    description: 'Files or links available for download.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'text',
      admin: { description: 'Brief note about the file (e.g. "Application form for 2025 intake").' },
    },
    {
      name: 'category',
      type: 'text',
      admin: { description: 'Optional group label (e.g. "Prospectus", "Forms", "Reports").' },
    },
    {
      name: 'file',
      label: 'File Upload',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Upload a file to Payload media. Takes priority over external URL.' },
    },
    {
      name: 'externalUrl',
      label: 'External URL',
      type: 'text',
      admin: {
        description: 'Used when file is hosted externally. Ignored if a file is uploaded above.',
      },
    },
    {
      name: 'fileType',
      label: 'File Type Label',
      type: 'text',
      admin: {
        description: 'Override auto-detected type (e.g. "PDF", "XLSX"). Shown as a badge.',
      },
    },
  ],
}

export const DownloadListBlock: Block = {
  admin: getBlockThumbnailAdmin('downloadList'),
  slug: 'downloadList',
  interfaceName: 'DownloadListBlock',
  labels: {
    singular: 'Download List',
    plural: 'Download Lists',
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
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            downloadsField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'displayMode',
              label: 'Display Mode',
              type: 'select',
              defaultValue: 'list',
              options: [
                { label: 'List (rows with icons)', value: 'list' },
                { label: 'Cards (grid)', value: 'cards' },
                { label: 'Compact (dense table-like rows)', value: 'compact' },
              ],
            } satisfies SelectField,
            {
              name: 'showFilter',
              label: 'Show Category Filter',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show filter buttons when items have different categories.',
              },
            },
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
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
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
