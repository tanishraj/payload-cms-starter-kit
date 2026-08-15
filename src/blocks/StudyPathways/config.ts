import type { ArrayField, Block, CheckboxField, RadioField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createCardTabs } from '@/blocks/shared/cardThemeFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import {
  createMediaOverlayCoverageField,
  createMediaOverlayDirectionField,
  createMediaOverlayStrengthField,
  createMediaOverlayToneField,
} from '@/blocks/shared/mediaOverlayFields'

type LinkSiblingData = {
  linkType?: 'custom' | 'none' | 'page' | null
}

const isPageLink = (_data: unknown, siblingData: LinkSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: LinkSiblingData) =>
  siblingData?.linkType === 'custom'

const hasLink = (_data: unknown, siblingData: LinkSiblingData) =>
  siblingData?.linkType === 'page' || siblingData?.linkType === 'custom'

const pathwaysField = {
  name: 'pathways',
  label: 'Pathways',
  type: 'array',
  required: true,
  minRows: 2,
  maxRows: 4,
  admin: {
    description: 'Add 2 to 4 pathway cards.',
    initCollapsed: true,
  },
  fields: [
    createCardTabs({
      includeBackground: false,
      contentFields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Optional supporting text shown below the card title.',
          },
        },
        {
          name: 'linkType',
          label: 'Card Link',
          type: 'radio',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
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
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
          admin: { condition: hasLink },
        } satisfies CheckboxField,
      ],
      themeFields: [
        {
          name: 'imagePosition',
          label: 'Image Position',
          type: 'select',
          required: true,
          defaultValue: 'center',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
        } satisfies SelectField,
        createMediaOverlayToneField(),
        createMediaOverlayStrengthField({ name: 'overlayStrength' }),
        createMediaOverlayDirectionField({ defaultValue: 'bottomToTop' }),
        createMediaOverlayCoverageField(),
      ],
    }),
  ],
} satisfies ArrayField

export const StudyPathwaysBlock: Block = {
  admin: getBlockThumbnailAdmin('studyPathways'),
  slug: 'studyPathways',
  interfaceName: 'StudyPathwaysBlock',
  labels: {
    singular: 'Study Pathways',
    plural: 'Study Pathways',
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
              admin: { description: 'Small label above the section title.' },
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'accentTitle',
              label: 'Accent Title',
              type: 'text',
              admin: { description: 'Optional italic second line of the heading.' },
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            pathwaysField,
            createContentActionsField({
              name: 'footerActions',
              label: 'Footer Actions',
              maxRows: 2,
            }),
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
              defaultValue: 'left',
              required: true,
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
            } satisfies SelectField,
            {
              name: 'cardSplit',
              label: 'Card Split',
              type: 'select',
              defaultValue: '60-40',
              required: true,
              options: [
                { label: '60 / 40', value: '60-40' },
                { label: 'Equal', value: 'equal' },
                { label: '40 / 60', value: '40-60' },
                { label: '30 / 30 / 60', value: '30-30-60' },
                { label: '60 / 30 / 30', value: '60-30-30' },
              ],
            } satisfies SelectField,
            {
              name: 'headerLayout',
              label: 'Header Layout',
              type: 'select',
              defaultValue: 'split',
              required: true,
              options: [
                { label: 'Split', value: 'split' },
                { label: 'Stacked', value: 'stacked' },
              ],
            } satisfies SelectField,
            {
              name: 'cardHeight',
              label: 'Card Height',
              type: 'select',
              defaultValue: 'default',
              required: true,
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
            } satisfies SelectField,
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
