import type { ArrayField, GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'

export const SearchSettings: GlobalConfig = {
  slug: 'search-settings',
  label: 'Search Settings',
  admin: {
    group: 'Configuration',
    description: 'Suggested search terms displayed on the search page.',
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
      name: 'suggestedSearches',
      label: 'Suggested Searches',
      type: 'array',
      maxRows: 12,
      admin: {
        description:
          'Up to 12 terms shown as clickable chips on the search page. Operators can update these without touching code.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'term',
          label: 'Search Term',
          type: 'text',
          required: true,
        },
      ],
    } satisfies ArrayField,
  ],
}
