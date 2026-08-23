import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  adminOrFirstUserAccess,
  adminCapabilityFieldOptions,
  allowDraftPublishedReadOrCapability,
  allowPublicReadOrCapability,
  authenticatedFieldReadAccess,
  canReadTaxonomy,
  canManageSystemModes,
  canPublishArticles,
  canPublishPages,
  canPublishReviews,
  canShowEditorialWorkflow,
  canViewOperationalAudit,
  getCapabilitiesForRole,
  getDefaultCapabilitiesForRole,
  hideFromNonAdmin,
  requiresEditorialWorkflow,
  requireCapability,
} from '@/access/adminCapabilities'
import { editorialRoleOptions } from '@/access/editorialRoles'
import { Users } from '@/collections/Users'

type TestReq = {
  payload: {
    count: ReturnType<typeof vi.fn>
  }
  user?: { capabilities?: Record<string, boolean> | string[]; role?: string } | null
}

const createReq = (
  user?: { capabilities?: Record<string, boolean> | string[]; role?: string } | null,
): TestReq => ({
  payload: {
    count: vi.fn(async () => ({
      totalDocs: 1,
    })),
  },
  user,
})

const toAccessReq = (req: TestReq) =>
  ({
    req,
  }) as never

const getUsersField = (name: string) => {
  const field = Users.fields?.find(
    candidate => 'name' in candidate && candidate.name === name,
  )

  if (!field) {
    throw new Error(`Expected Users field "${name}" to exist.`)
  }

  return field as typeof field & { admin?: { description?: string } }
}

describe('editorial roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes the editorial role set', () => {
    expect(editorialRoleOptions.map(({ value }) => value)).toEqual([
      'admin',
      'siteManager',
      'contentManager',
    ])
  })

  it('assigns the approved defaults to site managers and content managers', () => {
    expect(getDefaultCapabilitiesForRole('siteManager')).toEqual(
      expect.objectContaining({
        manage_articles: true,
        manage_footers: true,
        manage_form_submissions: true,
        manage_forms: true,
        manage_headers: true,
        manage_media: true,
        manage_navigation: true,
        manage_page_settings: true,
        manage_pages: true,
        manage_redirects: true,
        manage_reviews: true,
        manage_seo_settings: true,
        manage_site_settings: true,
        manage_system_modes: true,
        manage_system_pages: true,
        manage_taxonomy: true,
        manage_theme_settings: true,
        manage_work_queue: true,
        publish_articles: true,
        publish_pages: true,
        publish_reviews: true,
        publish_system_pages: true,
        require_editorial_workflow: false,
        view_operational_audit: true,
      }),
    )

    expect(getDefaultCapabilitiesForRole('contentManager')).toEqual(
      expect.objectContaining({
        manage_articles: true,
        manage_media: true,
        manage_pages: true,
        manage_reviews: true,
        publish_articles: true,
        publish_pages: true,
        publish_reviews: true,
        require_editorial_workflow: true,
        manage_system_pages: false,
        manage_system_modes: false,
        publish_system_pages: false,
        manage_site_settings: false,
      }),
    )
  })

  it('gives admins unconditional access to article and review capabilities', () => {
    expect(requireCapability('manage_articles')(toAccessReq(createReq({ role: 'admin' })))).toBe(true)
    expect(requireCapability('manage_reviews')(toAccessReq(createReq({ role: 'admin' })))).toBe(true)
    expect(requireCapability('manage_taxonomy')(toAccessReq(createReq({ role: 'admin' })))).toBe(true)
    expect(requireCapability('publish_articles')(toAccessReq(createReq({ role: 'admin' })))).toBe(true)
    expect(requireCapability('publish_reviews')(toAccessReq(createReq({ role: 'admin' })))).toBe(true)
  })

  it('separates system-level controls from normal publishing', () => {
    const contentManager = {
      role: 'contentManager',
      capabilities: {
        manage_pages: true,
        publish_articles: true,
        publish_pages: true,
        publish_reviews: true,
      },
    }

    const siteManager = {
      role: 'siteManager',
      capabilities: {
        manage_pages: true,
        publish_pages: true,
        publish_articles: true,
        publish_reviews: true,
        manage_system_modes: true,
        view_operational_audit: true,
      },
    }

    expect(canPublishArticles(contentManager)).toBe(true)
    expect(canPublishArticles(siteManager)).toBe(true)
    expect(canPublishPages(contentManager)).toBe(true)
    expect(canPublishPages(siteManager)).toBe(true)
    expect(canPublishReviews(contentManager)).toBe(true)
    expect(canPublishReviews(siteManager)).toBe(true)
    expect(canManageSystemModes(contentManager)).toBe(false)
    expect(canManageSystemModes(siteManager)).toBe(true)
    expect(canViewOperationalAudit(contentManager)).toBe(false)
    expect(canViewOperationalAudit(siteManager)).toBe(true)
    expect(requiresEditorialWorkflow(contentManager)).toBe(false)
    expect(requiresEditorialWorkflow(siteManager)).toBe(false)
    expect(canShowEditorialWorkflow(contentManager)).toBe(false)
    expect(canShowEditorialWorkflow(siteManager)).toBe(false)
    expect(requireCapability('manage_work_queue')(toAccessReq(createReq({ role: 'admin' })))).toBe(
      true,
    )
  })

  it('uses editorial workflow for content managers by default while admins bypass it', () => {
    const contentManager = getDefaultCapabilitiesForRole('contentManager')
    const admin = { role: 'admin' as const }

    expect(requiresEditorialWorkflow({ role: 'contentManager', capabilities: contentManager })).toBe(
      true,
    )
    expect(canShowEditorialWorkflow({ role: 'contentManager', capabilities: contentManager })).toBe(
      true,
    )
    expect(requiresEditorialWorkflow(admin)).toBe(false)
    expect(canShowEditorialWorkflow(admin)).toBe(true)
  })

  it('allows content operators to read taxonomy without granting taxonomy management', () => {
    expect(
      canReadTaxonomy({
        role: 'contentManager',
        capabilities: {
          manage_articles: true,
        },
      }),
    ).toBe(true)

    expect(
      canReadTaxonomy({
        role: 'contentManager',
        capabilities: {
          manage_pages: true,
        },
      }),
    ).toBe(false)
  })
})

describe('existing access helpers', () => {
  it('still allows anonymous reads for public content-backed areas', () => {
    const access = allowPublicReadOrCapability('manage_pages')
    expect(access(toAccessReq(createReq(null)))).toBe(true)
  })

  it('limits anonymous draft-enabled reads to published documents', () => {
    const access = allowDraftPublishedReadOrCapability('manage_media')

    expect(access(toAccessReq(createReq(null)))).toEqual({
      _status: { equals: 'published' },
    })
    expect(
      access(
        toAccessReq(
          createReq({ capabilities: { manage_media: true }, role: 'contentManager' }),
        ),
      ),
    ).toBe(true)
  })

  it('keeps internal fields authenticated-only', () => {
    expect(authenticatedFieldReadAccess({ req: createReq(null) } as never)).toBe(false)
    expect(
      authenticatedFieldReadAccess({ req: createReq({ role: 'contentManager' }) } as never),
    ).toBe(true)
  })

  it('still denies protected writes without the matching capability', () => {
    const access = requireCapability('manage_pages')
    expect(access(toAccessReq(createReq({ role: 'contentManager' })))).toBe(false)
  })

  it('allows submission operators to read users for owner assignment without exposing the Users nav', () => {
    const usersReadAccess = Users.access?.read

    if (!usersReadAccess) {
      throw new Error('Expected Users read access to exist.')
    }

    expect(
      usersReadAccess(
        toAccessReq(
          createReq({
            role: 'siteManager',
            capabilities: {
              manage_form_submissions: true,
            },
          }),
        ),
      ),
    ).toBe(true)
    expect(
      usersReadAccess(
        toAccessReq(
          createReq({
            role: 'contentManager',
            capabilities: {
              manage_work_queue: true,
            },
          }),
        ),
      ),
    ).toBe(true)
    expect(hideFromNonAdmin({ user: { role: 'siteManager' } as never })).toBe(true)
  })

  it('still allows first-user creation without an existing admin', async () => {
    const req = createReq(null)
    req.payload.count = vi.fn(async () => ({
      totalDocs: 0,
    }))

    await expect(adminOrFirstUserAccess(toAccessReq(req))).resolves.toBe(true)
  })
})

describe('user normalization hook', () => {
  it('promotes the first user to admin and creates later users from the selected preset', async () => {
    const hook = Users.hooks?.beforeChange?.[0]

    if (!hook) {
      throw new Error('Expected Users beforeChange hook to exist.')
    }

    const firstUserReq = createReq(null)
    firstUserReq.payload.count = vi.fn(async () => ({
      totalDocs: 0,
    }))

    const firstResult = await hook({
      data: {
        email: 'first@example.com',
        password: 'secret',
      },
      operation: 'create',
      req: firstUserReq,
    } as never)

    expect(firstResult.role).toBe('admin')

    const contentManagerResult = await hook({
      data: {
        capabilities: {
          manage_system_modes: true,
          manage_system_pages: true,
          publish_system_pages: true,
        },
        role: 'contentManager',
        email: 'editor@example.com',
      },
      operation: 'create',
      req: createReq({ role: 'admin' }),
    } as never)

    expect(contentManagerResult.role).toBe('contentManager')
    expect(contentManagerResult.capabilities).toEqual(
      expect.objectContaining({
        manage_articles: true,
        manage_media: true,
        manage_pages: true,
        manage_reviews: true,
        manage_taxonomy: false,
        publish_articles: true,
        publish_pages: true,
        publish_reviews: true,
        require_editorial_workflow: true,
        manage_system_modes: false,
        manage_system_pages: false,
        publish_system_pages: false,
      }),
    )
  })

  it('normalizes legacy stored roles into the new model', async () => {
    const hook = Users.hooks?.beforeChange?.[0]

    if (!hook) {
      throw new Error('Expected Users beforeChange hook to exist.')
    }

    const siteManagerResult = await hook({
      data: {
        role: 'publisher',
      },
      operation: 'update',
      originalDoc: {
        role: 'publisher',
        capabilities: {},
      },
      req: createReq({ role: 'admin' }),
    } as never)

    expect(siteManagerResult.role).toBe('siteManager')

    const contentManagerResult = await hook({
      data: {
        role: 'editor',
      },
      operation: 'update',
      originalDoc: {
        role: 'editor',
        capabilities: {},
      },
      req: createReq({ role: 'admin' }),
    } as never)

    expect(contentManagerResult.role).toBe('contentManager')
  })

  it('reapplies the selected role defaults when a non-admin role changes', async () => {
    const hook = Users.hooks?.beforeChange?.[0]

    if (!hook) {
      throw new Error('Expected Users beforeChange hook to exist.')
    }

    const result = await hook({
      data: {
        role: 'contentManager',
        capabilities: {
          manage_system_modes: true,
          manage_system_pages: true,
          publish_system_pages: true,
        },
      },
      operation: 'update',
      originalDoc: {
        role: 'siteManager',
        capabilities: getCapabilitiesForRole('siteManager'),
      },
      req: createReq({ role: 'admin' }),
    } as never)

    expect(result.role).toBe('contentManager')
    expect(result.capabilities).toEqual(getCapabilitiesForRole('contentManager'))
  })

  it('preserves explicit capability overrides when the non-admin role stays the same', async () => {
    const hook = Users.hooks?.beforeChange?.[0]

    if (!hook) {
      throw new Error('Expected Users beforeChange hook to exist.')
    }

    const result = await hook({
      data: {
        role: 'contentManager',
        capabilities: {
          ...getCapabilitiesForRole('contentManager'),
          manage_forms: true,
          manage_form_submissions: true,
        },
      },
      operation: 'update',
      originalDoc: {
        role: 'contentManager',
        capabilities: getCapabilitiesForRole('contentManager'),
      },
      req: createReq({ role: 'admin' }),
    } as never)

    expect(result.role).toBe('contentManager')
    expect(result.capabilities).toEqual(
      expect.objectContaining({
        manage_forms: true,
        manage_form_submissions: true,
        require_editorial_workflow: true,
        manage_system_modes: false,
      }),
    )
  })

  it('describes roles as presets with capability overrides in the Users admin fields', () => {
    const roleField = getUsersField('role')
    const capabilitiesField = getUsersField('capabilities')

    expect(roleField.admin?.description).toBe(
      'Choose the base access preset for this user. Saving a changed non-admin role reapplies that role default.',
    )
    expect(capabilitiesField.admin?.description).toBe(
      'Role presets define the default access bundle for non-admin users. After saving the role, adjust these checkboxes only for explicit exceptions.',
    )
  })

  it('groups capabilities by responsibility area for admin presentation', () => {
    const capabilityField = getUsersField('capabilities')

    if (capabilityField.type !== 'group') {
      throw new Error('Expected capabilities group field to exist.')
    }

    const serialized = JSON.stringify(capabilityField.fields)

    expect(serialized).toContain('"label":"Content"')
    expect(serialized).toContain('"label":"Site Structure"')
    expect(serialized).toContain('"label":"Lead Management"')
    expect(serialized).toContain('"label":"Configuration"')
    expect(serialized).toContain('"label":"Administration"')
    expect(serialized).toContain('"label":"Publishing"')
  })

  it('uses the approved capability vocabulary for admin checkboxes', () => {
    expect(adminCapabilityFieldOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Navigation Links',
          value: 'manage_navigation',
        }),
        expect.objectContaining({
          label: 'Routing Defaults',
          value: 'manage_page_settings',
        }),
        expect.objectContaining({
          label: 'Site Modes',
          value: 'manage_system_modes',
        }),
        expect.objectContaining({
          label: 'Action Queue',
          value: 'manage_work_queue',
        }),
        expect.objectContaining({
          label: 'Audit Log',
          value: 'view_operational_audit',
        }),
        expect.objectContaining({
          label: 'Require Editorial Workflow',
          value: 'require_editorial_workflow',
        }),
      ]),
    )
  })

  it('keeps Users hidden from non-admins', () => {
    expect(hideFromNonAdmin({ user: { role: 'contentManager' } as never })).toBe(true)
    expect(hideFromNonAdmin({ user: { role: 'admin' } as never })).toBe(false)
  })
})
