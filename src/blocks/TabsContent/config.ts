import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'

const tabItemsField: ArrayField = {
  name: 'tabs',
  label: 'Tabs',
  type: 'array',
  minRows: 2,
  maxRows: 8,
  admin: {
    initCollapsed: true,
    description: 'Each tab has a label and its own content.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Short tab label shown in the tab bar.' },
    },
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
    {
      name: 'image',
      label: 'Image / Media',
      type: 'upload',
      relationTo: 'media',
    },
    createContentActionsField({ label: 'Actions', maxRows: 2 }),
  ],
}

export const TabsContentBlock: Block = {
  admin: getBlockThumbnailAdmin('tabsContent'),
  slug: 'tabsContent',
  interfaceName: 'TabsContentBlock',
  labels: {
    singular: 'Tabs Content',
    plural: 'Tabs Content',
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
              admin: { description: 'Optional small label above the section title.' },
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Optional subtitle shown above the tab bar.' },
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            tabItemsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'tabStyle',
              label: 'Tab Style',
              type: 'select',
              defaultValue: 'underline',
              options: [
                { label: 'Underline', value: 'underline' },
                { label: 'Pills', value: 'pills' },
                { label: 'Boxed', value: 'boxed' },
              ],
            } satisfies SelectField,
            {
              name: 'contentLayout',
              label: 'Content Layout',
              type: 'select',
              defaultValue: 'imageRight',
              options: [
                { label: 'Image Right', value: 'imageRight' },
                { label: 'Image Left', value: 'imageLeft' },
                { label: 'Image Top', value: 'imageTop' },
                { label: 'Text Only', value: 'textOnly' },
              ],
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
            } satisfies SelectField,
            {
              name: 'tabContentAlignment',
              label: 'Tab Content Alignment',
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
