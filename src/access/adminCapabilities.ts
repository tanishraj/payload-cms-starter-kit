import type { Access, Where } from 'payload'

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
    label: 'News & Events',
    value: 'manage_news_events',
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
    label: 'Navigation Links',
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
    label: 'System Pages',
    value: 'manage_system_pages',
  },
  {
    label: 'Routing Defaults',
    value: 'manage_page_settings',
  },
  {
    label: 'Site Identity',
    value: 'manage_site_settings',
  },
  {
    label: 'Appearance',
    value: 'manage_theme_settings',
  },
  {
    label: 'SEO & Metadata',
    value: 'manage_seo_settings',
  },
  {
    label: 'Site Modes',
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
    label: 'Action Queue',
    value: 'manage_work_queue',
  },
  {
    label: 'Audit Log',
    value: 'view_operational_audit',
  },
  {
    label: 'Require Editorial Workflow',
    value: 'require_editorial_workflow',
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
    label: 'Publish News & Events',
    value: 'publish_news_events',
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

const getCapabilityDescription = ({ label, value }: { label: string; value: AdminCapability }) => {
  if (value === 'require_editorial_workflow') {
    return 'Require this user to submit content through editorial workflow before publication.'
  }

  if (value.startsWith('publish_')) {
    return `Allow publishing access for ${label.replace(/^Publish /, '')}.`
  }

  if (value.startsWith('manage_')) {
    return `Allow access to ${label.replace(/^Manage /, '')}.`
  }

  return `Allow access to ${label}.`
}

const createCapabilityCheckbox = ({ label, value }: { label: string; value: AdminCapability }) => ({
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

const capabilityItemsByValue = new Map<
  AdminCapability,
  (typeof adminCapabilityFieldOptions)[number]
>(adminCapabilityFieldOptions.map((item) => [item.value, item]))

const getCapabilityItem = (value: AdminCapability) => {
  const item = capabilityItemsByValue.get(value)

  if (!item) {
    throw new Error(`Unknown admin capability: ${value}`)
  }

  return item
}

const createCapabilitySectionItems = (values: readonly AdminCapability[]) =>
  values.map(getCapabilityItem)

const capabilitySections = [
  {
    label: 'Content',
    items: createCapabilitySectionItems([
      'manage_pages',
      'manage_articles',
      'manage_news_events',
      'manage_reviews',
      'manage_media',
      'manage_taxonomy',
    ] as const),
  },
  {
    label: 'Site Structure',
    items: createCapabilitySectionItems([
      'manage_navigation',
      'manage_redirects',
      'manage_headers',
      'manage_footers',
      'manage_system_pages',
    ] as const),
  },
  {
    label: 'Lead Management',
    items: createCapabilitySectionItems(['manage_forms', 'manage_form_submissions'] as const),
  },
  {
    label: 'Configuration',
    items: createCapabilitySectionItems([
      'manage_page_settings',
      'manage_site_settings',
      'manage_theme_settings',
      'manage_seo_settings',
      'manage_system_modes',
    ] as const),
  },
  {
    label: 'Administration',
    items: createCapabilitySectionItems([
      'manage_work_queue',
      'view_operational_audit',
      'require_editorial_workflow',
    ] as const),
  },
  {
    label: 'Publishing',
    items: createCapabilitySectionItems([
      'publish_pages',
      'publish_articles',
      'publish_news_events',
      'publish_reviews',
      'publish_system_pages',
    ] as const),
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

export const allowPublishedReadOrCapability =
  (capability: AdminCapability | AdminCapability[]): Access =>
  ({ req }) => {
    const user = req.user as AdminUserLike | null | undefined

    if (
      toCapabilitiesArray(capability).some((currentCapability) =>
        hasAdminCapability(user, currentCapability),
      )
    ) {
      return true
    }

    const publishedWhere: Where = {
      and: [{ _status: { equals: 'published' } }, { workflowState: { equals: 'published' } }],
    }

    return publishedWhere
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

export const canPublishNewsEvents = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'publish_news_events')
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

export const requiresEditorialWorkflow = (user: AdminUserLike | null | undefined): boolean => {
  if (isAdminUser(user)) {
    return false
  }

  return hasAdminCapability(user, 'require_editorial_workflow')
}

export const canShowEditorialWorkflow = (user: AdminUserLike | null | undefined): boolean => {
  return isAdminUser(user) || requiresEditorialWorkflow(user)
}

export const canManageTaxonomy = (user: AdminUserLike | null | undefined): boolean => {
  return hasAdminCapability(user, 'manage_taxonomy')
}

export const canReadTaxonomy = (user: AdminUserLike | null | undefined): boolean => {
  return (
    [
      'manage_taxonomy',
      'manage_articles',
      'publish_articles',
      'manage_news_events',
      'publish_news_events',
      'manage_reviews',
      'publish_reviews',
    ] as AdminCapability[]
  ).some((capability) => hasAdminCapability(user, capability))
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
