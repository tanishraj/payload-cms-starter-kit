import type { GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { defaultWebsiteTheme, websiteThemeOptions } from '@/lib/themes/websiteThemes'
import { revalidateGlobalsCacheForGlobal } from '@/hooks/revalidateCmsContent'

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  label: 'Theme Settings',
  admin: {
    group: 'Site Settings',
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
  hooks: {
    afterChange: [revalidateGlobalsCacheForGlobal],
  },
  fields: [
    {
      name: 'themeColor',
      type: 'select',
      defaultValue: defaultWebsiteTheme,
      required: true,
      admin: {
        description: 'Select which frontend theme preset is loaded for the site.',
      },
      options: websiteThemeOptions,
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
