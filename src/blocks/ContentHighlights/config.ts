import type { ArrayField, Block, CheckboxField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

type ItemLinkSiblingData = {
  linkType?: 'custom' | 'none' | 'page' | null
}

const isPageLink = (_data: unknown, siblingData: ItemLinkSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: ItemLinkSiblingData) =>
  siblingData?.linkType === 'custom'

const hasItemLink = (_data: unknown, siblingData: ItemLinkSiblingData) =>
  siblingData?.linkType === 'page' || siblingData?.linkType === 'custom'

const itemsField = {
  name: 'items',
  label: 'Items',
  type: 'array',
  minRows: 1,
  maxRows: 6,
  required: true,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'metadata',
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
      name: 'linkType',
      label: 'Item Link',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'No Link', value: 'none' },
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
      required: true,
    } satisfies SelectField,
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
        condition: hasItemLink,
      },
    } satisfies CheckboxField,
  ],
} satisfies ArrayField

export const ContentHighlightsBlock: Block = {
  slug: 'contentHighlights',
  interfaceName: 'ContentHighlightsBlock',
  admin: getBlockThumbnailAdmin('contentHighlights'),
  labels: {
    singular: 'Content Highlights',
    plural: 'Content Highlights',
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
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            createContentActionModeField(),
            {
              name: 'layout',
              label: 'Layout',
              type: 'select',
              defaultValue: 'highlightsGrid',
              options: [
                { label: 'Editorial Row', value: 'editorialRow' },
                { label: 'Highlights Grid', value: 'highlightsGrid' },
                { label: 'Simple Grid', value: 'simpleGrid' },
                { label: 'Numbered Steps', value: 'numberedSteps' },
                { label: 'Split Highlights', value: 'splitHighlights' },
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
