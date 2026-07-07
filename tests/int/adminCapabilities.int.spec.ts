import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  adminOrFirstUserAccess,
  allowPublicReadOrCapability,
  canManageSystemModes,
  canPublishPages,
  canViewOperationalAudit,
  getDefaultCapabilitiesForRole,
  hideFromNonAdmin,
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

describe('editorial roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes the editorial role set', () => {
    expect(editorialRoleOptions.map(({ value }) => value)).toEqual([
      'admin',
      'publisher',
      'editor',
      'marketingOps',
    ])
  })

  it('assigns safe defaults to editors and publishers', () => {
    expect(getDefaultCapabilitiesForRole('editor')).toEqual(
      expect.objectContaining({
        manage_pages: true,
        publish_pages: false,
        manage_system_modes: false,
        view_operational_audit: false,
      }),
    )

    expect(getDefaultCapabilitiesForRole('publisher')).toEqual(
      expect.objectContaining({
        manage_pages: true,
        publish_pages: true,
        manage_system_modes: false,
        view_operational_audit: true,
      }),
    )
  })

  it('separates publishing and system-mode controls from editing', () => {
    const editor = {
      role: 'editor',
      capabilities: {
        manage_pages: true,
      },
    }

    const publisher = {
      role: 'publisher',
      capabilities: {
        manage_pages: true,
        publish_pages: true,
        view_operational_audit: true,
      },
    }

    const marketingOps = {
      role: 'marketingOps',
      capabilities: {
        manage_forms: true,
        manage_form_submissions: true,
        manage_system_modes: true,
        view_operational_audit: true,
      },
    }

    expect(canPublishPages(editor)).toBe(false)
    expect(canPublishPages(publisher)).toBe(true)
    expect(canManageSystemModes(editor)).toBe(false)
    expect(canManageSystemModes(marketingOps)).toBe(true)
    expect(canViewOperationalAudit(publisher)).toBe(true)
  })
})

describe('existing access helpers', () => {
  it('still allows anonymous reads for public content-backed areas', () => {
    const access = allowPublicReadOrCapability('manage_pages')
    expect(access(toAccessReq(createReq(null)))).toBe(true)
  })

  it('still denies protected writes without the matching capability', () => {
    const access = requireCapability('manage_pages')
    expect(access(toAccessReq(createReq({ role: 'editor' })))).toBe(false)
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
  it('promotes the first user to admin and later users to safe role defaults', async () => {
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

    const editorResult = await hook({
      data: {
        role: 'editor',
        email: 'editor@example.com',
      },
      operation: 'update',
      originalDoc: {
        role: 'editor',
      },
      req: createReq({ role: 'admin' }),
    } as never)

    expect(editorResult.capabilities).toEqual(
      expect.objectContaining({
        manage_pages: true,
        publish_pages: false,
        manage_system_modes: false,
      }),
    )
  })

  it('keeps Users hidden from non-admins', () => {
    expect(hideFromNonAdmin({ user: { role: 'editor' } as never })).toBe(true)
    expect(hideFromNonAdmin({ user: { role: 'admin' } as never })).toBe(false)
  })
})
