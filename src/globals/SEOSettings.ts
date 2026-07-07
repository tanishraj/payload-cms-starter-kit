import type { GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { robotsFieldOptions } from '@/lib/seo'

export const SEOSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: 'SEO Settings',
  admin: {
    group: 'Settings',
    description: 'Default SEO values used when a page does not provide its own overrides.',
    hidden: hideFromUsersWithoutCapability('manage_seo_settings'),
  },
  access: {
    read: allowPublicReadOrCapability('manage_seo_settings'),
    readVersions: requireCapability('manage_seo_settings'),
    update: requireCapability('manage_seo_settings'),
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'defaultTitle',
      type: 'text',
    },
    {
      name: 'titleTemplate',
      type: 'text',
      admin: {
        description: 'Example: %s | Your Site Name',
      },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
    },
    {
      name: 'defaultImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'robots',
      type: 'select',
      defaultValue: 'index,follow',
      options: [...robotsFieldOptions],
    },
    {
      name: 'googleSiteVerification',
      type: 'text',
    },
  ],
}
