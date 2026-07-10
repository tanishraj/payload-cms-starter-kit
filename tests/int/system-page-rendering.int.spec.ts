import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DefaultNotFoundPage, SystemModeFallbackPage } from '@/app/(frontend)/SystemFallbackPage'
import { System404BlockComponent } from '@/blocks/System404/Component'
import { SystemComingSoonBlockComponent } from '@/blocks/SystemComingSoon/Component'
import { SystemMaintenanceBlockComponent } from '@/blocks/SystemMaintenance/Component'

describe('system page rendering', () => {
  it('renders the 404 block as a centered full-page system screen', () => {
    const html = renderToStaticMarkup(
      createElement(System404BlockComponent, {
        badge: '404',
        heading: 'Page not found',
        description: 'The page has moved.',
        id: 'system-404',
        primaryAction: null,
        secondaryAction: null,
        supportingNote: null,
      } as never),
    )

    expect(html).toContain('data-system-page-root="true"')
    expect(html).toContain('min-h-screen')
    expect(html).toContain('text-center')
    expect(html).toContain('text-7xl')
  })

  it('renders the maintenance block with the shared minimal layout', () => {
    const html = renderToStaticMarkup(
      createElement(SystemMaintenanceBlockComponent, {
        badge: 'Maintenance',
        description: 'We are applying updates.',
        heading: 'Scheduled maintenance',
        id: 'system-maintenance',
        primaryAction: null,
        secondaryAction: null,
        supportingNote: 'Support remains available by email.',
      } as never),
    )

    expect(html).toContain('Scheduled maintenance')
    expect(html).toContain('Support remains available by email.')
    expect(html).toContain('data-system-page-root="true"')
    expect(html).toContain('text-7xl')
  })

  it('renders the coming soon block with the shared minimal layout', () => {
    const html = renderToStaticMarkup(
      createElement(SystemComingSoonBlockComponent, {
        badge: 'Coming Soon',
        description: 'A refreshed campus experience is on the way.',
        heading: 'New site in progress',
        id: 'system-coming-soon',
        primaryAction: null,
        secondaryAction: null,
        supportingNote: null,
      } as never),
    )

    expect(html).toContain('New site in progress')
    expect(html).toContain('data-system-page-root="true"')
    expect(html).toContain('text-7xl')
  })

  it('keeps the built-in fallback screens available without custom system pages', () => {
    const maintenanceHtml = renderToStaticMarkup(
      createElement(SystemModeFallbackPage, {
        mode: 'maintenance',
      }),
    )
    const notFoundHtml = renderToStaticMarkup(createElement(DefaultNotFoundPage))

    expect(maintenanceHtml).toContain('data-system-page-root="true"')
    expect(maintenanceHtml).toContain("We&#x27;ll be back soon")
    expect(notFoundHtml).toContain('Back to home')
    expect(notFoundHtml).toContain('Page not found')
  })
})
