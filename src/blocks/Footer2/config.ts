import type { Block } from 'payload'

export const Footer2Block: Block = {
  slug: 'footer2',
  interfaceName: 'Footer2Block',
  labels: {
    singular: 'Footer 2',
    plural: 'Footer 2 Blocks',
  },
  fields: [
    {
      name: 'logoMode',
      type: 'radio',
      required: true,
      defaultValue: 'siteSettingsLogo',
      options: [
        {
          label: 'Use Site Settings Logo',
          value: 'siteSettingsLogo',
        },
        {
          label: 'Use Custom Logo',
          value: 'customLogo',
        },
      ],
      admin: {
        layout: 'horizontal',
      },
    },
    {
      name: 'customLogo',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
      admin: {
        condition: (_: unknown, siblingData: { logoMode?: 'siteSettingsLogo' | 'customLogo' | null }) =>
          siblingData?.logoMode === 'customLogo',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'sections',
      type: 'array',
      labels: {
        singular: 'Section',
        plural: 'Sections',
      },
      admin: {
        initCollapsed: true,
        description: 'Configure the footer sections for this footer layout.',
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
          labels: {
            singular: 'Link',
            plural: 'Links',
          },
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              admin: {
                description: 'Optional label override. Leave blank to use the reusable link title.',
              },
            },
            {
              name: 'link',
              type: 'relationship',
              relationTo: 'navigation-links',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
    },
    {
      name: 'legalLinks',
      type: 'array',
      labels: {
        singular: 'Legal Link',
        plural: 'Legal Links',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Optional label override. Leave blank to use the reusable link title.',
          },
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'navigation-links',
          required: true,
        },
      ],
    },
  ],
}
