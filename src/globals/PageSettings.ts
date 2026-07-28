import type { GlobalConfig, RelationshipFieldSingleValidation } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createGlobalAuditHook } from '@/hooks/logOperationalAuditEvent'
import { describeAuditValue } from '@/lib/operationalAudit'
import { revalidateGlobalsCacheForGlobal } from '@/hooks/revalidateCmsContent'

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
    return 'Default Home must reference a published page.'
  }

  return true
}

const validateAnnouncementInterval = (
  value: unknown,
  {
    siblingData,
  }: {
    siblingData?: {
      announcementDisplayMode?: 'horizontal' | 'marquee' | 'vertical' | null
      announcementEnabled?: boolean | null
    }
  },
) => {
  if (!siblingData?.announcementEnabled || siblingData?.announcementDisplayMode === 'marquee') {
    return true
  }

  return typeof value === 'number' && Number.isFinite(value) && value >= 2000
    ? true
    : 'Announcement interval must be at least 2000 milliseconds.'
}

const validateAnnouncementMarqueeDuration = (
  value: unknown,
  {
    siblingData,
  }: {
    siblingData?: {
      announcementDisplayMode?: 'horizontal' | 'marquee' | 'vertical' | null
      announcementEnabled?: boolean | null
    }
  },
) => {
  if (!siblingData?.announcementEnabled || siblingData?.announcementDisplayMode !== 'marquee') {
    return true
  }

  return typeof value === 'number' && Number.isFinite(value) && value >= 8000
    ? true
    : 'Marquee duration must be at least 8000 milliseconds.'
}

const validateAnnouncementItems = (
  value: unknown,
  { siblingData }: { siblingData?: { announcementEnabled?: boolean | null } },
) => {
  if (!siblingData?.announcementEnabled) {
    return true
  }

  if (!Array.isArray(value) || value.length === 0) {
    return 'Add at least one announcement item.'
  }

  const hasValidItem = value.some((item) => {
    if (typeof item !== 'object' || item === null) {
      return false
    }

    const description = 'description' in item ? item.description : null

    return typeof description === 'string' && description.trim()
  })

  return hasValidItem ? true : 'Add at least one announcement item with a description.'
}

export const PageSettings: GlobalConfig = {
  slug: 'page-settings',
  label: 'Website Defaults',
  admin: {
    group: 'Site Settings',
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
      revalidateGlobalsCacheForGlobal,
      createGlobalAuditHook({
        entityType: 'page_settings',
        getSummary: ({ doc, previousDoc }) =>
          `Homepage reference changed from ${describeAuditValue(previousDoc?.homepage)} to ${describeAuditValue(doc.homepage)}.`,
        title: 'Website Defaults',
      }),
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Default Home',
          fields: [
            {
              name: 'homepage',
              label: 'Default Home',
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
          label: 'Page Appearance',
          fields: [
            {
              ...createBlockAppearanceFields({ includeBorder: false }),
              name: 'pageAppearance',
              label: 'Appearance',
              admin: {
                description: 'Default HTML/body appearance for all frontend pages.',
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
          label: 'Announcement',
          fields: [
            {
              type: 'tabs',
              tabs: [
                {
                  label: 'Content',
                  fields: [
                    {
                      name: 'announcementEnabled',
                      label: 'Enable Announcement',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'announcementLabel',
                      label: 'Announcement Label',
                      type: 'text',
                      admin: {
                        condition: (data) => Boolean(data?.announcementEnabled),
                      },
                    },
                    {
                      name: 'announcementItems',
                      label: 'Announcement Items',
                      type: 'array',
                      minRows: 1,
                      admin: {
                        condition: (data) => Boolean(data?.announcementEnabled),
                        description:
                          'Displayed as a thin rotating site-wide banner above all frontend pages.',
                      },
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                        },
                        {
                          name: 'description',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'url',
                          label: 'Link URL',
                          type: 'text',
                        },
                      ],
                      validate: (value, options) => {
                        const baseValidation = validateAnnouncementItems(value, options)

                        if (baseValidation !== true) {
                          return baseValidation
                        }

                        if (!Array.isArray(value)) {
                          return true
                        }

                        const invalidRow = value.find((item) => {
                          if (typeof item !== 'object' || item === null) {
                            return true
                          }

                          const description = 'description' in item ? item.description : null

                          return typeof description !== 'string' || !description.trim()
                        })

                        return invalidRow ? 'Each announcement item requires a description.' : true
                      },
                    },
                  ],
                },
                {
                  label: 'Layout & Theme',
                  fields: [
                    {
                      ...createBlockAppearanceFields({ includeTextOverride: false }),
                      name: 'announcementAppearance',
                      label: 'Appearance',
                      admin: {
                        condition: (data) => Boolean(data?.announcementEnabled),
                      },
                    },
                    {
                      name: 'announcementDismissible',
                      label: 'Dismissible',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        condition: (data) => Boolean(data?.announcementEnabled),
                        description:
                          'Show a close button so visitors can hide the announcement for the rest of their browser session.',
                      },
                    },
                    {
                      name: 'announcementHideOnScroll',
                      label: 'Hide on Scroll',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        condition: (data) => Boolean(data?.announcementEnabled),
                        description:
                          'Allow the announcement bar to scroll out of view instead of remaining pinned above the header.',
                      },
                    },
                    {
                      name: 'announcementDisplayMode',
                      label: 'Animation Mode',
                      type: 'select',
                      defaultValue: 'vertical',
                      options: [
                        {
                          label: 'Vertical Slider',
                          value: 'vertical',
                        },
                        {
                          label: 'Horizontal Slider',
                          value: 'horizontal',
                        },
                        {
                          label: 'Marquee',
                          value: 'marquee',
                        },
                      ],
                      admin: {
                        condition: (data) => Boolean(data?.announcementEnabled),
                      },
                      required: true,
                    },
                    {
                      name: 'announcementIntervalMs',
                      label: 'Announcement Interval (ms)',
                      type: 'number',
                      defaultValue: 4000,
                      admin: {
                        condition: (data) =>
                          Boolean(data?.announcementEnabled) && data?.announcementDisplayMode !== 'marquee',
                        description:
                          'Auto-advance interval for rotating announcement items. Minimum 2000ms.',
                      },
                      validate: validateAnnouncementInterval,
                    },
                    {
                      name: 'announcementMarqueeDurationMs',
                      label: 'Marquee Duration (ms)',
                      type: 'number',
                      defaultValue: 18000,
                      admin: {
                        condition: (data) =>
                          Boolean(data?.announcementEnabled) && data?.announcementDisplayMode === 'marquee',
                        description: 'Lower values scroll faster.',
                      },
                      validate: validateAnnouncementMarqueeDuration,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
