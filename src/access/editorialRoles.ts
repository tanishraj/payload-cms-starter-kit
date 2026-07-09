import type { AdminCapabilitiesMap } from '@/access/adminCapabilities'

export const editorialRoleOptions = [
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Publisher',
    value: 'publisher',
  },
  {
    label: 'Editor',
    value: 'editor',
  },
  {
    label: 'Marketing Ops',
    value: 'marketingOps',
  },
] as const

export type EditorialRole = (typeof editorialRoleOptions)[number]['value']

const validRoles = new Set<EditorialRole>(editorialRoleOptions.map(({ value }) => value))

const legacyRoleMap = {
  contentEditor: 'editor',
} as const

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
    view_operational_audit: false,
  }

  for (const capability of enabled) {
    capabilities[capability] = true
  }

  return capabilities
}

const editorDefaults = withCapabilities([
  'manage_footers',
  'manage_headers',
  'manage_media',
  'manage_navigation',
  'manage_pages',
  'manage_redirects',
])

const publisherDefaults = withCapabilities([
  'manage_footers',
  'manage_headers',
  'manage_media',
  'manage_navigation',
  'manage_pages',
  'manage_redirects',
  'manage_system_pages',
  'publish_articles',
  'publish_pages',
  'publish_reviews',
  'publish_system_pages',
  'view_operational_audit',
])

const marketingOpsDefaults = withCapabilities([
  'manage_form_submissions',
  'manage_forms',
  'manage_page_settings',
  'manage_seo_settings',
  'manage_site_settings',
  'manage_system_modes',
  'manage_theme_settings',
  'view_operational_audit',
])

export const isEditorialRole = (value: unknown): value is EditorialRole => {
  return typeof value === 'string' && validRoles.has(value as EditorialRole)
}

export const normalizeEditorialRole = (
  value: unknown,
  fallback: EditorialRole = 'editor',
): EditorialRole => {
  if (value === 'contentEditor') {
    return legacyRoleMap.contentEditor
  }

  return isEditorialRole(value) ? value : fallback
}

export const getDefaultCapabilitiesForRole = (
  role: EditorialRole,
): AdminCapabilitiesMap => {
  switch (role) {
    case 'admin':
      return withCapabilities([
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
    case 'publisher':
      return {
        ...publisherDefaults,
      }
    case 'marketingOps':
      return {
        ...marketingOpsDefaults,
      }
    case 'editor':
    default:
      return {
        ...editorDefaults,
      }
  }
}
