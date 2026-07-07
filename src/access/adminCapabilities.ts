import type { Access } from 'payload'

export const adminRoleOptions = [
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Editor',
    value: 'editor',
  },
  {
    label: 'Content Editor',
    value: 'contentEditor',
  },
] as const

export type AdminRole = (typeof adminRoleOptions)[number]['value']

export const adminCapabilityFieldOptions = [
  {
    label: 'Pages',
    value: 'manage_pages',
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
    label: 'System Pages',
    value: 'manage_system_pages',
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
    label: 'Media',
    value: 'manage_media',
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
] as const

export type AdminCapability = (typeof adminCapabilityFieldOptions)[number]['value']

export type AdminCapabilitiesMap = Partial<Record<AdminCapability, boolean | null>>

type AdminUserLike = {
  capabilities?: AdminCapabilitiesMap | null | string[]
  role?: AdminRole | null | string
}

const validRoles = new Set<AdminRole>(adminRoleOptions.map(({ value }) => value))
const validCapabilities = new Set<AdminCapability>(
  adminCapabilityFieldOptions.map(({ value }) => value),
)

export const allAdminCapabilities = adminCapabilityFieldOptions.map(
  ({ value }) => value,
) as AdminCapability[]

const adminCapabilityCheckboxItems = adminCapabilityFieldOptions.map(({ label, value }) => ({
  name: value,
  type: 'checkbox' as const,
  admin: {
    description: `Allow access to ${label}.`,
    width: '33.33%',
  },
  defaultValue: false,
  label,
}))

export const adminCapabilityCheckboxFields = adminCapabilityCheckboxItems.reduce<
  Array<{
    fields: typeof adminCapabilityCheckboxItems
    type: 'row'
  }>
>((rows, field, index) => {
  const rowIndex = Math.floor(index / 3)

  if (!rows[rowIndex]) {
    rows[rowIndex] = {
      fields: [],
      type: 'row',
    }
  }

  rows[rowIndex].fields.push(field)

  return rows
}, [])

export const isAdminRole = (value: unknown): value is AdminRole => {
  return typeof value === 'string' && validRoles.has(value as AdminRole)
}

export const normalizeAdminRole = (
  value: unknown,
  fallback: AdminRole = 'contentEditor',
): AdminRole => {
  return isAdminRole(value) ? value : fallback
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
  return user?.role === 'admin'
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
