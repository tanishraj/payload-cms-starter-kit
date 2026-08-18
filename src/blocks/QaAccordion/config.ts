import type { ArrayField, Block, CheckboxField, GroupField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { embeddedContentEditor } from '@/fields/bodyEditorConfig'
type QaAccordionBlockSiblingData = {
  layoutMode?: 'fiftyFifty' | 'fullWidth' | 'oneThird' | null
}

const hasSplitLayout = (_data: unknown, siblingData: QaAccordionBlockSiblingData) =>
  siblingData?.layoutMode !== 'fullWidth'

const qaAccordionItemsField = {
  name: 'items',
  label: 'Q&A Items',
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
      editor: embeddedContentEditor,
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

export const QaAccordionBlock: Block = {
  slug: 'qaAccordion',
  interfaceName: 'QaAccordionBlock',
  admin: getBlockThumbnailAdmin('qaAccordion'),
  labels: {
    singular: 'Q&A Accordion',
    plural: 'Q&A Accordions',
  },
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
            },
            { name: 'accentTitle', label: 'Accent Title (Italic)', type: 'text' },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            createContentActionsField({
              name: 'footerActions',
              label: 'Footer Actions',
              maxRows: 2,
            }),
            qaAccordionItemsField,
            sideColumnField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
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
              name: 'accordionPlacement',
              label: 'Accordion Placement',
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
