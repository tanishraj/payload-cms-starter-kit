import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hasAdminCapability, isAdminUser } from '@/access/adminCapabilities'
import { PageSettings } from '@/globals/PageSettings'

const payloadMocks = vi.hoisted(() => {
  return {
    auth: vi.fn(),
    find: vi.fn(),
    findGlobal: vi.fn(),
  }
})

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    auth: payloadMocks.auth,
    find: payloadMocks.find,
    findGlobal: payloadMocks.findGlobal,
  })),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({})),
}))

type PageSettingsNamedField = {
  defaultValue?: unknown
  name: string
  options?: Array<{ value: string }>
  validate?: (value: unknown, options: { req: { payload: { find: ReturnType<typeof vi.fn> } } }) => unknown
}

const getPageSettingsField = (fieldName: string): PageSettingsNamedField => {
  const tabsField = PageSettings.fields.find(
    (field): field is { tabs: Array<{ fields: unknown[] }>; type: 'tabs' } =>
      typeof field === 'object' && field !== null && 'type' in field && field.type === 'tabs',
  )

  if (!tabsField) {
    throw new Error('Expected PageSettings to expose a tabs field.')
  }

  const field = tabsField.tabs
    .flatMap((tab) => tab.fields)
    .find(
      (tabField): tabField is PageSettingsNamedField =>
        typeof tabField === 'object' &&
        tabField !== null &&
        'name' in tabField &&
        tabField.name === fieldName,
    )

  if (!field) {
    throw new Error(`Expected to find "${fieldName}" in PageSettings.`)
  }

  return field
}

const loadPageData = async () => {
  vi.resetModules()
  return import('@/app/(frontend)/pageData')
}

describe('system mode guardrails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('recognizes admin users explicitly', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true)
    expect(isAdminUser({ role: 'editor' })).toBe(false)
  })

  it('does not treat non-admin authenticated users as site-mode bypass users', () => {
    const user = { role: 'editor', capabilities: { manage_pages: true } }

    expect(isAdminUser(user)).toBe(false)
    expect(hasAdminCapability(user, 'manage_pages')).toBe(true)
  })

  it('exposes the starter site modes in Site Defaults', () => {
    const siteModeField = getPageSettingsField('siteMode')

    expect(typeof siteModeField).toBe('object')
    expect(siteModeField.defaultValue).toBe('off')
    expect(siteModeField.options?.map(({ value }) => value)).toEqual([
      'off',
      'maintenance',
      'comingSoon',
    ])
  })

  it('describes bypass behavior as admin-only', () => {
    const bypassField = getPageSettingsField('bypassForLoggedInAdmins') as PageSettingsNamedField & {
      admin?: { description?: string }
    }

    expect(bypassField.admin?.description).toBe(
      'Allow logged-in admin users to continue seeing the normal site when a mode is active.',
    )
  })

  it('requires the homepage to reference a published page', async () => {
    const homepageField = getPageSettingsField('homepage')

    if (typeof homepageField.validate !== 'function') {
      throw new Error('Expected homepage field validation to exist.')
    }

    const find = vi.fn()

    find.mockResolvedValueOnce({
      docs: [],
    })

    await expect(
      homepageField.validate(123, {
        req: {
          payload: {
            find,
          },
        },
      }),
    ).resolves.toBe('Front Page must reference a published page.')

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        where: {
          and: [
            {
              id: {
                equals: 123,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
          ],
        },
      }),
    )

    find.mockResolvedValueOnce({
      docs: [{ id: 123 }],
    })

    await expect(
      homepageField.validate(123, {
        req: {
          payload: {
            find,
          },
        },
      }),
    ).resolves.toBe(true)
  })

  it('keeps maintenance mode active for authenticated non-admin users', async () => {
    payloadMocks.findGlobal.mockResolvedValue({
      bypassForLoggedInAdmins: true,
      comingSoonPage: null,
      maintenancePage: null,
      notFoundPage: null,
      siteMode: 'maintenance',
    })
    payloadMocks.auth.mockResolvedValue({
      user: {
        role: 'editor',
        capabilities: {
          manage_pages: true,
        },
      },
    })

    const { getSystemPageRenderState } = await loadPageData()

    await expect(getSystemPageRenderState('/')).resolves.toEqual({
      mode: 'maintenance',
      page: null,
    })
  })

  it('allows maintenance mode bypass for authenticated admin users', async () => {
    payloadMocks.findGlobal.mockResolvedValue({
      bypassForLoggedInAdmins: true,
      comingSoonPage: null,
      maintenancePage: null,
      notFoundPage: null,
      siteMode: 'maintenance',
    })
    payloadMocks.auth.mockResolvedValue({
      user: {
        role: 'admin',
      },
    })

    const { getSystemPageRenderState } = await loadPageData()

    await expect(getSystemPageRenderState('/')).resolves.toEqual({
      mode: null,
      page: null,
    })
  })
})
