import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import {
  adminCapabilityCheckboxFields,
  adminOnlyAccess,
  adminOrFirstUserAccess,
  adminRoleOptions,
  allAdminCapabilities,
  hideFromNonAdmin,
  normalizeAdminRole,
  toAdminCapabilitiesMap,
} from '@/access/adminCapabilities'

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

  const resolvedRole = normalizeAdminRole(siblingData?.role ?? data?.role, 'contentEditor')

  return resolvedRole !== 'admin'
}

const normalizeUserAccessFields: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data) {
    return data
  }

  if (operation === 'create') {
    data.role = 'admin'
    data.capabilities = toAdminCapabilitiesMap(allAdminCapabilities)
    return data
  }

  const defaultRole = normalizeAdminRole(originalDoc?.role, 'contentEditor')
  const nextRole = normalizeAdminRole(data.role, defaultRole)

  data.role = nextRole
  data.capabilities =
    nextRole === 'admin'
      ? toAdminCapabilitiesMap(allAdminCapabilities)
      : toAdminCapabilitiesMap(data.capabilities ?? originalDoc?.capabilities)

  return data
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
    read: adminOnlyAccess,
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
      defaultValue: 'admin',
      options: [...adminRoleOptions],
      required: true,
      saveToJWT: true,
      admin: {
        condition: showOnlyForAuthenticatedAdminUser,
        description: 'Controls the base admin role for this user.',
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
          'Choose which admin areas this user can access. Admin users always receive full access.',
      },
      fields: [...adminCapabilityCheckboxFields],
    },
  ],
}
