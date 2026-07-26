import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findGlobal: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', () => ({ getPayload: mocks.getPayload }))

import { Contact24BlockComponent } from '@/blocks/Contact24/Component'
import { Contact24Block } from '@/blocks/Contact24/config'
import {
  getDraftSiteOfficeLocations,
  getPublishedSiteOfficeLocations,
} from '@/lib/siteOffices'

const office = {
  id: 'dubai',
  region: 'Middle East',
  city: 'Dubai',
  address: 'DIFC',
  phone: '+971 4 555 0123',
  email: 'dubai@example.com',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=dubai',
  mapUrl: 'https://maps.google.com/?q=Dubai',
  mapTitle: 'Interactive map for the Dubai office',
}

beforeEach(() => {
  mocks.findGlobal.mockReset()
  mocks.getPayload.mockReset()
  mocks.getPayload.mockResolvedValue({ findGlobal: mocks.findGlobal })
  mocks.findGlobal.mockResolvedValue({ officeLocations: [office] })
})

describe('contact24 data path', () => {
  it('loads and normalizes published and draft Site Settings independently', async () => {
    await expect(getPublishedSiteOfficeLocations()).resolves.toMatchObject([
      { city: 'Dubai', phoneHref: 'tel:+97145550123' },
    ])
    await expect(getDraftSiteOfficeLocations()).resolves.toMatchObject([
      { city: 'Dubai', phoneHref: 'tel:+97145550123' },
    ])

    expect(mocks.findGlobal).toHaveBeenCalledWith({
      depth: 0,
      draft: false,
      slug: 'site-settings',
    })
    expect(mocks.findGlobal).toHaveBeenCalledWith({
      depth: 0,
      draft: true,
      slug: 'site-settings',
    })
  })

  it('joins published Site Settings data with public block presentation', async () => {
    const html = renderToStaticMarkup(
      await Contact24BlockComponent({
        description: 'Regional support',
        eyebrow: 'Locations',
        title: 'Global offices',
      }),
    )

    expect(html).toContain('Global offices')
    expect(html).toContain('Dubai')
    expect(html).toContain('data-contact24-background="none"')
  })

  it('defines the approved Payload content and layout fields', () => {
    const tabs = Contact24Block.fields[0] as {
      tabs?: Array<{ fields: Array<Record<string, unknown>>; label: string }>
      type?: string
    }
    const content = tabs.tabs?.find((tab) => tab.label === 'Content')
    const layout = tabs.tabs?.find((tab) => tab.label === 'Layout & Theme')
    const byName = (fields: Array<Record<string, unknown>>, name: string) =>
      fields.find((field) => field.name === name)

    expect(Contact24Block.labels).toEqual({
      plural: 'Regional Offices',
      singular: 'Regional Offices',
    })
    expect(tabs.type).toBe('tabs')
    expect(content?.fields.map((field) => field.name)).toEqual([
      'eyebrow',
      'title',
      'description',
    ])
    expect(byName(content?.fields ?? [], 'title')?.required).toBe(true)
    expect(byName(layout?.fields ?? [], 'appearance')?.type).toBe('group')
    expect(byName(layout?.fields ?? [], 'contentAlignment')).toMatchObject({
      defaultValue: 'left',
      type: 'select',
    })
    expect(byName(layout?.fields ?? [], 'detailsAlignment')).toMatchObject({
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      required: true,
      type: 'select',
    })
    expect(byName(layout?.fields ?? [], 'showAddressDetails')).toMatchObject({
      defaultValue: true,
      label: 'Show Location Details',
      type: 'checkbox',
    })
    expect(byName(layout?.fields ?? [], 'size')).toMatchObject({
      defaultValue: 'default',
      type: 'select',
    })
  })
})
