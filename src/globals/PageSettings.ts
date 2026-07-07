import type { GlobalConfig, RelationshipFieldSingleValidation } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import type { SystemPageType } from '@/lib/systemPageTypes'

const extractPageID = (
  value: number | { id: number | string } | null | undefined,
): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    return value.id
  }

  return null
}

const validatePublishedFrontPage: RelationshipFieldSingleValidation = async (value, { req }) => {
  const pageID = extractPageID(value as number | { id: number | string } | null | undefined)

  if (pageID == null) {
    return true
  }

  const result = await req.payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          id: {
            equals: pageID,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
    req,
  })

  if (result.docs.length === 0) {
    return 'Front Page must reference a published page.'
  }

  return true
}

const validatePublishedSystemPageType =
  (expectedType: SystemPageType, fieldLabel: string): RelationshipFieldSingleValidation =>
  async (value, { req }) => {
    const pageID = extractPageID(value as number | { id: number | string } | null | undefined)

    if (pageID == null) {
      return true
    }

    const result = await req.payload.find({
      collection: 'system-pages',
      where: {
        and: [
          {
            id: {
              equals: pageID,
            },
          },
          {
            _status: {
              equals: 'published',
            },
          },
          {
            type: {
              equals: expectedType,
            },
          },
        ],
      },
      depth: 0,
      limit: 1,
      req,
    })

    if (result.docs.length === 0) {
      return `${fieldLabel} must reference a published ${expectedType} system page.`
    }

    return true
  }

const pageOfTypeFilter = (type: SystemPageType) => ({
  type: {
    equals: type,
  },
})

export const PageSettings: GlobalConfig = {
  slug: 'page-settings',
  label: 'Site Defaults',
  admin: {
    group: 'System Defaults',
    hidden: hideFromUsersWithoutCapability(['manage_page_settings', 'manage_site_settings']),
  },
  access: {
    read: allowPublicReadOrCapability(['manage_page_settings', 'manage_site_settings']),
    readVersions: requireCapability(['manage_page_settings', 'manage_site_settings']),
    update: requireCapability(['manage_page_settings', 'manage_site_settings']),
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Front Page',
          fields: [
            {
              name: 'homepage',
              label: 'Front Page',
              type: 'relationship',
              relationTo: 'pages',
              filterOptions: {
                _status: {
                  equals: 'published',
                },
              },
              validate: validatePublishedFrontPage,
              admin: {
                description: 'Choose which published page should render at the root URL (/).',
              },
            },
          ],
        },
        {
          label: 'Header',
          fields: [
            {
              name: 'activeHeader',
              type: 'relationship',
              relationTo: 'headers',
              admin: {
                description: 'Choose which saved header preset should render site-wide.',
              },
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'activeFooter',
              type: 'relationship',
              relationTo: 'footers',
              admin: {
                description: 'Choose which saved footer preset should render site-wide.',
              },
            },
          ],
        },
        {
          label: 'System',
          fields: [
            {
              name: 'notFoundPage',
              label: '404 Page',
              type: 'relationship',
              relationTo: 'system-pages',
              filterOptions: pageOfTypeFilter('404'),
              validate: validatePublishedSystemPageType('404', '404 Page'),
              admin: {
                description:
                  'Select a 404 system preset. Draft presets appear here, but the selected preset must be published before it can be used live.',
              },
            },
            {
              name: 'maintenancePage',
              label: 'Maintenance Page',
              type: 'relationship',
              relationTo: 'system-pages',
              filterOptions: pageOfTypeFilter('maintenance'),
              validate: validatePublishedSystemPageType('maintenance', 'Maintenance Page'),
              admin: {
                description:
                  'Select a maintenance system preset. Draft presets appear here, but the selected preset must be published before it can be used live.',
              },
            },
            {
              name: 'comingSoonPage',
              label: 'Coming Soon Page',
              type: 'relationship',
              relationTo: 'system-pages',
              filterOptions: pageOfTypeFilter('comingSoon'),
              validate: validatePublishedSystemPageType('comingSoon', 'Coming Soon Page'),
              admin: {
                description:
                  'Select a coming soon system preset. Draft presets appear here, but the selected preset must be published before it can be used live.',
              },
            },
            {
              name: 'bypassForLoggedInAdmins',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Allow logged-in admins to continue seeing the normal site when a mode is active.',
              },
            },
            {
              name: 'siteMode',
              label: 'Site Mode',
              type: 'radio',
              defaultValue: 'off',
              options: [
                {
                  label: 'Off',
                  value: 'off',
                },
                {
                  label: 'Maintenance',
                  value: 'maintenance',
                },
                {
                  label: 'Coming Soon',
                  value: 'comingSoon',
                },
              ],
              admin: {
                description:
                  'Choose which system page should override the public site. This affects all public routes, not only the homepage.',
                layout: 'horizontal',
              },
            },
          ],
        },
      ],
    },
  ],
}
