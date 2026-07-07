import type { GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  label: 'Theme Settings',
  admin: {
    group: 'Settings',
    description: 'Control the frontend theme preset and light or dark mode behavior.',
    hidden: hideFromUsersWithoutCapability('manage_theme_settings'),
  },
  access: {
    read: allowPublicReadOrCapability('manage_theme_settings'),
    readVersions: requireCapability('manage_theme_settings'),
    update: requireCapability('manage_theme_settings'),
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'themeColor',
      type: 'select',
      defaultValue: 'default',
      required: true,
      admin: {
        description: 'Select which frontend theme preset is loaded for the site.',
      },
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Blue',
          value: 'blue',
        },
        {
          label: 'Sera',
          value: 'sera',
        },
      ],
    },
    {
      name: 'colorScheme',
      type: 'radio',
      defaultValue: 'system',
      required: true,
      admin: {
        description:
          'Choose whether the site follows the system preference or forces light/dark mode.',
      },
      options: [
        {
          label: 'System',
          value: 'system',
        },
        {
          label: 'Light',
          value: 'light',
        },
        {
          label: 'Dark',
          value: 'dark',
        },
      ],
    },
  ],
}
