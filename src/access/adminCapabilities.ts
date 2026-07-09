import type { Access } from 'payload'

import {
  editorialRoleOptions,
  getDefaultCapabilitiesForRole,
  normalizeEditorialRole,
  type EditorialRole,
} from '@/access/editorialRoles'

export { getDefaultCapabilitiesForRole } from '@/access/editorialRoles'

export const adminRoleOptions = editorialRoleOptions

export type AdminRole = EditorialRole

export const adminCapabilityFieldOptions = [
  {
    label: 'Pages',
    value: 'manage_pages',
  },
  {
    label: 'Articles',
    value: 'manage_articles',
  },
  {
    label: 'Reviews',
    value: 'manage_reviews',
  },
  {
    label: 'Media',
    value: 'manage_media',
  },
  {
    label: 'Taxonomy',
    value: 'manage_taxonomy',
  },
  {
    label: 'Navigation',
    value: 'manage_navigation',
  },
  {
    label: 'Redirects',
    value: 'manage_redirects',
  },
  {
    label: 'Headers',
    value: 'manage_headers',
  },
  {
    label: 'Footers',
    value: 'manage_footers',
  },
  {
    label: 'Site Defaults',
    value: 'manage_page_settings',
  },
  {
    label: 'Site Settings',
    value: 'manage_site_settings',
  },
  {
    label: 'Theme Settings',
    value: 'manage_theme_settings',
  },
  {
    label: 'SEO Settings',
    value: 'manage_seo_settings',
  },
  {
    label: 'System Pages',
    value: 'manage_system_pages',
  },
  {
    label: 'System Modes',
    value: 'manage_system_modes',
  },
  {
    label: 'Forms',
    value: 'manage_forms',
  },
  {
    label: 'Form Submissions',
    value: 'manage_form_submissions',
  },
  {
    label: 'Work Queue',
    value: 'manage_work_queue',
  },
  {
    label: 'Operational Audit',
    value: 'view_operational_audit',
  },
  {
    label: 'Publish Pages',
    value: 'publish_pages',
  },
  {
    label: 'Publish Articles',
    value: 'publish_articles',
  },
  {
    label: 'Publish Reviews',
    value: 'publish_reviews',
  },
  {
    label: 'Publish System Pages',
    value: 'publish_system_pages',
  },
] as const

export type AdminCapability = (typeof adminCapabilityFieldOptions)[number]['value']

export type AdminCapabilitiesMap = Partial<Record<AdminCapability, boolean | null>>

export type AdminUserLike = {
  capabilities?: AdminCapabilitiesMap | null | string[]
  role?: AdminRole | null | string
}

const validCapabilities = new Set<AdminCapability>(
  adminCapabilityFieldOptions.map(({ value }) => value),
)

export const allAdminCapabilities = adminCapabilityFieldOptions.map(
  ({ value }) => value,
) as AdminCapability[]

const getCapabilityDescription = ({
  label,
  value,
}: {
  label: string
  value: AdminCapability
}) => {
  if (value.startsWith('publish_')) {
    return `Allow publishing access for ${label.replace(/^Publish /, '')}.`
  }

  if (value.startsWith('manage_')) {
    return `Allow access to ${label.replace(/^Manage /, '')}.`
  }

  return `Allow access to ${label}.`
}

const createCapabilityCheckbox = ({
  label,
  value,
}: {
  label: string
  value: AdminCapability
}) => ({
  name: value,
  type: 'checkbox' as const,
  label,
  defaultValue: false,
  admin: {
    description: getCapabilityDescription({ label, value }),
    width: '33.33%',
  },
})

const createCapabilityRows = (items: Array<{ label: string; value: AdminCapability }>) =>
  items.reduce<Array<{ fields: ReturnType<typeof createCapabilityCheckbox>[]; type: 'row' }>>(
    (rows, item, index) => {
      const rowIndex = Math.floor(index / 3)

      if (!rows[rowIndex]) {
        rows[rowIndex] = {
          fields: [],
          type: 'row',
        }
      }

      rows[rowIndex].fields.push(createCapabilityCheckbox(item))
      return rows
    },
    [],
  )

const capabilitySections = [
  {
    label: 'Content',
    items: adminCapabilityFieldOptions.slice(0, 5),
  },
  {
    label: 'Structure',
    items: adminCapabilityFieldOptions.slice(5, 9),
  },
  {
    label: 'Site Controls',
    items: adminCapabilityFieldOptions.slice(9, 15),
  },
  {
    label: 'Operations',
    items: adminCapabilityFieldOptions.slice(15, 19),
  },
  {
    label: 'Publishing',
    items: adminCapabilityFieldOptions.slice(19),
  },
] as const

export const adminCapabilityCheckboxFields = capabilitySections.map((section) => ({
  type: 'collapsible' as const,
  label: section.label,
  admin: {
    initCollapsed: false,
  },
  fields: createCapabilityRows([...section.items]),
}))

export const isAdminRole = (value: unknown): value is AdminRole => {
  return normalizeEditorialRole(value, 'admin') === value
}

export const normalizeAdminRole = (
  value: unknown,
  fallback: AdminRole = 'contentManager',
): AdminRole => {
  return normalizeEditorialRole(value, fallback)
}

export const sanitizeAdminCapabilities = (value: unknown): AdminCapability[] => {
  if (!Array.isArray(value)) {
    if (!value || typeof value !== 'object') {
      return []
    }

    return allAdminCapabilities.filter(
      (capability) =>
        capability in (value as Record<string, unknown>) &&
        Boolean((value as Record<string, unknown>)[capability]),
    )
  }

  return value.filter(
    (capability): capability is AdminCapability =>
      typeof capability === 'string' && validCapabilities.has(capability as AdminCapability),
  )
}

export const toAdminCapabilitiesMap = (value: unknown): AdminCapabilitiesMap => {
  const enabledCapabilities = new Set(sanitizeAdminCapabilities(value))

  return allAdminCapabilities.reduce<AdminCapabilitiesMap>((acc, capability) => {
    acc[capability] = enabledCapabilities.has(capability)
    return acc
  }, {})
}

export const isAdminUser = (user: AdminUserLike | null | undefined): boolean => {
  return normalizeAdminRole(user?.role, 'contentManager') === 'admin'
}

export const hasAdminCapability = (
  user: AdminUserLike | null | undefined,
  capability: AdminCapability,
): boolean => {
  if (isAdminUser(user)) {
    return true
  }

  return sanitizeAdminCapabilities(user?.capabilities).includes(capability)
}

export const adminOnlyAccess: Access = ({ req }) => {
  return isAdminUser(req.user as AdminUserLike | null | undefined)
}

export const adminOrFirstUserAccess: Access = async ({ req }) => {
  if (isAdminUser(req.user as AdminUserLike | null | undefined)) {
    return true
  }

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    where: {},
  })

  return totalDocs === 0
}

const toCapabilitiesArray = (
  capability: AdminCapability | AdminCapability[],
): AdminCapability[] => {
  return Array.isArray(capability) ? capability : [capability]
}

export const requireCapability =
  (capability: AdminCapability | AdminCapability[]): Access =>
  ({ req }) => {
    const user = req.user as AdminUserLike | null | undefined

    return toCapabilitiesArray(capability).some((currentCapability) =>
      hasAdminCapability(user, currentCapability),
    )
  }

export const allowPublicReadOrCapability =
  (capability: AdminCapability | AdminCapability[]): Access =>
  ({ req }) => {
    const user = req.user as AdminUserLike | null | undefined

    if (!user) {
      return true
    }

    return toCapabilitiesArray(capability).some((currentCapability) =>
      hasAdminCapability(user, currentCapability),
    )
  }

export const hideFromNonAdmin = ({ user }: { user: unknown }) => {
  return !isAdminUser(user as AdminUserLike | null | undefined)
}

export const hideFromUsersWithoutCapability =
  (capability: AdminCapability | AdminCapability[]) =>
  ({ user }: { user: unknown }) => {
    const typedUser = user as AdminUserLike | null | undefined

    return !toCapabilitiesArray(capability).some((currentCapability) =>
      hasAdminCapability(typedUser, currentCapability),
    )
  }

export const canPublishPages = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'publish_pages')
}

export const canPublishArticles = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'publish_articles')
}

export const canPublishReviews = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'publish_reviews')
}

export const canPublishSystemPages = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'publish_system_pages')
}

export const canManageSystemModes = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'manage_system_modes')
}

export const canViewOperationalAudit = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'view_operational_audit')
}

export const canManageTaxonomy = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'manage_taxonomy')
}

export const canReadTaxonomy = (user: AdminUserLike | null | undefined): boolean => {
  return ([
    'manage_taxonomy',
    'manage_articles',
    'publish_articles',
    'manage_reviews',
    'publish_reviews',
  ] as AdminCapability[]).some((capability) => hasAdminCapability(user, capability))
}

const allCapabilitiesEnabled = (): AdminCapabilitiesMap => {
  return toAdminCapabilitiesMap(allAdminCapabilities)
}

export const getCapabilitiesForRole = (role: AdminRole): AdminCapabilitiesMap => {
  if (role === 'admin') {
    return allCapabilitiesEnabled()
  }

  return toAdminCapabilitiesMap(getDefaultCapabilitiesForRole(role))
}
