import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import {
  adminCapabilityCheckboxFields,
  adminOnlyAccess,
  adminOrFirstUserAccess,
  allAdminCapabilities,
  getCapabilitiesForRole,
  hasAdminCapability,
  hideFromNonAdmin,
  isAdminUser,
  toAdminCapabilitiesMap,
} from '@/access/adminCapabilities'
import {
  editorialRoleOptions,
  normalizeEditorialRole,
} from '@/access/editorialRoles'

const showOnlyForAuthenticatedAdminUser = (
  _: Record<string, unknown>,
  __: Record<string, unknown>,
  { user }: { user?: unknown },
) => {
  return Boolean(user)
}

const showCapabilitiesForNonAdminRole = (
  data: Record<string, unknown>,
  siblingData: Record<string, unknown>,
  { user }: { user?: unknown },
) => {
  if (!user) {
    return false
  }

  const resolvedRole = normalizeEditorialRole(siblingData?.role ?? data?.role, 'contentManager')

  return resolvedRole !== 'admin'
}

const normalizeUserAccessFields: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) {
    return data
  }

  if (operation === 'create') {
    const { totalDocs } = await req.payload.count({
      collection: 'users',
      overrideAccess: true,
      where: {},
    })

    if (totalDocs === 0) {
      data.role = 'admin'
      data.capabilities = toAdminCapabilitiesMap(allAdminCapabilities)
      return data
    }

    const nextRole = normalizeEditorialRole(data.role, 'contentManager')

    data.role = nextRole
    data.capabilities =
      nextRole === 'admin'
        ? toAdminCapabilitiesMap(allAdminCapabilities)
        : getCapabilitiesForRole(nextRole)

    return data
  }

  const defaultRole = normalizeEditorialRole(originalDoc?.role, 'contentManager')
  const nextRole = normalizeEditorialRole(data.role, defaultRole)
  const roleChanged = nextRole !== defaultRole

  data.role = nextRole

  if (nextRole === 'admin') {
    data.capabilities = toAdminCapabilitiesMap(allAdminCapabilities)
    return data
  }

  if (roleChanged) {
    data.capabilities = getCapabilitiesForRole(nextRole)
    return data
  }

  if (data.capabilities !== undefined) {
    data.capabilities = toAdminCapabilitiesMap(data.capabilities)
    return data
  }

  data.capabilities = toAdminCapabilitiesMap(
    originalDoc?.capabilities ?? getCapabilitiesForRole(nextRole),
  )

  return data
}

const adminOrSubmissionOperatorReadAccess = ({ req }: { req: { user?: unknown } }) => {
  const user = req.user as Parameters<typeof isAdminUser>[0]

  if (isAdminUser(user)) {
    return true
  }

  return (
    hasAdminCapability(user, 'manage_form_submissions') ||
    hasAdminCapability(user, 'manage_work_queue')
  )
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Operations',
    hidden: hideFromNonAdmin,
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: adminOrFirstUserAccess,
    delete: adminOnlyAccess,
    read: adminOrSubmissionOperatorReadAccess,
    readVersions: adminOnlyAccess,
    update: adminOnlyAccess,
  },
  hooks: {
    beforeChange: [normalizeUserAccessFields],
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      defaultValue: 'contentManager',
      options: [...editorialRoleOptions],
      required: true,
      saveToJWT: true,
      admin: {
        condition: showOnlyForAuthenticatedAdminUser,
        description:
          'Choose the base access preset for this user. Saving a changed non-admin role reapplies that role default.',
        position: 'sidebar',
      },
    },
    {
      name: 'capabilities',
      type: 'group',
      saveToJWT: true,
      admin: {
        condition: showCapabilitiesForNonAdminRole,
        description:
          'Role presets define the default access bundle for non-admin users. After saving the role, adjust these checkboxes only for explicit exceptions.',
      },
      fields: [...adminCapabilityCheckboxFields],
    },
  ],
}
