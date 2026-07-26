import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Contact24 } from '@/components/contact24'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'

const createOffice = (
  id: string,
  city: string,
  region: string,
): SiteOfficeLocation => ({
  id,
  region,
  city,
  address: `${city} office address`,
  phone: '+971 4 555 0123',
  phoneHref: 'tel:+97145550123',
  email: `${id}@example.com`,
  mapEmbedUrl: `https://www.google.com/maps/embed?pb=${id}`,
  mapUrl: `https://maps.google.com/?q=${city}`,
  mapTitle: `Interactive map for the ${city} office`,
})

const offices = [
  createOffice('dubai', 'Dubai', 'Middle East'),
  createOffice('london', 'London', 'Europe'),
  createOffice('new-york', 'New York', 'North America'),
  createOffice('singapore', 'Singapore', 'Asia Pacific'),
]

describe('contact24 presentation', () => {
  it.each(['compact', 'default', 'comfortable'] as const)(
    'uses shared regular-block spacing for %s',
    (size) => {
      const html = renderToStaticMarkup(
        createElement(Contact24, {
          offices: offices.slice(0, 1),
          size,
          title: 'Our offices',
        }),
      )

      expect(html).toContain(`data-contact24-size="${size}"`)
      expect(html).toContain('py-12 md:py-16')
      expect(html).toContain('mx-auto w-full max-w-screen-2xl px-4')
    },
  )

  it('uses the full row for one office', () => {
    const html = renderToStaticMarkup(
      <Contact24 offices={offices.slice(0, 1)} title="Our offices" />,
    )

    expect(html).toContain('data-contact24-office-count="1"')
    expect(html).not.toContain('md:grid-cols-2')
  })

  it('caps multiple offices at two desktop columns and renders every office', () => {
    const html = renderToStaticMarkup(<Contact24 offices={offices} title="Our offices" />)

    expect(html).toContain('data-contact24-office-count="4"')
    expect(html).toContain('md:grid-cols-2')
    expect(html).not.toContain('lg:grid-cols-4')

    for (const office of offices) {
      expect(html).toContain(office.city)
      expect(html).toContain(office.mapEmbedUrl)
    }
  })

  it('places square corner-accented details below each map', () => {
    const html = renderToStaticMarkup(
      <Contact24
        contentAlignment="center"
        description="We are here wherever you are."
        eyebrow="Locations"
        offices={offices.slice(0, 1)}
        title="Our offices"
      />,
    )

    expect(html).toContain('data-contact24-office')
    expect(html).toContain('data-contact24-map')
    expect(html).toContain('data-contact24-details')
    expect(html).toContain('data-contact24-corner-accents')
    expect(html).toContain('border border-border')
    expect(html).toContain('rounded-none')
    expect(html).toContain('gap-4')
    expect(html).toContain('sm:aspect-[5/2]')
    expect(html).not.toContain('bg-muted/40')
    expect(html).not.toContain('rounded-none bg-muted')
    expect(html).toContain('-left-1 -top-1 size-3 border-l border-t border-border')
    expect(html).toContain('-right-1 -top-1 size-3 border-r border-t border-border')
    expect(html).toContain('-bottom-1 -left-1 size-3 border-b border-l border-border')
    expect(html).toContain('-bottom-1 -right-1 size-3 border-b border-r border-border')
    expect(html).not.toContain('bg-gradient-to-t')
    expect(html.indexOf('data-contact24-map')).toBeLessThan(
      html.indexOf('data-contact24-details'),
    )
    expect(html.indexOf('Middle East')).toBeGreaterThan(
      html.indexOf('data-contact24-details'),
    )
    expect(html).toContain('data-contact24-content-alignment="center"')
  })

  it('renders an accessible lazy map and semantic contact links', () => {
    const html = renderToStaticMarkup(
      <Contact24 offices={offices.slice(0, 1)} title="Our offices" />,
    )

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
