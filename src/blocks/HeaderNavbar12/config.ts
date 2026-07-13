import type { ArrayField, Block, CheckboxField, Field, NumberField, RadioField, SelectField } from 'payload'

import { headerNavbar12Thumbnail } from './thumbnail'

type LinkType = 'page' | 'custom'
type LogoMode = 'siteDefault' | 'customLogo'

const linkTypeCondition = (_data: unknown, siblingData: { linkType?: LinkType | null }) =>
  siblingData?.linkType === 'page'

const customUrlCondition = (_data: unknown, siblingData: { linkType?: LinkType | null }) =>
  siblingData?.linkType === 'custom'

const customLogoCondition = (_data: unknown, siblingData: { logoMode?: LogoMode | null }) =>
  siblingData?.logoMode === 'customLogo'

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
      condition: linkTypeCondition,
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

const childLinkFields = createLinkFields()

const sizeField = {
  name: 'size',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Compact', value: 'compact' },
    { label: 'Default', value: 'default' },
    { label: 'Large', value: 'large' },
  ],
} satisfies SelectField

const navAlignmentField = {
  name: 'navAlignment',
  label: 'Navigation Alignment',
  type: 'select',
  defaultValue: 'center',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
} satisfies SelectField

const logoHeightField = {
  name: 'logoHeight',
  label: 'Logo Height Override (px)',
  type: 'number',
  min: 20,
  admin: {
    components: {
      Field: '/blocks/HeaderNavbar12/LogoHeightField#LogoHeightField',
    },
    description: 'Changing header size resets this value to match the header height. You can still edit it manually afterward.',
  },
} satisfies NumberField

const menuItemsField = {
  name: 'menuItems',
  label: 'Menu Items',
  type: 'array',
  minRows: 1,
  fields: [
    ...createLinkFields(),
    {
      name: 'children',
      type: 'array',
      fields: childLinkFields,
    } satisfies ArrayField,
  ],
} satisfies ArrayField

const ctaButtonsField = {
  name: 'ctaButtons',
  label: 'CTA Buttons',
  type: 'array',
  maxRows: 2,
  fields: [
    ...createLinkFields(),
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Link', value: 'link' },
        { label: 'Outline', value: 'outline' },
        { label: 'Default', value: 'default' },
      ],
    } satisfies SelectField,
  ],
} satisfies ArrayField

export const HeaderNavbar12Block: Block = {
  slug: 'headerNavbar12',
  interfaceName: 'HeaderNavbar12Block',
  admin: {
    images: {
      thumbnail: {
        alt: 'Header navbar block preview',
        url: headerNavbar12Thumbnail,
      },
    },
  },
  labels: {
    singular: 'Header Navbar',
    plural: 'Header Navbars',
  },
  fields: [
    {
      name: 'sticky',
      type: 'checkbox',
      defaultValue: true,
    } satisfies CheckboxField,
    sizeField,
    navAlignmentField,
    {
      name: 'logoMode',
      label: 'Logo Source',
      type: 'select',
      defaultValue: 'siteDefault',
      options: [
        { label: 'Site Default Logo', value: 'siteDefault' },
        { label: 'Custom Logo Override', value: 'customLogo' },
      ],
    } satisfies SelectField,
    {
      name: 'customLogoLight',
      label: 'Custom Logo (Light)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: customLogoCondition,
      },
    },
    {
      name: 'customLogoDark',
      label: 'Custom Logo (Dark)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: customLogoCondition,
      },
    },
    logoHeightField,
    menuItemsField,
    ctaButtonsField,
  ],
}
