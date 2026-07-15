import type {
  ArrayField,
  Block,
  CheckboxField,
  Field,
  RadioField,
  SelectField,
} from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { heroInstitutionalThumbnail } from './thumbnail'

type LinkType = 'page' | 'custom'

const pageCondition = (_data: unknown, siblingData: { linkType?: LinkType | null }) =>
  siblingData?.linkType === 'page'

const customUrlCondition = (_data: unknown, siblingData: { linkType?: LinkType | null }) =>
  siblingData?.linkType === 'custom'

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
      condition: pageCondition,
    },
  },
  {
    name: 'url',
    label: 'Custom URL',
    type: 'text',
    admin: {
      condition: customUrlCondition,
    },
  },
  {
    name: 'openInNewTab',
    type: 'checkbox',
    defaultValue: false,
  } satisfies CheckboxField,
]

const horizontalAlignmentField = {
  name: 'horizontalAlignment',
  label: 'Horizontal Alignment',
  type: 'select',
  defaultValue: 'left',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  required: true,
} satisfies SelectField

const verticalAlignmentField = {
  name: 'verticalAlignment',
  label: 'Vertical Alignment',
  type: 'select',
  defaultValue: 'center',
  options: [
    { label: 'Top', value: 'top' },
    { label: 'Center', value: 'center' },
    { label: 'Bottom', value: 'bottom' },
  ],
  required: true,
} satisfies SelectField

const overlayStyleField = {
  name: 'overlayStyle',
  label: 'Overlay Style',
  type: 'select',
  defaultValue: 'dark',
  options: [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Darker', value: 'darker' },
  ],
  required: true,
} satisfies SelectField

const contentWidthField = {
  name: 'contentWidth',
  label: 'Content Width',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Narrow', value: 'narrow' },
    { label: 'Default', value: 'default' },
    { label: 'Wide', value: 'wide' },
  ],
  required: true,
} satisfies SelectField

const heightField = {
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
} satisfies SelectField

const buttonsField = {
  name: 'buttons',
  label: 'Buttons',
  type: 'array',
  maxRows: 2,
  admin: {
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
} satisfies ArrayField

export const HeroInstitutionalBlock: Block = {
  slug: 'heroInstitutional',
  interfaceName: 'HeroInstitutionalBlock',
  admin: {
    images: {
      thumbnail: {
        alt: 'Hero institutional block preview',
        url: heroInstitutionalThumbnail,
      },
    },
  },
  labels: {
    singular: 'Hero Institutional',
    plural: 'Hero Institutionals',
  },
  fields: [
    createBlockAppearanceFields({ includeTextOverride: false }),
    {
      name: 'backgroundImage',
      label: 'Background Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
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
    horizontalAlignmentField,
    verticalAlignmentField,
    overlayStyleField,
    contentWidthField,
    heightField,
    buttonsField,
  ],
}
