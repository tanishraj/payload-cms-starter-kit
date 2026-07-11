import type { AdminCapabilitiesMap } from '@/access/adminCapabilities'

export const editorialRoleOptions = [
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Site Manager',
    value: 'siteManager',
  },
  {
    label: 'Content Manager',
    value: 'contentManager',
  },
] as const

export type EditorialRole = (typeof editorialRoleOptions)[number]['value']
type LegacyEditorialRole = 'contentEditor' | 'editor' | 'marketingOps' | 'publisher'
type EditorialRoleInput = EditorialRole | LegacyEditorialRole

const validRoles = new Set<EditorialRole>(editorialRoleOptions.map(({ value }) => value))

const legacyRoleMap = {
  contentEditor: 'contentManager',
  editor: 'contentManager',
  marketingOps: 'siteManager',
  publisher: 'siteManager',
} as const satisfies Record<LegacyEditorialRole, EditorialRole>

const allCapabilityValues: Array<keyof AdminCapabilitiesMap> = [
  'manage_articles',
  'manage_footers',
  'manage_form_submissions',
  'manage_forms',
  'manage_headers',
  'manage_media',
  'manage_navigation',
  'manage_page_settings',
  'manage_pages',
  'manage_redirects',
  'manage_reviews',
  'manage_work_queue',
  'manage_seo_settings',
  'manage_site_settings',
  'manage_system_modes',
  'manage_system_pages',
  'manage_taxonomy',
  'manage_theme_settings',
  'publish_articles',
  'publish_pages',
  'publish_reviews',
  'publish_system_pages',
  'require_editorial_workflow',
  'view_operational_audit',
]

const withCapabilities = (enabled: Array<keyof AdminCapabilitiesMap>): AdminCapabilitiesMap => {
  const capabilities: AdminCapabilitiesMap = {
    manage_articles: false,
    manage_footers: false,
    manage_form_submissions: false,
    manage_forms: false,
    manage_headers: false,
    manage_media: false,
    manage_navigation: false,
    manage_page_settings: false,
    manage_pages: false,
    manage_redirects: false,
    manage_reviews: false,
    manage_work_queue: false,
    manage_seo_settings: false,
    manage_site_settings: false,
    manage_system_modes: false,
    manage_system_pages: false,
    manage_taxonomy: false,
    manage_theme_settings: false,
    publish_articles: false,
    publish_pages: false,
    publish_reviews: false,
    publish_system_pages: false,
    require_editorial_workflow: false,
    view_operational_audit: false,
  }

  for (const capability of enabled) {
    capabilities[capability] = true
  }

  return capabilities
}

const contentManagerDefaults = withCapabilities([
  'manage_articles',
  'manage_media',
  'manage_pages',
  'manage_reviews',
  'publish_articles',
  'publish_pages',
  'publish_reviews',
  'require_editorial_workflow',
])

const siteManagerDefaults = withCapabilities([
  'manage_articles',
  'manage_footers',
  'manage_form_submissions',
  'manage_forms',
  'manage_headers',
  'manage_media',
  'manage_navigation',
  'manage_page_settings',
  'manage_pages',
  'manage_redirects',
  'manage_reviews',
  'manage_work_queue',
  'manage_seo_settings',
  'manage_site_settings',
  'manage_system_modes',
  'manage_system_pages',
  'manage_taxonomy',
  'manage_theme_settings',
  'publish_articles',
  'publish_pages',
  'publish_reviews',
  'publish_system_pages',
  'view_operational_audit',
])

export const isEditorialRole = (value: unknown): value is EditorialRole => {
  return typeof value === 'string' && validRoles.has(value as EditorialRole)
}

const toNormalizedEditorialRole = (value: unknown): EditorialRole | null => {
  if (isEditorialRole(value)) {
    return value
  }

  if (typeof value === 'string' && value in legacyRoleMap) {
    return legacyRoleMap[value as LegacyEditorialRole]
  }

  return null
}

export const normalizeEditorialRole = (
  value: unknown,
  fallback: EditorialRoleInput = 'contentManager',
): EditorialRole => {
  return toNormalizedEditorialRole(value) ?? toNormalizedEditorialRole(fallback) ?? 'contentManager'
}

export const getDefaultCapabilitiesForRole = (
  role: EditorialRole,
): AdminCapabilitiesMap => {
  switch (role) {
    case 'admin':
      return withCapabilities(allCapabilityValues)
    case 'siteManager':
      return {
        ...siteManagerDefaults,
      }
    case 'contentManager':
    default:
      return {
        ...contentManagerDefaults,
      }
  }
}
