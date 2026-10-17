import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Payload, UIFieldServerProps } from 'payload'
import { ADMIN_FEATURE_KEYS, getFeatureAccessSummary } from '@/access/adminFeatures'
import { getFeatureAccessSummary as existingSummary } from '@/components/admin/featureAccessPresentation'
import { getTeamSetupTask, TEAM_SETUP_GUIDE_KEY } from '@/lib/teamSetupGuide'
import { SITE_STRUCTURE_GUIDE_KEY } from '@/lib/siteStructureGuide'

const state = vi.hoisted(() => ({
  id: 'person' as string | undefined,
  collectionSlug: 'users',
  pathname: '/admin/collections/users/person',
  actorRole: 'admin',
  role: 'siteManager',
  features: {} as Record<string, boolean>,
  sections: [] as unknown[],
  modified: false,
  processing: false,
  hasSavePermission: true,
  isTrashed: false,
  documentIsLocked: false,
  currentEditor: undefined as string | undefined,
  drawerSlug: '',
}))
vi.mock('@payloadcms/ui', () => ({
  useAuth: () => ({ user: { id: 'actor', role: state.actorRole } }),
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useDocumentInfo: () => state,
  useDocumentDrawerContext: () => ({ drawerSlug: state.drawerSlug }),
  useFormModified: () => state.modified,
  useFormProcessing: () => state.processing,
  useFormFields: (selector: (value: [Record<string, { value: unknown }>]) => unknown) =>
    selector([
      {
        role: { value: state.role },
        sectionRoots: { value: state.sections },
        ...Object.fromEntries(
          ADMIN_FEATURE_KEYS.map((key) => [`features.${key}`, { value: state.features[key] }]),
        ),
      },
    ]),
}))
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }))
import { TeamSetupGuide } from '@/components/admin/TeamSetupGuide'
import { TeamSetupGuideField } from '@/components/admin/TeamSetupGuideField'

const props = { collapsed: false, preferenceUnavailable: false }
const facts = {
  ...props,
  role: 'siteManager',
  features: {},
  sectionCount: 0,
  modified: false,
  processing: false,
  existingAccount: true,
}
beforeEach(() =>
  Object.assign(state, {
    id: 'person',
    collectionSlug: 'users',
    pathname: '/admin/collections/users/person',
    actorRole: 'admin',
    role: 'siteManager',
    features: {},
    sections: [],
    modified: false,
    processing: false,
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

describe('native account selection preview', () => {
  it('uses the existing dependency summary rather than a competing grant model', () => {
    expect(existingSummary).toBe(getFeatureAccessSummary)
    const summary = getFeatureAccessSummary({ pages: true, media: true })
    expect(summary.directKeys).toEqual(['pages', 'media'])
    expect(summary.dependencyKeys).not.toContain('media')
    expect(summary.dependencyKeys).toContain('forms')
  })
  it('shows complete Admin authority even when old Manager checkboxes and sections remain in the form', () => {
    const task = getTeamSetupTask({
      ...facts,
      role: 'admin',
      features: { pages: true },
      sectionCount: 1,
    })
    expect(task.title).toBe('Admin gives full access to the website')
    expect(task.description).toContain('do not limit an Admin')
    expect(task.action.href).toBe('#field-role')
    expect(task).not.toHaveProperty('complete')
  })
  it('does not turn selected sections into a feature grant', () => {
    const task = getTeamSetupTask({ ...facts, sectionCount: 2 })
    expect(task.title).toBe('Choose what this Site Manager can manage')
    expect(task.description).toContain('sections alone do not grant access')
    expect(task.action.href).toBe('#field-features')
  })
  it('explains missing scope without claiming other selected destinations are section-limited', () => {
    const task = getTeamSetupTask({ ...facts, features: { pages: true, appearance: true } })
    expect(task.action.href).toBe('#field-sectionRoots')
    expect(task.description).toContain(
      'No section selection means no scoped authoring or inbox access',
    )
    expect(task.description).toContain('1 other selected destination remains site-wide')
  })
  it('does not require sections for site-wide-only grants or make dependencies editable', () => {
    const task = getTeamSetupTask({ ...facts, features: { articles: true } })
    expect(task.description).toContain('Site-wide: Articles')
    expect(task.description).toContain('Supporting read-only:')
    expect(task.description).toContain('do not become editable grants')
    expect(task.description).not.toContain('Section-scoped:')
  })
  it('warns that operational destinations alone have no authorized source records', () => {
    const task = getTeamSetupTask({ ...facts, features: { actionQueue: true, auditLog: true } })
    expect(task.title).toBe('Operational access needs source features')
    expect(task.description).toContain('does not unlock source content or submissions')
  })
  it('describes current selection boundaries and server validation without claiming valid roots', () => {
    const task = getTeamSetupTask({
      ...facts,
      features: { pages: true, articles: true, actionQueue: true },
      sectionCount: 2,
      modified: true,
    })
    expect(task.description).toContain('Pages across 2 selected sections')
    expect(task.description).toContain('Site-wide: Articles')
    expect(task.description).toContain('Action Queue stay filtered by source access')
    expect(task.description).toContain('not confirmed until Save succeeds')
    expect(task.description).toContain('Save validates active root sections')
  })
  it('labels a new account preview unsaved even before a field changes', () => {
    expect(
      getTeamSetupTask({ ...facts, existingAccount: false, features: { articles: true } })
        .description,
    ).toContain('not confirmed until Save succeeds')
  })
  it('does not interpret invalid role/count values as expanded authority', () => {
    expect(getTeamSetupTask({ ...facts, role: 'editor' }).action.href).toBe('#field-role')
    for (const sectionCount of [-1, NaN, 1.5])
      expect(
        getTeamSetupTask({ ...facts, sectionCount, features: { pages: true } }).action.href,
      ).toBe('#field-sectionRoots')
  })
  it('bounds long grant summaries while retaining the full native checkboxes', () => {
    const task = getTeamSetupTask({
      ...facts,
      features: Object.fromEntries(ADMIN_FEATURE_KEYS.map((key) => [key, true])),
      sectionCount: 1,
    })
    expect(task.description).toContain('and 19 more')
    expect(task.description).toContain('1 selected section,')
    expect(task.description.length).toBeLessThan(650)
  })
  it('blocks forward actions only while an account update is pending', () => {
    expect(getTeamSetupTask({ ...facts, processing: true, role: 'admin' }).action.disabled).toBe(
      true,
    )
    expect(getTeamSetupTask({ ...facts, modified: true }).action.disabled).toBeUndefined()
  })
})

describe('native team guide adapter', () => {
  it('does not treat inherited lock state as a lock on an unsaved new account', () => {
    state.id = undefined
    state.pathname = '/admin/collections/users/create'
    state.documentIsLocked = true
    state.currentEditor = undefined
    render(<TeamSetupGuide {...props} />)
    expect(screen.getByRole('region', { name: 'Team setup' })).toBeTruthy()
  })

  it('reacts to native role/features/unique section selections without changing them', () => {
    const view = render(<TeamSetupGuide {...props} />)
    expect(
      screen.getByRole('heading', { name: 'Choose what this Site Manager can manage' }),
    ).toBeTruthy()
    state.features = { pages: true }
    view.rerender(<TeamSetupGuide {...props} />)
    expect(screen.getByRole('link', { name: 'Choose website sections' }).getAttribute('href')).toBe(
      '#field-sectionRoots',
    )
    state.sections = ['root', { id: 'root' }]
    state.modified = true
    view.rerender(<TeamSetupGuide {...props} />)
    expect(screen.getByText(/1 selected section,/)).toBeTruthy()
    expect(state.sections).toEqual(['root', { id: 'root' }])
    state.role = 'admin'
    view.rerender(<TeamSetupGuide {...props} />)
    expect(
      screen.getByRole('heading', { name: 'Admin gives full access to the website' }),
    ).toBeTruthy()
  })
  it.each([
    'Manager actor',
    'account route',
    'drawer',
    'read-only',
    'other collection',
    'other editor',
    'trashed',
  ])('omits guidance for %s', (kind) => {
    if (kind === 'Manager actor') state.actorRole = 'siteManager'
    if (kind === 'account route') state.pathname = '/admin/account'
    if (kind === 'drawer') state.drawerSlug = 'drawer'
    if (kind === 'read-only') state.hasSavePermission = false
    if (kind === 'other collection') state.collectionSlug = 'pages'
    if (kind === 'other editor') {
      state.documentIsLocked = true
      state.currentEditor = 'other'
    }
    if (kind === 'trashed') state.isTrashed = true
    render(<TeamSetupGuide {...props} />)
    expect(screen.queryByRole('region')).toBeNull()
  })
  it('keeps guidance visible to the current editor and disables the pending action', () => {
    state.documentIsLocked = true
    state.currentEditor = 'actor'
    state.processing = true
    render(<TeamSetupGuide {...props} />)
    expect(
      (screen.getByRole('button', { name: 'Review account role' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
  it('persists only the acting Admin’s personal help preference, not target grants', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ doc: { value: { dismissed: true } } }) })
    vi.stubGlobal('fetch', fetch)
    render(<TeamSetupGuide {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Team setup' })),
    )
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      `/api/payload-preferences/${TEAM_SETUP_GUIDE_KEY}`,
      expect.objectContaining({ body: JSON.stringify({ value: { dismissed: true } }) }),
    )
    expect(TEAM_SETUP_GUIDE_KEY).not.toBe(SITE_STRUCTURE_GUIDE_KEY)
    expect(state.features).toEqual({})
  })
})

describe('team guide server authority', () => {
  it('does not load preferences for a Manager or bootstrap even when the target role says Admin', async () => {
    const find = vi.fn()
    for (const user of [null, { id: 'manager', role: 'siteManager' }])
      expect(
        await TeamSetupGuideField({
          req: { user, payload: { find } },
          data: { role: 'admin' },
        } as never),
      ).toBeNull()
    expect(find).not.toHaveBeenCalled()
  })
  it('reads only the acting Admin’s account preference with the current request', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ value: { dismissed: true } }] })
    const req = { user: { id: 'actor', role: 'admin' }, payload: { find } as unknown as Payload }
    const element = await TeamSetupGuideField({
      req,
      id: 'target',
    } as unknown as UIFieldServerProps)
    expect(element?.props).toMatchObject({ collapsed: true })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        req,
        user: req.user,
        overrideAccess: false,
        collection: 'payload-preferences',
      }),
    )
    expect(find).toHaveBeenCalledTimes(1)
  })
})
