import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PageSettings } from '@/globals/PageSettings'
import { SystemModeSettings } from '@/globals/SystemModeSettings'

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

type NamedField = {
  admin?: {
    description?: string
  }
  defaultValue?: unknown
  name: string
  options?: Array<{ value: string }>
}

const getNamedField = (fields: unknown[], fieldName: string): NamedField => {
  const field = fields.find(
    (candidate): candidate is NamedField =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate &&
      candidate.name === fieldName,
  )

  if (!field) {
    throw new Error(`Expected to find "${fieldName}".`)
  }

  return field
}

const loadPageData = async () => {
  vi.resetModules()
  return import('@/app/(frontend)/pageData')
}

describe('system mode settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps Page Settings free of system-mode fields', () => {
    const tabsField = PageSettings.fields.find(
      (field) => typeof field === 'object' && field !== null && 'tabs' in field,
    )

    const typedTabsField = tabsField as { tabs: Array<{ label: string }> } | undefined

    expect(typedTabsField?.tabs.map((tab) => tab.label)).toEqual([
      'Default Home',
      'Header',
      'Footer',
    ])
  })

  it('moves site mode controls into System Mode Settings', () => {
    const siteModeField = getNamedField(SystemModeSettings.fields, 'siteMode')
    const bypassField = getNamedField(SystemModeSettings.fields, 'bypassForLoggedInAdmins')

    expect(siteModeField.defaultValue).toBe('off')
    expect(siteModeField.options?.map(({ value }) => value)).toEqual([
      'off',
      'maintenance',
      'comingSoon',
    ])
    expect(bypassField.admin?.description).toBe(
      'Allow logged-in admin users to continue seeing the normal site when a mode is active.',
    )
  })

  it('keeps maintenance mode active for authenticated non-admin users', async () => {
    payloadMocks.findGlobal.mockImplementation(async ({ slug }) => {
      if (slug === 'page-settings') {
        return { homepage: null }
      }

      return {
        bypassForLoggedInAdmins: true,
        comingSoonPage: null,
        maintenancePage: null,
        notFoundPage: null,
        siteMode: 'maintenance',
      }
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
})
