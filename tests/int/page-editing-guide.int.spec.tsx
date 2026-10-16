import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Payload, PayloadRequest, UIFieldServerProps } from 'payload'
import type { User } from '@/payload-types'
import { getPageEditingTask, PAGE_EDITING_GUIDE_KEY } from '@/lib/pageEditingGuide'
import { loadAccountGuidePreference } from '@/lib/accountGuidePreference'
import { ONBOARDING_PREFERENCE_KEY } from '@/lib/adminOnboardingShared'

const state = vi.hoisted(() => ({
  id: undefined as string | undefined,
  modified: false,
  processing: false,
  hasBlocks: false,
  hasPublishedDoc: false,
  hasSavePermission: true,
  isTrashed: false,
  documentIsLocked: false,
  drawerSlug: '',
  currentEditor: undefined as string | { id: string } | undefined,
  role: 'siteManager',
  features: {} as Record<string, boolean>,
}))
vi.mock('@payloadcms/ui', () => ({
  useAuth: () => ({ user: { id: 'manager', role: state.role, features: state.features } }),
  useConfig: () => ({ config: { serverURL: 'https://example.test', routes: { api: '/api' } } }),
  useDocumentInfo: () => state,
  useDocumentDrawerContext: () => ({ drawerSlug: state.drawerSlug }),
  useFormModified: () => state.modified,
  useFormProcessing: () => state.processing,
  useFormFields: (selector: (value: [{ layout: { rows: object[] } }]) => boolean) =>
    selector([{ layout: { rows: state.hasBlocks ? [{}] : [] } }]),
}))
import { PageEditingGuide } from '@/components/admin/PageEditingGuide'
import { PageEditingGuideField } from '@/components/admin/PageEditingGuideField'

const base = {
  previewURL: '/preview/page/page-1',
  hasBlocks: true,
  modified: false,
  processing: false,
  hasPublishedDoc: false,
  siteManager: true,
  collapsed: false,
}

beforeEach(() => {
  Object.assign(state, {
    id: undefined,
    modified: false,
    processing: false,
    hasBlocks: false,
    hasPublishedDoc: false,
    hasSavePermission: true,
    isTrashed: false,
    documentIsLocked: false,
    currentEditor: undefined,
    drawerSlug: '',
    role: 'siteManager',
    features: {},
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('page editing guidance facts', () => {
  it('teaches Parent and first save only before a saved page exists', () => {
    const task = getPageEditingTask({ ...base, previewURL: null })
    expect(task.description).toContain('Parent in an assigned section')
    expect(task.action.href).toBe('#field-layout')
    expect(task.description).toContain('Nothing is published automatically')
    expect(
      getPageEditingTask({ ...base, previewURL: null, siteManager: false }).description,
    ).not.toContain('assigned section')
  })
  it('distinguishes unsaved edits from the last saved preview even when blocks were removed', () => {
    const task = getPageEditingTask({ ...base, modified: true, hasBlocks: false })
    expect(task.title).toContain('Save your changes')
    expect(task.description).toContain('does not include unsaved edits')
    expect(task.action).toMatchObject({ href: base.previewURL, target: '_blank' })
  })
  it('never offers a navigable preview during an update or claims the request succeeded', () => {
    const task = getPageEditingTask({ ...base, modified: true, processing: true })
    expect(task.action.disabled).toBe(true)
    expect(task.description).toContain('pending request is not a saved page')
  })
  it('uses block guidance for empty saved pages, then distinguishes private drafts and public versions', () => {
    expect(getPageEditingTask({ ...base, hasBlocks: false }).title).toBe('Add your first block')
    expect(getPageEditingTask(base).description).toContain('stays private until')
    expect(getPageEditingTask({ ...base, hasPublishedDoc: true }).description).toContain(
      'A public version',
    )
  })
})

describe('native page guide adapter', () => {
  it('shows the site-wide settings route only for a granted clean public Page', () => {
    Object.assign(state, {
      id: 'page-1',
      hasBlocks: true,
      hasPublishedDoc: true,
      features: { layoutDefaults: true },
    })
    const view = render(<PageEditingGuide collapsed={false} preferenceUnavailable={false} />)
    expect(
      screen.getByRole('link', { name: 'Review homepage and navigation' }).getAttribute('href'),
    ).toBe('/admin/globals/page-settings')
    state.features = {}
    view.rerender(<PageEditingGuide collapsed={false} preferenceUnavailable={false} />)
    expect(screen.queryByRole('link', { name: 'Review homepage and navigation' })).toBeNull()
    expect(screen.getByRole('link', { name: /Preview saved page/ })).toBeTruthy()
  })

  it('uses a saved preview in a separate safe tab and keeps unsaved edits in the editor', () => {
    Object.assign(state, { id: 'page-1', hasBlocks: true, modified: true })
    render(<PageEditingGuide collapsed={false} preferenceUnavailable={false} />)
    const link = screen.getByRole('link', { name: /Preview saved page/ })
    expect(link.getAttribute('href')).toBe('https://example.test/preview/page/page-1')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByText(/does not include unsaved edits/)).toBeTruthy()
  })
  it('renders an actually disabled native button while the form is processing', () => {
    Object.assign(state, { id: 'page-1', processing: true })
    render(<PageEditingGuide collapsed={false} preferenceUnavailable={false} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Preview saved page' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
  it.each(['drawer', 'readOnly', 'trashed', 'locked'])(
    'does not interfere with %s native editing',
    (kind) => {
      if (kind === 'drawer') state.drawerSlug = 'pages-drawer'
      if (kind === 'readOnly') state.hasSavePermission = false
      if (kind === 'trashed') state.isTrashed = true
      if (kind === 'locked') state.documentIsLocked = true
      const { container } = render(
        <PageEditingGuide collapsed={false} preferenceUnavailable={false} />,
      )
      expect(container.textContent).toBe('')
    },
  )
  it('keeps guidance visible while Payload holds the editing lock for this account', () => {
    Object.assign(state, {
      id: 'page-1',
      hasBlocks: true,
      modified: true,
      documentIsLocked: true,
      currentEditor: { id: 'manager' },
    })
    render(<PageEditingGuide collapsed={false} preferenceUnavailable={false} />)
    expect(
      screen.getByRole('heading', { name: 'Save your changes before previewing' }),
    ).toBeTruthy()
  })
  it('saves visibility under its own account preference without changing dashboard visibility or content', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ doc: { value: { dismissed: true } } })))
    vi.stubGlobal('fetch', fetch)
    render(<PageEditingGuide collapsed={false} preferenceUnavailable={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Getting started' })).toBeTruthy(),
    )
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe(`/api/payload-preferences/${PAGE_EDITING_GUIDE_KEY}`)
    expect(fetch.mock.calls[0][0]).not.toContain(ONBOARDING_PREFERENCE_KEY)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ value: { dismissed: true } })
  })
})

describe('account guide preference read boundary', () => {
  it('enforces the signed-in owner, key and request on the native Local API', async () => {
    const user = { id: 'manager', role: 'siteManager' } as User
    const find = vi.fn().mockResolvedValue({ docs: [{ value: { dismissed: true } }] })
    const payload = { find } as unknown as Payload
    const req = { payload, user } as PayloadRequest
    expect(await loadAccountGuidePreference(payload, user, PAGE_EDITING_GUIDE_KEY, req)).toEqual({
      collapsed: true,
      unavailable: false,
    })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        req,
        user,
        overrideAccess: false,
        where: {
          and: [
            { key: { equals: PAGE_EDITING_GUIDE_KEY } },
            { 'user.value': { equals: user.id } },
            { 'user.relationTo': { equals: 'users' } },
          ],
        },
      }),
    )
    const field = await PageEditingGuideField({ req } as UIFieldServerProps)
    expect(field?.props).toEqual({ collapsed: true, preferenceUnavailable: false })
  })
  it('does not treat a failed preference query as dismissal, completion or a content blocker', async () => {
    const payload = {
      find: vi.fn().mockRejectedValue(new Error('unavailable')),
    } as unknown as Payload
    expect(
      await loadAccountGuidePreference(payload, { id: 'manager' } as User, PAGE_EDITING_GUIDE_KEY),
    ).toEqual({ collapsed: false, unavailable: true })
  })
})
