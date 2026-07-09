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

  const resolvedRole = normalizeEditorialRole(siblingData?.role ?? data?.role, 'editor')

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

    const nextRole = normalizeEditorialRole(data.role, 'editor')

    data.role = nextRole
    data.capabilities =
      data.capabilities === undefined
        ? getCapabilitiesForRole(nextRole)
        : toAdminCapabilitiesMap(data.capabilities)

    return data
  }

  const defaultRole = normalizeEditorialRole(originalDoc?.role, 'editor')
  const nextRole = normalizeEditorialRole(data.role, defaultRole)
  const roleChanged = nextRole !== defaultRole

  data.role = nextRole

  if (nextRole === 'admin') {
    data.capabilities = toAdminCapabilitiesMap(allAdminCapabilities)
    return data
  }

  if (data.capabilities !== undefined) {
    data.capabilities = toAdminCapabilitiesMap(data.capabilities)
    return data
  }

  data.capabilities = roleChanged
    ? getCapabilitiesForRole(nextRole)
    : toAdminCapabilitiesMap(originalDoc?.capabilities ?? getCapabilitiesForRole(nextRole))

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
    group: 'Admin',
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
      defaultValue: 'editor',
      options: [...editorialRoleOptions],
      required: true,
      saveToJWT: true,
      admin: {
        condition: showOnlyForAuthenticatedAdminUser,
        description: 'Controls the editorial role for this user.',
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
          'Adjust capability overrides for non-admin users. Role defaults apply when no overrides are set.',
      },
      fields: [...adminCapabilityCheckboxFields],
    },
  ],
}
