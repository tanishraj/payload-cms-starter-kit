import type { GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    hidden: hideFromUsersWithoutCapability('manage_site_settings'),
  },
  access: {
    read: allowPublicReadOrCapability('manage_site_settings'),
    readVersions: requireCapability('manage_site_settings'),
    update: requireCapability('manage_site_settings'),
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
            },
            {
              name: 'siteDescription',
              type: 'textarea',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'favicon',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'contactEmail',
                  type: 'email',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'contactPhone',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'address',
              type: 'textarea',
            },
            {
              name: 'googleMapEmbedUrl',
              label: 'Google Map Embed URL',
              type: 'text',
            },
          ],
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'socialLinks',
              type: 'group',
              fields: [
                {
                  name: 'facebook',
                  label: 'Facebook URL',
                  type: 'text',
                },
                {
                  name: 'instagram',
                  label: 'Instagram URL',
                  type: 'text',
                },
                {
                  name: 'linkedin',
                  label: 'LinkedIn URL',
                  type: 'text',
                },
                {
                  name: 'youtube',
                  label: 'YouTube URL',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
