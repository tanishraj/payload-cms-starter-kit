import type { ArrayField, Block, CheckboxField, Field, RadioField, SelectField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

import { footer56Thumbnail } from './thumbnail'

type LinkType = 'page' | 'custom'
type LogoMode = 'siteDefault' | 'customLogo'

const isPageLink = (_data: unknown, siblingData: { linkType?: LinkType | null }) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: { linkType?: LinkType | null }) =>
  siblingData?.linkType === 'custom'

const isCustomLogo = (_data: unknown, siblingData: { logoMode?: LogoMode | null }) =>
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

export const Footer56Block: Block = {
  slug: 'footer56',
  interfaceName: 'Footer56Block',
  admin: {
    images: {
      thumbnail: {
        alt: 'Footer 56 preview',
        url: footer56Thumbnail,
      },
    },
  },
  labels: {
    singular: 'Footer 56',
    plural: 'Footer 56',
  },
  fields: [
    {
      name: 'logoMode',
      label: 'Logo Source',
      type: 'select',
      defaultValue: 'siteDefault',
      options: [
        { label: 'Site Default Logo', value: 'siteDefault' },
        { label: 'Custom Logo Override', value: 'customLogo' },
      ],
      required: true,
    } satisfies SelectField,
    {
      name: 'customLogoLight',
      label: 'Custom Logo (Light)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: isCustomLogo,
      },
    },
    {
      name: 'customLogoDark',
      label: 'Custom Logo (Dark)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: isCustomLogo,
      },
    },
    {
      name: 'logoHeight',
      label: 'Logo Height',
      type: 'number',
      min: 20,
      admin: {
        description: 'Overrides the rendered footer logo height in pixels.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    createBlockAppearanceFields({ includeTextOverride: false }),
    {
      name: 'linkGroups',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          minRows: 1,
          admin: {
            initCollapsed: true,
          },
          fields: createLinkFields(),
        } satisfies ArrayField,
      ],
    } satisfies ArrayField,
    {
      name: 'ctaButtons',
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
          defaultValue: 'outline',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Outline', value: 'outline' },
            { label: 'Default', value: 'default' },
          ],
        } satisfies SelectField,
      ],
    } satisfies ArrayField,
    {
      name: 'bottomLinks',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: createLinkFields(),
    } satisfies ArrayField,
    {
      name: 'copyrightText',
      type: 'text',
    },
  ],
}
