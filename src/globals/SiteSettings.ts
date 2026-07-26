import type { GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { validateHttpsUrl } from '@/lib/siteOfficesShared'

const validateExternalSocialUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return true
  }

  try {
    const url = new URL(value.trim())

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Enter a full external URL starting with http:// or https://.'
    }

    return true
  } catch {
    return 'Enter a valid external URL starting with http:// or https://.'
  }
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Site Settings',
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
            {
              name: 'officeLocations',
              label: 'Office Locations',
              type: 'array',
              admin: {
                description:
                  'Shared office directory used by Contact 24 blocks. Drag rows to control display order.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'region',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'address',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'phone',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                },
                {
                  name: 'mapEmbedUrl',
                  label: 'Interactive Map Embed URL',
                  type: 'text',
                  required: true,
                  validate: validateHttpsUrl,
                  admin: {
                    description: 'Paste the HTTPS URL from the map provider embed code.',
                  },
                },
                {
                  name: 'mapUrl',
                  label: 'External Map URL',
                  type: 'text',
                  required: true,
                  validate: validateHttpsUrl,
                  admin: {
                    description: 'Full HTTPS destination opened by View on Map.',
                  },
                },
                {
                  name: 'mapTitle',
                  label: 'Accessible Map Title',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'For example: Interactive map for the Dubai office.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Legal',
          fields: [
            {
              name: 'privacyPolicyPage',
              label: 'Privacy Policy Page',
              type: 'relationship',
              relationTo: 'pages',
            },
            {
              name: 'termsAndConditionsPage',
              label: 'Terms and Conditions Page',
              type: 'relationship',
              relationTo: 'pages',
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
                  label: 'Facebook External URL',
                  type: 'text',
                  admin: {
                    description: 'Must be a full external URL, for example https://facebook.com/your-page.',
                  },
                  validate: validateExternalSocialUrl,
                },
                {
                  name: 'instagram',
                  label: 'Instagram External URL',
                  type: 'text',
                  admin: {
                    description: 'Must be a full external URL, for example https://instagram.com/your-handle.',
                  },
                  validate: validateExternalSocialUrl,
                },
                {
                  name: 'linkedin',
                  label: 'LinkedIn External URL',
                  type: 'text',
                  admin: {
                    description: 'Must be a full external URL, for example https://linkedin.com/company/your-org.',
                  },
                  validate: validateExternalSocialUrl,
                },
                {
                  name: 'youtube',
                  label: 'YouTube External URL',
                  type: 'text',
                  admin: {
                    description: 'Must be a full external URL, for example https://youtube.com/@your-channel.',
                  },
                  validate: validateExternalSocialUrl,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
