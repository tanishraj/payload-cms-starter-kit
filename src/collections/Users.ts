import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
  Field,
  FieldAccess,
  Where,
} from 'payload'
import { APIError } from 'payload'
import { normalizeSectionRoots, rootPageFilter } from '@/access/sectionAccess'

import {
  ADMIN_FEATURE_GROUPS,
  ADMIN_FEATURE_KEYS,
  ADMIN_FEATURES,
  type AdminFeatureGrants,
  type AdminRole,
} from '@/access/adminFeatures'
import {
  adminFieldAccess,
  adminOnlyAccess,
  adminOrFirstUserAccess,
  hideFromNonAdmin,
  hasFeature,
  isAdmin,
} from '@/access/featureAccess'
import { recordOperationalAuditEvent } from '@/lib/operationalAudit'
import { runtimeConfig } from '@/config/runtime.server'
import {
  deleteTwoFactorCredentials,
  enforceTwoFactorLogin,
  filterTwoFactorSessions,
} from '@/lib/twoFactor'
import { twoFactorSettingsEndpoint, twoFactorStatusEndpoint } from '@/endpoints/twoFactor'

type UserAccessDocument = {
  deletedAt?: string | null
  features?: AdminFeatureGrants | null
  id?: number | string
  role?: string | null
  sectionRoots?: unknown
}

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Site Manager', value: 'siteManager' },
] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizeRole = (value: unknown, fallback: AdminRole = 'siteManager'): AdminRole =>
  value === 'admin' || value === 'siteManager' ? value : fallback

export const normalizeFeatureGrants = (value: unknown): AdminFeatureGrants => {
  const source = isRecord(value) ? value : {}

  return ADMIN_FEATURE_KEYS.reduce<AdminFeatureGrants>((grants, key) => {
    grants[key] = source[key] === true
    return grants
  }, {})
}

const enabledFeatureKeys = (value: unknown) =>
  ADMIN_FEATURE_KEYS.filter((key) => normalizeFeatureGrants(value)[key] === true)

const sameFeatures = (left: unknown, right: unknown) =>
  ADMIN_FEATURE_KEYS.every(
    (key) => normalizeFeatureGrants(left)[key] === normalizeFeatureGrants(right)[key],
  )

const featureScopeHelp = (key: (typeof ADMIN_FEATURE_KEYS)[number]) => {
  if (['pages', 'forms', 'reusableSections', 'formSubmissions'].includes(key))
    return 'Manageable website sections also apply.'
  if (key === 'actionQueue' || key === 'auditLog')
    return 'Rows for scoped resources follow website sections; other granted resources remain site-wide.'
  return 'This destination currently grants site-wide access.'
}

const createFeatureRows = (keys: readonly (typeof ADMIN_FEATURE_KEYS)[number][]): Field[] => {
  const fields = keys.map<Field>((key) => ({
    name: key,
    type: 'checkbox',
    defaultValue: false,
    label: ADMIN_FEATURES[key].label,
    admin: {
      description: `${ADMIN_FEATURES[key].description} ${featureScopeHelp(key)}`,
      width: '50%',
    },
  }))

  const rows: Field[] = []
  for (let index = 0; index < fields.length; index += 3) {
    rows.push({ type: 'row', fields: fields.slice(index, index + 3) })
  }
  return rows
}

export const adminFeatureCheckboxFields: Field[] = ADMIN_FEATURE_GROUPS.map((group) => {
  const keys = ADMIN_FEATURE_KEYS.filter((key) => ADMIN_FEATURES[key].group === group)
  return {
    type: 'collapsible',
    label: `${group} (${keys.length})`,
    admin: { initCollapsed: true },
    fields: [
      {
        name: `featureGroup${group.replace(/[^a-z0-9]+/gi, '')}Controls`,
        type: 'ui',
        admin: {
          components: {
            Field: {
              path: '@/components/admin/FeatureAccessControls#FeatureGroupControls',
              clientProps: { featureKeys: keys, groupLabel: group },
            },
          },
        },
      },
      ...createFeatureRows(keys),
    ],
  }
})

const showFeatureAccess = (
  data: Record<string, unknown>,
  siblingData: Record<string, unknown>,
  { user }: { user?: unknown },
) => isAdmin(user) && normalizeRole(siblingData.role ?? data.role) === 'siteManager'

const adminOrSelfAccess = ({ id, req }: { id?: number | string; req: { user?: unknown } }) => {
  if (isAdmin(req.user)) return true
  if (!isRecord(req.user) || req.user.id == null) return false
  if (id != null) return String(req.user.id) === String(id)
  return { id: { equals: req.user.id } }
}

const adminOrSelfFieldRead: FieldAccess = ({ req, id, doc }) =>
  isAdmin(req.user) || (req.user?.id != null && String(req.user.id) === String(id ?? doc?.id))

const canUseAssignmentControls = (user: unknown) =>
  hasFeature(user, 'formSubmissions') || hasFeature(user, 'actionQueue')

const adminSelfOrAssignmentRead = ({
  id,
  req,
}: {
  id?: number | string
  req: { user?: unknown }
}) => {
  if (isAdmin(req.user) || canUseAssignmentControls(req.user)) return true
  return adminOrSelfAccess({ id, req })
}

const sanitizeAssignmentUser: CollectionAfterReadHook = ({ doc, req }) => {
  if (isAdmin(req.user) || String(req.user?.id ?? '') === String(doc.id)) return doc
  if (!canUseAssignmentControls(req.user)) return doc

  return {
    id: doc.id,
    email: `User #${doc.id}`,
  }
}

const countOtherActiveAdmins = async ({
  id,
  req,
}: {
  id?: number | string
  req: Parameters<CollectionBeforeChangeHook>[0]['req']
}) => {
  const conditions: Where[] = [
    { role: { equals: 'admin' } },
    {
      or: [{ deletedAt: { exists: false } }, { deletedAt: { equals: null } }],
    },
  ]

  if (id != null) conditions.push({ id: { not_equals: id } })

  const result = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    trash: true,
    where: { and: conditions },
  })

  return result.totalDocs
}

const assertAnotherAdminExists = async ({
  originalDoc,
  req,
}: {
  originalDoc?: UserAccessDocument | null
  req: Parameters<CollectionBeforeChangeHook>[0]['req']
}) => {
  if (originalDoc?.role !== 'admin') return

  const total = await countOtherActiveAdmins({ id: originalDoc.id, req })
  if (total === 0) {
    throw new APIError('The last active Admin cannot be demoted, trashed, or deleted.', 400)
  }
}

export const normalizeUserAccessFields: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data

  if (operation === 'create') {
    const { totalDocs } = await req.payload.count({
      collection: 'users',
      overrideAccess: true,
      req,
      trash: true,
      // Keep this logically unfiltered while forcing transaction-safe countDocuments in MongoDB.
      where: { id: { exists: true } },
    })

    if (totalDocs === 0) {
      data.sectionRoots = []
      data.role = 'admin'
      data.features = normalizeFeatureGrants(null)
      return data
    }

    const role = normalizeRole(data.role)
    data.sectionRoots = role === 'siteManager' ? normalizeSectionRoots(data.sectionRoots) : []
    data.role = role
    data.features =
      role === 'siteManager' ? normalizeFeatureGrants(data.features) : normalizeFeatureGrants(null)
    return data
  }

  const previous = (originalDoc ?? {}) as UserAccessDocument
  const previousRole = normalizeRole(previous.role)
  const nextRole = normalizeRole(data.role, previousRole)
  const isTrashAttempt = typeof data.deletedAt === 'string' && data.deletedAt.length > 0

  if (previousRole === 'admin' && (nextRole !== 'admin' || isTrashAttempt)) {
    await assertAnotherAdminExists({ originalDoc: previous, req })
  }

  const nextFeatures =
    nextRole === 'siteManager'
      ? normalizeFeatureGrants(data.features ?? previous.features)
      : normalizeFeatureGrants(null)
  const nextSections =
    nextRole === 'siteManager'
      ? normalizeSectionRoots(
          Object.hasOwn(data, 'sectionRoots') ? data.sectionRoots : previous.sectionRoots,
        )
      : []
  const sameSections =
    JSON.stringify(nextSections) === JSON.stringify(normalizeSectionRoots(previous.sectionRoots))
  const accessChanged =
    nextRole !== previousRole || !sameFeatures(nextFeatures, previous.features) || !sameSections
  data.sectionRoots = nextSections

  data.role = nextRole
  data.features = nextFeatures
  if (accessChanged) data.sessions = []

  return data
}

export const preventLastAdminDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const target = (await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
    req,
    trash: true,
  })) as UserAccessDocument

  await assertAnotherAdminExists({ originalDoc: target, req })
}

const auditUserAuthorizationChange: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const current = doc as UserAccessDocument
  const previous = previousDoc as UserAccessDocument | undefined
  const lifecycleChanged = current.deletedAt !== previous?.deletedAt
  const authorizationChanged =
    normalizeRole(current.role) !== normalizeRole(previous?.role) ||
    !sameFeatures(current.features, previous?.features) ||
    JSON.stringify(normalizeSectionRoots(current.sectionRoots)) !==
      JSON.stringify(normalizeSectionRoots(previous?.sectionRoots))

  if (operation !== 'create' && !lifecycleChanged && !authorizationChanged) return doc

  if (lifecycleChanged) {
    const trashed = Boolean(current.deletedAt)
    await recordOperationalAuditEvent({
      action: trashed ? 'user_trashed' : 'user_restored',
      entityId: String(current.id ?? ''),
      entityTitle: `User #${current.id ?? 'unknown'}`,
      entityType: 'user',
      req,
      summary: `User #${current.id ?? 'unknown'} was ${trashed ? 'trashed' : 'restored'}.`,
    })
  }

  if (operation === 'create' || authorizationChanged) {
    const before = previous
      ? `${normalizeRole(previous.role)} [${enabledFeatureKeys(previous.features).join(', ')}]`
      : 'new user'
    const after = `${normalizeRole(current.role)} [${enabledFeatureKeys(current.features).join(', ')}]`

    await recordOperationalAuditEvent({
      action: operation === 'create' ? 'user_created' : 'user_access_changed',
      entityId: String(current.id ?? ''),
      entityTitle: `User #${current.id ?? 'unknown'}`,
      entityType: 'user',
      req,
      summary: `Authorization changed from ${before} to ${after}. Section roots: [${normalizeSectionRoots(previous?.sectionRoots).join(', ')}] → [${normalizeSectionRoots(current.sectionRoots).join(', ')}].`,
    })
  }

  return doc
}

const auditUserDeletion: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await recordOperationalAuditEvent({
    action: 'user_permanently_deleted',
    entityId: String(doc.id),
    entityTitle: `User #${doc.id}`,
    entityType: 'user',
    req,
    summary: `User #${doc.id} was permanently deleted.`,
  })

  return doc
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Administration',
    hidden: hideFromNonAdmin,
    useAsTitle: 'email',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: runtimeConfig.deployment.isProduction,
    },
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
    removeTokenFromResponses: true,
    tokenExpiration: 2 * 60 * 60,
    useSessions: true,
  },
  endpoints: [twoFactorStatusEndpoint, twoFactorSettingsEndpoint],
  access: {
    create: adminOrFirstUserAccess(runtimeConfig.auth),
    delete: adminOnlyAccess,
    read: adminSelfOrAssignmentRead,
    readVersions: adminOnlyAccess,
    unlock: adminOnlyAccess,
    update: adminOrSelfAccess,
  },
  hooks: {
    afterChange: [auditUserAuthorizationChange],
    afterDelete: [auditUserDeletion, deleteTwoFactorCredentials],
    afterRead: [sanitizeAssignmentUser, filterTwoFactorSessions],
    beforeLogin: [enforceTwoFactorLogin],
    beforeChange: [normalizeUserAccessFields],
    beforeDelete: [preventLastAdminDelete],
  },
  fields: [
    {
      name: 'teamSetupGuide',
      type: 'ui',
      admin: {
        condition: (_data, _siblingData, { user }) => isAdmin(user),
        components: { Field: '@/components/admin/TeamSetupGuideField#TeamSetupGuideField' },
      },
    },
    {
      name: 'twoFactorSettings',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/TwoFactorSettings#TwoFactorSettings' } },
    },
    {
      name: 'firstAdminNotice',
      type: 'ui',
      admin: {
        condition: (_data, _siblingData, { user }) => !user,
        components: {
          Field: '@/components/admin/FirstAdminNotice#FirstAdminNotice',
        },
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'siteManager',
      options: [...roleOptions],
      required: true,
      saveToJWT: true,
      access: { create: adminFieldAccess, read: adminOrSelfFieldRead, update: adminFieldAccess },
      admin: {
        condition: (_data, _siblingData, { user }) => isAdmin(user),
        description: 'Admins have full access. Site Managers receive only selected features.',
        position: 'sidebar',
      },
    },
    {
      name: 'sectionRoots',
      label: 'Manageable website sections',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      saveToJWT: true,
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
        read: adminOrSelfFieldRead,
      },
      filterOptions: rootPageFilter,
      validate: async (value, { req }) => {
        const roots = normalizeSectionRoots(value)
        if (roots.length > 50) return 'Assign at most 50 website sections.'
        if (!roots.length) return true
        const found = await req.payload.find({
          collection: 'pages',
          req,
          overrideAccess: true,
          draft: true,
          depth: 0,
          limit: 51,
          pagination: false,
          select: { parent: true },
          where: { and: [{ id: { in: roots } }, rootPageFilter] },
        })
        return (
          found.docs.length === roots.length ||
          'Choose active root Pages; nested or trashed Pages cannot define sections.'
        )
      },
      admin: {
        condition: showFeatureAccess,
        description:
          'Choose root Pages: descendants are included automatically. No selection means no access to scoped Pages or submissions. Feature grants are also required. Saving changed sections signs the Site Manager out. Sections currently protect Pages, Forms, Reusable Sections and submissions; other granted destinations remain site-wide.',
      },
    },
    {
      name: 'features',
      type: 'group',
      saveToJWT: true,
      access: { create: adminFieldAccess, read: adminOrSelfFieldRead, update: adminFieldAccess },
      admin: {
        condition: showFeatureAccess,
        description:
          'Choose editable Admin destinations. Required supporting destinations receive read-only access without appearing in navigation. After changed access is saved, the Site Manager is signed out of active sessions.',
      },
      fields: [
        {
          name: 'featureAccessOverview',
          type: 'ui',
          admin: {
            components: {
              Field: {
                path: '@/components/admin/FeatureAccessControls#FeatureAccessOverview',
              },
            },
          },
        },
        ...adminFeatureCheckboxFields,
      ],
    },
  ],
}
