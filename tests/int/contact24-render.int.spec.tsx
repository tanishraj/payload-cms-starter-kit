import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Contact24 } from '@/components/contact24'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'

const offices: SiteOfficeLocation[] = [
  {
    id: 'dubai',
    region: 'Middle East',
    city: 'Dubai',
    address: 'DIFC, Gate Building, Level 13',
    phone: '+971 4 555 0123',
    phoneHref: 'tel:+97145550123',
    email: 'dubai@example.com',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=dubai',
    mapUrl: 'https://maps.google.com/?q=Dubai',
    mapTitle: 'Interactive map for the Dubai office',
  },
]

describe('contact24 presentation', () => {
  it.each(['compact', 'default', 'comfortable'] as const)(
    'uses shared regular-block spacing for %s',
    (size) => {
      const html = renderToStaticMarkup(
        createElement(Contact24, {
          offices,
          size,
          title: 'Our offices',
        }),
      )

      expect(html).toContain(`data-contact24-size="${size}"`)
      expect(html).toContain('py-12 md:py-16')
      expect(html).toContain('mx-auto w-full max-w-screen-2xl px-4')
    },
  )

  it('renders project typography, theme Card composition, and a responsive grid', () => {
    const html = renderToStaticMarkup(
      <Contact24
        contentAlignment="center"
        description="We are here wherever you are."
        eyebrow="Locations"
        offices={offices}
        title="Our offices"
      />,
    )

    expect(html).toContain('font-mono text-xs font-semibold uppercase')
    expect(html).toContain('text-3xl font-semibold tracking-tight text-balance')
    expect(html).toContain('text-base leading-7')
    expect(html).toContain('grid-cols-1')
    expect(html).toContain('md:grid-cols-2')
    expect(html).toContain('data-slot="card"')
    expect(html).toContain('data-slot="card-header"')
    expect(html).toContain('data-slot="card-content"')
    expect(html).toContain('data-slot="card-footer"')
    expect(html).toContain('data-contact24-content-alignment="center"')
  })

  it('renders an accessible lazy map and semantic contact links', () => {
    const html = renderToStaticMarkup(<Contact24 offices={offices} title="Our offices" />)

    expect(html).toContain('title="Interactive map for the Dubai office"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('referrerPolicy="no-referrer-when-downgrade"')
    expect(html).toContain('href="tel:+97145550123"')
    expect(html).toContain('href="mailto:dubai@example.com"')
    expect(html).toContain('href="https://maps.google.com/?q=Dubai"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).toContain('data-icon="inline-end"')
    expect(html).toContain('View on Map')
  })

  it('renders nothing without a title or complete office data', () => {
    expect(renderToStaticMarkup(<Contact24 offices={[]} title="Our offices" />)).toBe('')
    expect(renderToStaticMarkup(<Contact24 offices={offices} title="" />)).toBe('')
  })
})
