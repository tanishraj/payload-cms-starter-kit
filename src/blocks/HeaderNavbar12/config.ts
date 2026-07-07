import type { Block } from 'payload'

export const HeaderNavbar12Block: Block = {
  slug: 'headerNavbar12',
  interfaceName: 'HeaderNavbar12Block',
  labels: {
    singular: 'Header Navbar 12',
    plural: 'Header Navbar 12 Blocks',
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
      name: 'navigationItems',
      type: 'array',
      labels: {
        singular: 'Navigation Item',
        plural: 'Navigation Items',
      },
      admin: {
        initCollapsed: true,
        description: 'Configure the main navigation structure for this header.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Optional top-level label override. Leave blank to use the reusable link title.',
          },
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'navigation-links',
          admin: {
            description: 'Optional top-level destination. If children are added, this becomes the overview link.',
          },
        },
        {
          name: 'children',
          type: 'array',
          labels: {
            singular: 'Dropdown Item',
            plural: 'Dropdown Items',
          },
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: {
                description: 'Optional label override. Leave blank to use the reusable link title.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Optional description for dropdown items.',
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
      name: 'secondaryActions',
      type: 'array',
      minRows: 0,
      maxRows: 2,
      labels: {
        singular: 'Secondary Action',
        plural: 'Secondary Actions',
      },
      admin: {
        initCollapsed: true,
        description: 'Optional reusable links shown to the right of the navigation.',
      },
      fields: [
        {
          name: 'label',
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
    {
      name: 'cta',
      label: 'Primary CTA',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Optional button label override. Leave blank to use the reusable link title.',
          },
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'navigation-links',
        },
      ],
    },
  ],
}
