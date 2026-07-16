import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type {
  ArrayField,
  Block,
  CheckboxField,
  GroupField,
  RadioField,
  SelectField,
  TabsField,
} from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

type LinkType = 'page' | 'custom'
type FaqBlockSiblingData = {
  sideColumnEnabled?: boolean | null
}

type ContactLinkSiblingData = {
  linkType?: LinkType | null
}

const isSideColumnEnabled = (_data: unknown, siblingData: FaqBlockSiblingData) =>
  siblingData?.sideColumnEnabled === true

const isPageLink = (_data: unknown, siblingData: ContactLinkSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: ContactLinkSiblingData) =>
  siblingData?.linkType === 'custom'

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
    {
      name: 'linkLabel',
      label: 'CTA Label',
      type: 'text',
    },
    {
      name: 'linkType',
      type: 'radio',
      defaultValue: 'page',
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
      admin: {
        layout: 'horizontal',
      },
    } satisfies RadioField,
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: isPageLink,
      },
    },
    {
      name: 'url',
      label: 'Custom URL',
      type: 'text',
      admin: {
        condition: isCustomLink,
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
    } satisfies CheckboxField,
  ],
} satisfies GroupField

const sideColumnField = {
  name: 'sideColumn',
  label: 'Side Column',
  type: 'group',
  admin: {
    condition: isSideColumnEnabled,
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
            faqItemsField,
            {
              name: 'sideColumnEnabled',
              label: 'Enable Side Column',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
            sideColumnField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
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
