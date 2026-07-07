import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  adminOrFirstUserAccess,
  allAdminCapabilities,
  allowPublicReadOrCapability,
  hideFromNonAdmin,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { Media } from '@/collections/Media'
import { Users } from '@/collections/Users'
import { PageSettings } from '@/globals/PageSettings'

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

describe('admin capability access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows anonymous reads for public content-backed areas', () => {
    const access = allowPublicReadOrCapability('manage_pages')

    expect(access(toAccessReq(createReq(null)))).toBe(true)
  })

  it('denies authenticated users without the matching capability', () => {
    const access = allowPublicReadOrCapability('manage_pages')

    expect(access(toAccessReq(createReq({ role: 'contentEditor' })))).toBe(false)
  })

  it('allows capability holders and admins for protected operations', () => {
    const capabilityAccess = requireCapability('manage_pages')

    expect(
      capabilityAccess(
        toAccessReq(
          createReq({
            capabilities: {
              manage_pages: true,
            },
            role: 'contentEditor',
          }),
        ),
      ),
    ).toBe(true)

    expect(
      capabilityAccess(
        toAccessReq(
          createReq({
            role: 'admin',
          }),
        ),
      ),
    ).toBe(true)
  })

  it('allows first-user creation without an existing admin', async () => {
    const req = createReq(null)
    req.payload.count = vi.fn(async () => ({
      totalDocs: 0,
    }))

    await expect(adminOrFirstUserAccess(toAccessReq(req))).resolves.toBe(true)
  })
})

describe('admin visibility', () => {
  it('hides Users from non-admins', () => {
    expect(hideFromNonAdmin({ user: { role: 'contentEditor' } as never })).toBe(true)
    expect(hideFromNonAdmin({ user: { role: 'admin' } as never })).toBe(false)
  })

  it('hides content areas from users without the capability', () => {
    const hidden = hideFromUsersWithoutCapability('manage_pages')

    expect(hidden({ user: { role: 'contentEditor' } as never })).toBe(true)
    expect(
      hidden({
        user: {
          capabilities: {
            manage_pages: true,
          },
          role: 'contentEditor',
        } as never,
      }),
    ).toBe(false)
  })
})

describe('collection and global wiring', () => {
  it('wires media access to manage_media while preserving anonymous reads', () => {
    expect(Media.access?.read?.(toAccessReq(createReq(null)))).toBe(true)

    expect(
      Media.access?.update?.(
        toAccessReq(
          createReq({
            capabilities: {
              manage_media: true,
            },
            role: 'editor',
          }),
        ),
      ),
    ).toBe(true)

    expect(
      Media.access?.update?.(
        toAccessReq(
          createReq({
            role: 'editor',
          }),
        ),
      ),
    ).toBe(false)
  })

  it('wires Site Defaults visibility and updates to site settings capability', () => {
    const hidden = PageSettings.admin?.hidden

    if (typeof hidden !== 'function') {
      throw new Error('Expected PageSettings admin.hidden to be a function.')
    }

    expect(hidden({ user: { role: 'editor' } as never })).toBe(true)
    expect(
      PageSettings.access?.update?.(
        toAccessReq(
          createReq({
            capabilities: {
              manage_page_settings: true,
            },
            role: 'contentEditor',
          }),
        ),
      ),
    ).toBe(true)
  })

  it('keeps Site Defaults accessible for existing users with the legacy Site Settings capability', () => {
    expect(
      PageSettings.access?.update?.(
        toAccessReq(
          createReq({
            capabilities: {
              manage_site_settings: true,
            },
            role: 'contentEditor',
          }),
        ),
      ),
    ).toBe(true)
  })
})

describe('user normalization hook', () => {
  it('hides role and capabilities on first-user registration when no admin is logged in', () => {
    const roleField = Users.fields.find(
      (field) => 'name' in field && field.name === 'role',
    )
    const capabilitiesField = Users.fields.find(
      (field) => 'name' in field && field.name === 'capabilities',
    )

    if (!roleField || !('admin' in roleField) || typeof roleField.admin?.condition !== 'function') {
      throw new Error('Expected role field admin.condition to exist.')
    }

    if (
      !capabilitiesField ||
      !('admin' in capabilitiesField) ||
      typeof capabilitiesField.admin?.condition !== 'function'
    ) {
      throw new Error('Expected capabilities field admin.condition to exist.')
    }

    const conditionContext = (user: unknown) =>
      ({
        blockData: {},
        operation: 'create',
        path: [],
        user: user as never,
      }) as never

    expect(roleField.admin.condition({}, {}, conditionContext(null))).toBe(false)
    expect(capabilitiesField.admin.condition({}, {}, conditionContext(null))).toBe(false)
    expect(roleField.admin.condition({}, {}, conditionContext({ id: 1 }))).toBe(true)
    expect(
      capabilitiesField.admin.condition(
        { role: 'editor' },
        { role: 'editor' },
        conditionContext({ id: 1 }),
      ),
    ).toBe(true)
    expect(
      capabilitiesField.admin.condition(
        { role: 'admin' },
        { role: 'admin' },
        conditionContext({ id: 1 }),
      ),
    ).toBe(false)
  })

  it('promotes the first created user to admin with all capabilities', async () => {
    const hook = Users.hooks?.beforeChange?.[0]

    if (!hook) {
      throw new Error('Expected Users beforeChange hook to exist.')
    }

    const req = createReq(null)
    req.payload.count = vi.fn(async () => ({
      totalDocs: 0,
    }))

    const result = await hook({
      data: {
        email: 'first@example.com',
        password: 'test',
      },
      operation: 'create',
      req,
    } as never)

    expect(result.role).toBe('admin')
    expect(result.capabilities).toEqual(
      expect.objectContaining(
        Object.fromEntries(allAdminCapabilities.map((capability) => [capability, true])),
      ),
    )
  })

  it('sanitizes invalid capabilities for non-admin users', async () => {
    const hook = Users.hooks?.beforeChange?.[0]

    if (!hook) {
      throw new Error('Expected Users beforeChange hook to exist.')
    }

    const req = createReq({
      role: 'admin',
    })

    const result = await hook({
      data: {
        capabilities: {
          manage_pages: true,
          unknown_capability: true,
        },
        role: 'editor',
      },
      operation: 'create',
      req,
    } as never)

    expect(result.role).toBe('editor')
    expect(result.capabilities).toEqual(
      expect.objectContaining({
        manage_pages: true,
      }),
    )
    expect('unknown_capability' in (result.capabilities as Record<string, boolean>)).toBe(false)
  })
})
