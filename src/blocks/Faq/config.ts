import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { ArrayField, Block, CheckboxField, GroupField, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'
type FaqBlockSiblingData = {
  layoutMode?: 'fiftyFifty' | 'fullWidth' | 'oneThird' | null
}

const hasSplitLayout = (_data: unknown, siblingData: FaqBlockSiblingData) =>
  siblingData?.layoutMode !== 'fullWidth'

const faqItemsField = {
  name: 'items',
  label: 'FAQ Items',
  type: 'array',
  minRows: 1,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
    },
  ],
} satisfies ArrayField

const profileGroupField = {
  name: 'profile',
  label: 'Profile',
  type: 'group',
  fields: [
    {
      name: 'image',
      label: 'Profile Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
    },
  ],
} satisfies GroupField

const contactGroupField = {
  name: 'contact',
  label: 'Contact Prompt',
  type: 'group',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    createContentActionsField(),
  ],
} satisfies GroupField

const sideColumnField = {
  name: 'sideColumn',
  label: 'Side Column',
  type: 'group',
  admin: {
    condition: hasSplitLayout,
  },
  fields: [profileGroupField, contactGroupField],
} satisfies GroupField

export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'heading',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({
              name: 'headerActions',
              label: 'Header Actions',
            }),
            faqItemsField,
            sideColumnField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
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
              name: 'layoutMode',
              label: 'Layout Mode',
              type: 'select',
              defaultValue: 'fiftyFifty',
              options: [
                { label: '50 / 50', value: 'fiftyFifty' },
                { label: 'One-Third Side Column', value: 'oneThird' },
                { label: 'Full Width', value: 'fullWidth' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'faqPlacement',
              label: 'FAQ Placement',
              type: 'select',
              defaultValue: 'right',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                condition: hasSplitLayout,
              },
              required: true,
            } satisfies SelectField,
            createContentActionModeField({
              name: 'headerActionMode',
              label: 'Header Action Mode',
            }),
            createContentActionModeField({
              name: 'sideActionMode',
              label: 'Side Column Action Mode',
              condition: hasSplitLayout,
            }),
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
            {
              name: 'defaultOpenFirst',
              label: 'Open First Item By Default',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
