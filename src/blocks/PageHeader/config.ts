import type { ArrayField, Block, RadioField, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createContentActionsWithModeFields } from '@/blocks/shared/contentActionsFields'

type BreadcrumbSiblingData = {
  linkType?: 'page' | 'custom' | null
}

const isPageLink = (_data: unknown, siblingData: BreadcrumbSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: BreadcrumbSiblingData) =>
  siblingData?.linkType === 'custom'

const breadcrumbsField: ArrayField = {
  name: 'breadcrumbs',
  label: 'Breadcrumbs',
  type: 'array',
  maxRows: 6,
  admin: {
    initCollapsed: true,
    description: 'Navigation trail shown above the page title. Last item is treated as the current page (not a link).',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'linkType',
      type: 'radio',
      defaultValue: 'page',
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
      admin: { layout: 'horizontal' },
    } satisfies RadioField,
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: isPageLink },
    },
    {
      name: 'url',
      label: 'Custom URL',
      type: 'text',
      admin: { condition: isCustomLink },
    },
  ],
}

const keyFactsField: ArrayField = {
  name: 'keyFacts',
  label: 'Key Facts',
  type: 'array',
  maxRows: 6,
  admin: {
    initCollapsed: true,
    description: 'Displayed in the right panel for the Split variant (e.g. Duration: 4 Years).',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'e.g. Duration, Intake, Mode, Eligibility' },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: { description: 'e.g. 4 Years, 60 Seats, Full Time' },
    },
  ],
}

export const PageHeaderBlock: Block = {
  admin: getBlockThumbnailAdmin('pageHeader'),
  slug: 'pageHeader',
  interfaceName: 'PageHeaderBlock',
  labels: {
    singular: 'Page Header',
    plural: 'Page Headers',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            breadcrumbsField,
            {
              name: 'eyebrow',
              type: 'text',
              admin: { description: 'Small label above the page title.' },
            },
            {
              name: 'title',
              type: 'text',
            },
            { name: 'accentTitle', label: 'Accent Title (Italic)', type: 'text' },
            {
              name: 'subtitle',
              type: 'textarea',
              admin: { description: 'Supporting line below the title.' },
            },
            ...createContentActionsWithModeFields({ label: 'Actions', maxRows: 2 }),
            ...createContentActionsWithModeFields({ name: 'footerActions', label: 'Footer Actions', maxRows: 2 }),
            {
              name: 'backgroundImage',
              label: 'Background Image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Used by the Banner and Split variants.',
              },
            },
            keyFactsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            {
              name: 'variant',
              label: 'Variant',
              type: 'select',
              defaultValue: 'minimal',
              options: [
                {
                  label: 'Minimal — title, subtitle, breadcrumb',
                  value: 'minimal',
                },
                {
                  label: 'Banner — full-bleed background image',
                  value: 'banner',
                },
                {
                  label: 'Split — title left, key facts panel right',
                  value: 'split',
                },
              ],
              required: true,
            } satisfies SelectField,
            createBlockAppearanceFields(),
            {
              name: 'contentAlignment',
              label: 'Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'overlayStyle',
              label: 'Image Overlay (Banner)',
              type: 'select',
              defaultValue: 'dark',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'Darker', value: 'darker' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'height',
              label: 'Height',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Immersive', value: 'immersive' },
              ],
              required: true,
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
