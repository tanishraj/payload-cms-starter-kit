import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import {
  loadDashboardSections,
  loadDashboardOnboarding,
  canOpenDashboardFeature,
  type DashboardSections,
} from '@/lib/adminOnboarding'
import { ONBOARDING_PREFERENCE_KEY, type OnboardingTask } from '@/lib/adminOnboardingShared'

vi.mock('@payloadcms/ui', () => ({ useConfig: () => ({ config: { routes: { api: '/api' } } }) }))
import { DashboardGettingStarted } from '@/components/admin/DashboardGettingStarted'

const admin = { id: 'admin', role: 'admin' } as User
const manager = {
  id: 'manager',
  role: 'siteManager',
  sectionRoots: ['root-a'],
  features: { pages: true },
} as User
const ready: DashboardSections = { status: 'ready', roots: [{ id: 'root-a', title: 'Admissions' }] }
const missing: DashboardSections = { status: 'missing', roots: [] }
const saved = (dismissed: boolean) => ({
  ok: true,
  json: async () => ({ doc: { value: { dismissed } } }),
})
const task: OnboardingTask = {
  title: 'Create a page',
  description: 'Save a draft before publishing.',
  action: { label: 'Create a page', href: '/admin/collections/pages/create' },
  collapsed: false,
  dismissible: true,
}
const find = vi.fn()
const payload = { find } as unknown as Payload

beforeEach(() => {
  find.mockReset()
  find.mockResolvedValue({ docs: [] })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('current account onboarding facts', () => {
  it('offers the existing Admin recipe route without creating or publishing content', async () => {
    const sections = await loadDashboardSections(payload, admin)
    const result = await loadDashboardOnboarding(payload, admin, sections)
    expect(result).toMatchObject({
      title: 'Create a page',
      action: { href: '/admin/collections/pages/create' },
      collapsed: false,
    })
    for (const [args] of find.mock.calls)
      expect(args).toMatchObject({ user: admin, overrideAccess: false })
    expect(find.mock.calls.map(([args]) => args.collection).sort()).toEqual([
      'pages',
      'payload-preferences',
    ])
  })
  it('shows current root labels only through scoped, latest-draft Page reads', async () => {
    find.mockResolvedValueOnce({ docs: [{ id: 'root-a', title: 'Admissions' }] })
    expect(await loadDashboardSections(payload, manager)).toEqual(ready)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        user: manager,
        overrideAccess: false,
        draft: true,
        depth: 0,
        select: { title: true },
      }),
    )
  })
  it('does not query content or preferences when no features are assigned', async () => {
    const user = { id: 'none', role: 'siteManager', features: {} } as User
    const result = await loadDashboardOnboarding(
      payload,
      user,
      await loadDashboardSections(payload, user),
    )
    expect(result).toMatchObject({
      title: 'No features assigned yet',
      dismissible: false,
      action: { href: '/admin' },
    })
    expect(find).not.toHaveBeenCalled()
  })
  it('never offers scoped creation without current roots, even if a guide was previously hidden', async () => {
    const result = await loadDashboardOnboarding(payload, manager, missing)
    expect(result).toMatchObject({
      title: 'No website sections assigned',
      collapsed: false,
      dismissible: false,
    })
    expect(result.action.href).toBe('/admin')
    expect(canOpenDashboardFeature(manager, missing, 'pages')).toBe(false)
    expect(find).not.toHaveBeenCalled()
  })
  it('distinguishes unavailable scope from no assignments without revealing the raw error', async () => {
    find.mockRejectedValueOnce(new Error('mongodb://secret-credential/private'))
    const sections = await loadDashboardSections(payload, manager)
    const result = await loadDashboardOnboarding(payload, manager, sections)
    expect(result.title).toBe('Website sections unavailable')
    expect(JSON.stringify(result)).not.toContain('secret-credential')
  })
  it('offers an independently granted site-wide feature when scoped work is unavailable', async () => {
    const user = { ...manager, features: { pages: true, articles: true } } as User
    const result = await loadDashboardOnboarding(payload, user, missing)
    expect(result.action).toEqual({
      label: 'Create an article',
      href: '/admin/collections/articles/create',
    })
    expect(result.description).toContain('site-wide')
    expect(result.description).toContain('assigned website section')
  })
  it('does not present source-less Action Queue or Audit Log as usable work', async () => {
    const user = { ...manager, features: { actionQueue: true, auditLog: true } } as User
    const result = await loadDashboardOnboarding(payload, user, { status: 'not-needed', roots: [] })
    expect(result.title).toBe('No content features assigned')
    expect(result.action.href).toBe('/admin')
    expect(find).not.toHaveBeenCalled()
  })
  it('resumes only the current account’s accessible draft and bounds its query', async () => {
    find.mockImplementation(async (args) =>
      args.collection === 'payload-preferences'
        ? { docs: [] }
        : { docs: [{ id: 'draft-a', title: 'Admissions overview', _status: 'draft' }] },
    )
    const result = await loadDashboardOnboarding(payload, manager, ready)
    expect(result.action).toEqual({
      label: 'Continue draft',
      href: '/admin/collections/pages/draft-a',
    })
    expect(result.description).toContain('Admissions overview is saved as a draft')
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        user: manager,
        overrideAccess: false,
        draft: true,
        limit: 1,
        where: { _status: { equals: 'draft' } },
      }),
    )
  })
  it('keeps a failed draft query distinct from a new empty site', async () => {
    find.mockImplementation(async (args) => {
      if (args.collection === 'pages') throw new Error('private server error')
      return { docs: [] }
    })
    const result = await loadDashboardOnboarding(payload, manager, ready)
    expect(result.title).toBe('Your next task is unavailable')
    expect(result.action).toEqual({ label: 'Open Pages', href: '/admin/collections/pages' })
    expect(result.description).not.toContain('private server error')
  })
  it('reads account-owned visibility without treating it as access or completion', async () => {
    find.mockImplementation(async (args) => ({
      docs:
        args.collection === 'payload-preferences'
          ? [{ value: { dismissed: true, completed: true, role: 'admin' } }]
          : [],
    }))
    const result = await loadDashboardOnboarding(payload, manager, ready)
    expect(result.collapsed).toBe(true)
    expect(result.action.href).toBe('/admin/collections/pages/create')
    expect(result.description).toContain('Assigned sections: Admissions')
    const args = find.mock.calls.find(([args]) => args.collection === 'payload-preferences')?.[0]
    expect(JSON.stringify(args.where)).toContain(manager.id)
    expect(args.overrideAccess).toBe(false)
  })
  it('keeps work available when the optional preference cannot load', async () => {
    find.mockImplementation(async (args) => {
      if (args.collection === 'payload-preferences') throw new Error('down')
      return { docs: [] }
    })
    const result = await loadDashboardOnboarding(payload, manager, ready)
    expect(result).toMatchObject({
      collapsed: false,
      preferenceUnavailable: true,
      action: { href: '/admin/collections/pages/create' },
    })
  })
})

describe('guide preference persistence and recovery', () => {
  it('persists hide and reopen through native preferences without any content write', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(saved(true)).mockResolvedValueOnce(saved(false))
    vi.stubGlobal('fetch', fetch)
    render(<DashboardGettingStarted task={task} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Getting started' })).toBeTruthy(),
    )
    expect(fetch).toHaveBeenLastCalledWith(
      `/api/payload-preferences/${ONBOARDING_PREFERENCE_KEY}`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ value: { dismissed: true } }),
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Getting started' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Create a page' })).toBeTruthy())
    expect(fetch).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ value: { dismissed: false } }) }),
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Hide guide' })),
    )
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it('preserves the guide after a rejected save and permits a deliberate retry', async () => {
    const fetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce(saved(true))
    vi.stubGlobal('fetch', fetch)
    render(<DashboardGettingStarted task={task} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('could not be saved'),
    )
    expect(screen.getByRole('heading', { name: 'Create a page' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Getting started' })).toBeTruthy(),
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })
  it('prevents repeated preference requests while pending', async () => {
    let finish: (value: ReturnType<typeof saved>) => void = () => undefined
    const fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    vi.stubGlobal('fetch', fetch)
    render(<DashboardGettingStarted task={task} />)
    const button = screen.getByRole('button', { name: 'Hide guide' })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect((screen.getByRole('button', { name: 'Saving…' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    finish(saved(true))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Getting started' })).toBeTruthy(),
    )
  })
  it('does not claim a preference was saved when a successful HTTP response does not confirm it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
    render(<DashboardGettingStarted task={task} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('could not be saved'),
    )
    expect(screen.getByRole('heading', { name: 'Create a page' })).toBeTruthy()
  })
})
