import type {
  ArrayField,
  Block,
  CheckboxField,
  Field,
  RadioField,
  SelectField,
} from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { splitFeatureThumbnail } from './thumbnail'

type LinkType = 'page' | 'custom'
type CtaMode = 'link' | 'buttons'
type LayoutMode = 'split' | 'contentOnly'
type SplitFeatureSiblingData = {
  ctaMode?: CtaMode | null
  layoutMode?: LayoutMode | null
  linkType?: LinkType | null
}

const isPageLink = (_data: unknown, siblingData: SplitFeatureSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: SplitFeatureSiblingData) =>
  siblingData?.linkType === 'custom'

const isLinkMode = (_data: unknown, siblingData: SplitFeatureSiblingData) =>
  siblingData?.ctaMode === 'link'

const isButtonsMode = (_data: unknown, siblingData: SplitFeatureSiblingData) =>
  siblingData?.ctaMode === 'buttons'

const isSplitMode = (_data: unknown, siblingData: SplitFeatureSiblingData) =>
  siblingData?.layoutMode === 'split'

const createLinkFields = (): Field[] => [
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
]

export const SplitFeatureBlock: Block = {
  slug: 'splitFeature',
  interfaceName: 'SplitFeatureBlock',
  admin: {
    images: {
      thumbnail: {
        alt: 'Split feature block preview',
        url: splitFeatureThumbnail,
      },
    },
  },
  labels: {
    singular: 'Split Feature',
    plural: 'Split Features',
  },
  fields: [
    createBlockAppearanceFields(),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      validate: (value: unknown, { siblingData }: { siblingData?: SplitFeatureSiblingData }) => {
        if (siblingData?.layoutMode === 'split' && !value) {
          return 'Image is required when layout mode is 50 / 50 split.'
        }

        return true
      },
    },
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
    {
      name: 'layoutMode',
      label: 'Layout Mode',
      type: 'select',
      defaultValue: 'split',
      options: [
        { label: '50 / 50 Split', value: 'split' },
        { label: 'Centered Content', value: 'contentOnly' },
      ],
      required: true,
    } satisfies SelectField,
    {
      name: 'mediaPosition',
      label: 'Media Position',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image Left', value: 'left' },
        { label: 'Image Right', value: 'right' },
      ],
      admin: {
        condition: isSplitMode,
      },
      validate: (value: unknown, { siblingData }: { siblingData?: SplitFeatureSiblingData }) => {
        if (siblingData?.layoutMode === 'split' && !value) {
          return 'Media position is required when layout mode is 50 / 50 split.'
        }

        return true
      },
    } satisfies SelectField,
    {
      name: 'ctaMode',
      type: 'select',
      defaultValue: 'link',
      options: [
        { label: 'Text Link', value: 'link' },
        { label: 'Buttons', value: 'buttons' },
      ],
      required: true,
    } satisfies SelectField,
    {
      name: 'linkLabel',
      type: 'text',
      admin: {
        condition: isLinkMode,
      },
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
        condition: isLinkMode,
        layout: 'horizontal',
      },
    } satisfies RadioField,
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: (data, siblingData) => isLinkMode(data, siblingData) && isPageLink(data, siblingData),
      },
    },
    {
      name: 'url',
      label: 'Custom URL',
      type: 'text',
      admin: {
        condition: (data, siblingData) => isLinkMode(data, siblingData) && isCustomLink(data, siblingData),
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        condition: isLinkMode,
      },
    } satisfies CheckboxField,
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      admin: {
        condition: isButtonsMode,
        initCollapsed: true,
      },
      fields: [
        ...createLinkFields(),
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Link', value: 'link' },
          ],
          required: true,
        } satisfies SelectField,
      ],
    } satisfies ArrayField,
  ],
}
