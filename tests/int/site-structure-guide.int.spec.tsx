import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Payload, UIFieldServerProps } from 'payload'
import {
  getMenuEditingDestination,
  getSiteStructureDestination,
  getSiteStructureTask,
  SITE_STRUCTURE_GUIDE_KEY,
} from '@/lib/siteStructureGuide'
import { SITE_SETUP_GUIDE_KEY } from '@/lib/siteSetupGuide'
import { PAGE_EDITING_GUIDE_KEY, getPageEditingTask } from '@/lib/pageEditingGuide'

const state = vi.hoisted(() => ({
  globalSlug: 'page-settings',
  modified: false,
  processing: false,
  hasPublishedDoc: false,
  hasSavePermission: true,
  isTrashed: false,
  documentIsLocked: false,
  currentEditor: undefined as string | undefined,
  drawerSlug: '',
  homepage: null as string | null,
}))
vi.mock('@payloadcms/ui', () => ({
  useAuth: () => ({ user: { id: 'admin', role: 'admin' } }),
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useDocumentInfo: () => state,
  useDocumentDrawerContext: () => ({ drawerSlug: state.drawerSlug }),
  useFormModified: () => state.modified,
  useFormProcessing: () => state.processing,
  useFormFields: (selector: (value: [{ homepage: { value: string | null } }]) => boolean) =>
    selector([{ homepage: { value: state.homepage } }]),
}))
import { SiteStructureGuide } from '@/components/admin/SiteStructureGuide'
import { SiteStructureGuideField } from '@/components/admin/SiteStructureGuideField'

const props = {
  menuAction: getMenuEditingDestination({ role: 'admin' }),
  collapsed: false,
  preferenceUnavailable: false,
}
const facts = {
  ...props,
  hasHomepageSelection: false,
  modified: false,
  processing: false,
  hasPublishedDoc: false,
}
beforeEach(() =>
  Object.assign(state, {
    globalSlug: 'page-settings',
    modified: false,
    processing: false,
    hasPublishedDoc: false,
    hasSavePermission: true,
    isTrashed: false,
    documentIsLocked: false,
    currentEditor: undefined,
    drawerSlug: '',
    homepage: null,
  }),
)
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('homepage and menu guidance authority', () => {
  it('offers Layout Defaults only for the actual update grant, including explicitly granted Managers', () => {
    expect(getSiteStructureDestination({ role: 'admin' })?.href).toBe(
      '/admin/globals/page-settings',
    )
    expect(
      getSiteStructureDestination({ role: 'siteManager', features: { layoutDefaults: true } })
        ?.href,
    ).toBe('/admin/globals/page-settings')
    for (const user of [
      null,
      { role: 'editor' },
      { role: 'siteManager', features: { pages: true, headers: true } },
    ])
      expect(getSiteStructureDestination(user)).toBeNull()
  })
  it('never confuses dependency read with Header or Footer editing', () => {
    expect(
      getMenuEditingDestination({ role: 'siteManager', features: { layoutDefaults: true } }),
    ).toBeNull()
    expect(
      getMenuEditingDestination({ role: 'siteManager', features: { navigationLinks: true } }),
    ).toBeNull()
    expect(
      getMenuEditingDestination({ role: 'siteManager', features: { footers: true } })?.href,
    ).toBe('/admin/collections/footers')
    expect(getMenuEditingDestination({ role: 'admin' })?.href).toBe('/admin/collections/headers')
  })
  it('explains separate homepage/menu/publication steps without declaring completion', () => {
    const task = getSiteStructureTask(facts)
    expect(task.action.href).toBe('#field-homepage')
    expect(task.description).toContain('does not make it the homepage or add a menu item')
    expect(task.description).toContain('pages may override')
    expect(task.description).toContain('site-wide')
    expect(task).not.toHaveProperty('complete')
  })
  it('offers a permitted menu editor only after a homepage is selected, with a safe fallback', () => {
    expect(getSiteStructureTask({ ...facts, hasHomepageSelection: true }).action.href).toBe(
      '/admin/collections/headers',
    )
    const limited = getSiteStructureTask({ ...facts, hasHomepageSelection: true, menuAction: null })
    expect(limited.action.href).toBe('#field-homepage')
    expect(limited.description).toContain('Ask an Admin')
  })
  it('disables forward navigation for dirty and pending state, prioritizing pending', () => {
    expect(getSiteStructureTask({ ...facts, modified: true }).action.disabled).toBe(true)
    const pending = getSiteStructureTask({ ...facts, modified: true, processing: true })
    expect(pending.title).toBe('Layout update in progress')
    expect(pending.action.disabled).toBe(true)
    expect(pending.description).toContain('not confirmation of a public change')
  })
  it('does not interpret a draft selection or personal preference as public readiness', () => {
    expect(
      getSiteStructureTask({ ...facts, hasHomepageSelection: true, collapsed: true }).description,
    ).toContain('Publish, then check /')
    expect(getSiteStructureTask({ ...facts, hasPublishedDoc: true }).description).toContain(
      'keeps public settings unchanged',
    )
    expect(SITE_STRUCTURE_GUIDE_KEY).not.toBe(SITE_SETUP_GUIDE_KEY)
    expect(SITE_STRUCTURE_GUIDE_KEY).not.toBe(PAGE_EDITING_GUIDE_KEY)
  })
  it('connects only a clean public Page to granted settings and preserves private/unsaved preview', () => {
    const page = {
      previewURL: '/preview/page/id',
      hasBlocks: true,
      hasPublishedDoc: true,
      modified: false,
      processing: false,
      siteManager: true,
      collapsed: false,
      structureAction: getSiteStructureDestination({ role: 'admin' }),
    }
    expect(getPageEditingTask(page).action.href).toBe('/admin/globals/page-settings')
    expect(getPageEditingTask({ ...page, modified: true }).action.href).toBe(page.previewURL)
    expect(getPageEditingTask({ ...page, hasPublishedDoc: false }).action.href).toBe(
      page.previewURL,
    )
    const limited = getPageEditingTask({ ...page, structureAction: null })
    expect(limited.action.href).toBe(page.previewURL)
    expect(limited.description).toContain('Ask an Admin')
  })
})

describe('native Layout Defaults guidance', () => {
  it('observes only homepage selection and native saving facts', () => {
    const view = render(<SiteStructureGuide {...props} />)
    expect(screen.getByRole('link', { name: 'Choose a homepage' }).getAttribute('href')).toBe(
      '#field-homepage',
    )
    state.homepage = 'page-id'
    view.rerender(<SiteStructureGuide {...props} />)
    expect(screen.getByRole('link', { name: 'Open Headers' })).toBeTruthy()
    state.modified = true
    view.rerender(<SiteStructureGuide {...props} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Open Headers' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
  it.each(['drawer', 'read-only', 'other global', 'other editor', 'trashed'])(
    'omits guidance in %s context',
    (kind) => {
      if (kind === 'drawer') state.drawerSlug = 'drawer'
      if (kind === 'read-only') state.hasSavePermission = false
      if (kind === 'other global') state.globalSlug = 'site-settings'
      if (kind === 'other editor') {
        state.documentIsLocked = true
        state.currentEditor = 'other'
      }
      if (kind === 'trashed') state.isTrashed = true
      render(<SiteStructureGuide {...props} />)
      expect(screen.queryByRole('region')).toBeNull()
    },
  )
  it('keeps the current lock owner in the real form', () => {
    state.documentIsLocked = true
    state.currentEditor = 'admin'
    render(<SiteStructureGuide {...props} />)
    expect(screen.getByRole('region', { name: 'Homepage and navigation' })).toBeTruthy()
  })
  it('confirms account-owned visibility before hiding, without writing a global', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ doc: { value: { dismissed: true } } }) })
    vi.stubGlobal('fetch', fetch)
    render(<SiteStructureGuide {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Homepage and navigation' }),
      ),
    )
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      `/api/payload-preferences/${SITE_STRUCTURE_GUIDE_KEY}`,
      expect.objectContaining({ body: JSON.stringify({ value: { dismissed: true } }) }),
    )
  })
  it('retains help and the unsaved warning after a failed preference save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    state.modified = true
    render(<SiteStructureGuide {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await screen.findByRole('alert')
    expect(
      screen.getByRole('heading', { name: 'Save your layout settings before continuing' }),
    ).toBeTruthy()
  })
})

describe('Layout Defaults server boundary', () => {
  it('does not read a preference or pass props to users without its management grant', async () => {
    const find = vi.fn()
    for (const user of [null, { id: 'manager', role: 'siteManager', features: { pages: true } }])
      expect(
        await SiteStructureGuideField({ req: { user, payload: { find } } } as never),
      ).toBeNull()
    expect(find).not.toHaveBeenCalled()
  })
  it('threads principal/request into the preference read and passes no ungranted menu route', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ value: { dismissed: true } }] })
    const req = {
      user: { id: 'layout-manager', role: 'siteManager', features: { layoutDefaults: true } },
      payload: { find } as unknown as Payload,
    }
    const element = await SiteStructureGuideField({ req } as unknown as UIFieldServerProps)
    expect(element?.props).toMatchObject({ menuAction: null, collapsed: true })
    expect(find).toHaveBeenCalledTimes(1)
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
