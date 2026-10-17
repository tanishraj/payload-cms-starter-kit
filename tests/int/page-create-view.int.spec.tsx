import { cleanup, render, screen } from '@testing-library/react'
import type { DocumentViewClientProps } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  drawerSlug: '',
  id: undefined as string | undefined,
  role: 'admin',
  editor: '',
}))

vi.mock('@payloadcms/ui', () => ({
  DefaultEditView: () => <div>Native Page editor</div>,
  useDocumentDrawerContext: () => ({ drawerSlug: mocks.drawerSlug }),
  useDocumentInfo: () => ({ id: mocks.id }),
  useAuth: () => ({ user: { role: mocks.role } }),
}))
vi.mock('@/components/admin/PageRecipeSetup', () => ({
  PageRecipeSetup: ({ sectionRequired }: { sectionRequired?: boolean }) => (
    <div>Guided Page setup{sectionRequired ? ' with section selection' : ''}</div>
  ),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams({ editor: mocks.editor }),
}))

import { Pages } from '@/collections/Pages'
import { PageCreateView } from '@/components/admin/PageCreateView'

const props = {} as DocumentViewClientProps

describe('Page create view', () => {
  beforeEach(() => {
    mocks.role = 'admin'
    mocks.editor = ''
    mocks.drawerSlug = ''
    mocks.id = undefined
  })

  afterEach(() => {
    cleanup()
  })

  it('is registered as the default Page document view', () => {
    expect(Pages.admin?.components?.views?.edit).toMatchObject({
      default: { Component: '@/components/admin/PageCreateView#PageCreateView' },
    })
  })

  it('shows guided setup for full-page creation', () => {
    render(<PageCreateView {...props} />)
    expect(screen.getByText('Guided Page setup')).toBeTruthy()
  })

  it('offers section-aware recipes to Site Managers', () => {
    mocks.role = 'siteManager'
    render(<PageCreateView {...props} />)
    expect(screen.getByText('Guided Page setup with section selection')).toBeTruthy()
  })

  it.each(['admin', 'siteManager'])('keeps optional native creation for %s', (role) => {
    mocks.role = role
    mocks.editor = 'native'
    render(<PageCreateView {...props} />)
    expect(screen.getByText('Native Page editor')).toBeTruthy()
  })

  it('delegates existing Pages to Payload', () => {
    mocks.id = 'page-17'
    render(<PageCreateView {...props} />)
    expect(screen.getByText('Native Page editor')).toBeTruthy()
  })

  it('delegates relationship-drawer creation to Payload', () => {
    mocks.drawerSlug = 'pages-drawer'
    render(<PageCreateView {...props} />)
    expect(screen.getByText('Native Page editor')).toBeTruthy()
  })
})
