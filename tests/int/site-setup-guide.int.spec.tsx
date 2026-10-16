import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Payload, UIFieldServerProps } from 'payload'
import {
  getSiteSetupDestination,
  getSiteSetupTask,
  SITE_SETUP_GUIDE_KEY,
} from '@/lib/siteSetupGuide'
import { ONBOARDING_PREFERENCE_KEY } from '@/lib/adminOnboardingShared'
import { PAGE_EDITING_GUIDE_KEY } from '@/lib/pageEditingGuide'

const state = vi.hoisted(() => ({
  globalSlug: 'site-settings',
  modified: false,
  processing: false,
  hasPublishedDoc: false,
  hasSavePermission: true,
  isTrashed: false,
  documentIsLocked: false,
  currentEditor: undefined as string | undefined,
  drawerSlug: '',
}))
vi.mock('@payloadcms/ui', () => ({
  useAuth: () => ({ user: { id: 'admin', role: 'admin' } }),
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useDocumentInfo: () => state,
  useDocumentDrawerContext: () => ({ drawerSlug: state.drawerSlug }),
  useFormModified: () => state.modified,
  useFormProcessing: () => state.processing,
}))
import { SiteSetupGuide } from '@/components/admin/SiteSetupGuide'
import { SiteSetupGuideField } from '@/components/admin/SiteSetupGuideField'
import { siteSetupGuideField } from '@/fields/siteSetupGuide'

const props = {
  globalSlug: 'site-settings' as const,
  canOpenAppearance: true,
  collapsed: false,
  preferenceUnavailable: false,
}
const facts = { ...props, modified: false, processing: false, hasPublishedDoc: false }
beforeEach(() =>
  Object.assign(state, {
    globalSlug: 'site-settings',
    modified: false,
    processing: false,
    hasPublishedDoc: false,
    hasSavePermission: true,
    isTrashed: false,
    documentIsLocked: false,
    currentEditor: undefined,
    drawerSlug: '',
  }),
)
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('site setup destinations and state', () => {
  it('gives Admins identity first and respects each Site Manager grant', () => {
    expect(getSiteSetupDestination({ role: 'admin' })?.href).toBe('/admin/globals/site-settings')
    expect(
      getSiteSetupDestination({ role: 'siteManager', features: { siteIdentity: true } })?.href,
    ).toBe('/admin/globals/site-settings')
    expect(
      getSiteSetupDestination({ role: 'siteManager', features: { appearance: true } })?.href,
    ).toBe('/admin/globals/theme-settings')
    for (const user of [
      null,
      { role: 'editor' },
      { role: 'siteManager', features: { pages: true } },
    ])
      expect(getSiteSetupDestination(user)).toBeNull()
  })
  it('explains native tabs, draft publication and valid existing defaults without declaring completion', () => {
    const identity = getSiteSetupTask(facts)
    expect(identity.description).toContain('Brand')
    expect(identity.description).toContain('Regional')
    expect(identity.description).toContain('Save Draft stages changes')
    expect(getSiteSetupTask({ ...facts, globalSlug: 'theme-settings' }).description).toContain(
      'Keep the current defaults',
    )
    expect(identity).not.toHaveProperty('complete')
  })
  it('does not send an identity-only Manager to Appearance or a scope-dependent creation route', () => {
    expect(getSiteSetupTask({ ...facts, canOpenAppearance: false }).action.href).toBe('/admin')
    expect(getSiteSetupTask({ ...facts, globalSlug: 'theme-settings' }).action.href).toBe('/admin')
  })
  it('keeps forward navigation disabled for unsaved edits and pending saves', () => {
    expect(getSiteSetupTask({ ...facts, modified: true }).action.disabled).toBe(true)
    const pending = getSiteSetupTask({ ...facts, modified: true, processing: true })
    expect(pending.title).toBe('Settings update in progress')
    expect(pending.action.disabled).toBe(true)
    expect(pending.description).toContain('pending request is not a saved change')
  })
  it('distinguishes an existing public version from defaults rather than promising launch readiness', () => {
    expect(getSiteSetupTask({ ...facts, hasPublishedDoc: true }).description).toContain(
      'existing public version stays active',
    )
    expect(getSiteSetupTask(facts).description).toContain('existing fallbacks')
  })
  it('registers one non-persisted presentation on each owning global', () => {
    for (const globalSlug of ['site-settings', 'theme-settings'] as const)
      expect(siteSetupGuideField(globalSlug)).toMatchObject({
        type: 'ui',
        admin: { components: { Field: { serverProps: { globalSlug } } } },
      })
    expect(SITE_SETUP_GUIDE_KEY).not.toBe(ONBOARDING_PREFERENCE_KEY)
    expect(SITE_SETUP_GUIDE_KEY).not.toBe(PAGE_EDITING_GUIDE_KEY)
  })
})

describe('native site setup guide', () => {
  it('observes native dirty and saving state with real disabled buttons', () => {
    state.modified = true
    const view = render(<SiteSetupGuide {...props} />)
    expect(
      (screen.getByRole('button', { name: 'Review website appearance' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(screen.queryByRole('link')).toBeNull()
    state.processing = true
    view.rerender(<SiteSetupGuide {...props} />)
    expect(screen.getByRole('heading', { name: 'Settings update in progress' })).toBeTruthy()
  })
  it.each(['drawer', 'read-only', 'other global', 'other editor', 'trashed'])(
    'omits guidance in %s context',
    (context) => {
      if (context === 'drawer') state.drawerSlug = 'drawer'
      if (context === 'read-only') state.hasSavePermission = false
      if (context === 'other global') state.globalSlug = 'page-settings'
      if (context === 'other editor') {
        state.documentIsLocked = true
        state.currentEditor = 'other'
      }
      if (context === 'trashed') state.isTrashed = true
      render(<SiteSetupGuide {...props} />)
      expect(screen.queryByRole('region')).toBeNull()
    },
  )
  it('keeps guidance visible to the current lock owner', () => {
    state.documentIsLocked = true
    state.currentEditor = 'admin'
    render(<SiteSetupGuide {...props} />)
    expect(screen.getByRole('region', { name: 'Site setup' })).toBeTruthy()
  })
  it('persists only confirmed personal visibility under its independent key', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ doc: { value: { dismissed: true } } }) })
    vi.stubGlobal('fetch', fetch)
    render(<SiteSetupGuide {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Site setup' })),
    )
    expect(fetch).toHaveBeenCalledWith(
      `/api/payload-preferences/${SITE_SETUP_GUIDE_KEY}`,
      expect.objectContaining({ body: JSON.stringify({ value: { dismissed: true } }) }),
    )
  })
  it('keeps the unsaved-settings warning visible when a preference write fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    state.modified = true
    render(<SiteSetupGuide {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await screen.findByRole('alert')
    expect(
      screen.getByRole('heading', { name: 'Save your settings before continuing' }),
    ).toBeTruthy()
  })
})

describe('site setup server boundary', () => {
  it('never reads preferences or renders guide props for an ungranted global', async () => {
    const find = vi.fn()
    const req = {
      user: { id: 'manager', role: 'siteManager', features: { appearance: true } },
      payload: { find },
    }
    expect(await SiteSetupGuideField({ req, globalSlug: 'site-settings' } as never)).toBeNull()
    expect(find).not.toHaveBeenCalled()
    expect(
      await SiteSetupGuideField({
        req: { ...req, user: null },
        globalSlug: 'theme-settings',
      } as never),
    ).toBeNull()
  })
  it('threads the request and principal through account-owned preference reads, without writing settings', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ value: { dismissed: true } }] })
    const payload = { find } as unknown as Payload
    const req = {
      user: { id: 'identity-manager', role: 'siteManager', features: { siteIdentity: true } },
      payload,
    }
    const element = await SiteSetupGuideField({
      req,
      globalSlug: 'site-settings',
    } as unknown as UIFieldServerProps & { globalSlug: 'site-settings' })
    expect(element?.props).toMatchObject({ canOpenAppearance: false, collapsed: true })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        req,
        user: req.user,
        overrideAccess: false,
        collection: 'payload-preferences',
      }),
    )
  })
})
