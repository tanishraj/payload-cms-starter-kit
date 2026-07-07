import type { GlobalConfig, RelationshipFieldSingleValidation } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createGlobalAuditHook } from '@/hooks/logOperationalAuditEvent'
import { describeAuditValue } from '@/lib/operationalAudit'

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
  hooks: {
    afterChange: [
      createGlobalAuditHook({
        entityType: 'page_settings',
        getSummary: ({ doc, previousDoc }) =>
          `Homepage reference changed from ${describeAuditValue(previousDoc?.homepage)} to ${describeAuditValue(doc.homepage)}.`,
        title: 'Site Defaults',
      }),
    ],
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
      ],
    },
  ],
}
