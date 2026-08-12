import type { ArrayField, Block, CheckboxField, RadioField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

type ReasonSiblingData = {
  linkType?: 'custom' | 'none' | 'page' | null
}

const isPageLink = (_data: unknown, siblingData: ReasonSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: ReasonSiblingData) =>
  siblingData?.linkType === 'custom'

const hasLink = (_data: unknown, siblingData: ReasonSiblingData) =>
  siblingData?.linkType === 'page' || siblingData?.linkType === 'custom'

const reasonsField = {
  name: 'reasons',
  label: 'Reasons',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 8,
  admin: {
    description: 'Rows are numbered automatically in their displayed order.',
    initCollapsed: true,
  },
  fields: [
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
      name: 'linkType',
      label: 'Link',
      type: 'radio',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
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
      admin: {
        condition: hasLink,
      },
    } satisfies CheckboxField,
  ],
} satisfies ArrayField

export const EditorialReasonsBlock: Block = {
  admin: getBlockThumbnailAdmin('editorialReasons'),
  slug: 'editorialReasons',
  interfaceName: 'EditorialReasonsBlock',
  labels: {
    singular: 'Editorial Reasons',
    plural: 'Editorial Reasons',
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
              admin: {
                description: 'Small label above the section title.',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'accentTitle',
              label: 'Accent Title',
              type: 'text',
              admin: {
                description: 'Optional emphasized second line of the heading.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            reasonsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            createContentActionModeField(),
            {
              name: 'introVerticalAlignment',
              label: 'Introduction Vertical Alignment',
              type: 'select',
              defaultValue: 'top',
              required: true,
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Center', value: 'center' },
                { label: 'Bottom', value: 'bottom' },
              ],
            } satisfies SelectField,
            {
              name: 'stickyIntro',
              label: 'Keep Introduction Visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Keeps the introduction visible beside longer lists on large screens.',
              },
            } satisfies CheckboxField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              required: true,
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
