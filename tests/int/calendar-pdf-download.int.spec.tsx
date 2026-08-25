import { render } from '@testing-library/react'
import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { AnnualCalendarBlock } from '@/blocks/AnnualCalendar/config'
import { CalendarBlock } from '@/blocks/Calendar/config'
import { CalendarUpcoming } from '@/blocks/Calendar/CalendarUpcoming'
import { CalendarPdfDownload } from '@/blocks/shared/CalendarPdfDownload'
import { CalendarSidebar } from '@/blocks/shared/CalendarSidebar'
import { resolveCalendarPdf } from '@/blocks/shared/calendarPdf'
import { createCalendarPdfFields } from '@/blocks/shared/calendarPdfFields'
import type { Media } from '@/payload-types'

const findNamedField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field
    if ('fields' in field) {
      const match = findNamedField(field.fields, name)
      if (match) return match
    }
    if ('tabs' in field) {
      for (const tab of field.tabs) {
        const match = findNamedField(tab.fields, name)
        if (match) return match
      }
    }
  }
}

const pdf = {
  filename: 'academic-calendar-2026-27.pdf',
  id: 'calendar-pdf',
  mimeType: 'application/pdf',
  url: '/media/academic-calendar-2026-27.pdf',
} as Media

describe('shared calendar PDF contract', () => {
  it('defines the reusable PDF authoring fields', () => {
    const fields = createCalendarPdfFields()
    const upload = findNamedField(fields, 'calendarPdf')
    const title = findNamedField(fields, 'calendarPdfTitle') as Field & {
      admin?: { condition?: (_data: unknown, siblingData?: Record<string, unknown>) => boolean }
    }
    const label = findNamedField(fields, 'calendarPdfLabel') as Field & {
      admin?: { condition?: (_data: unknown, siblingData?: Record<string, unknown>) => boolean }
    }

    expect(upload).toMatchObject({
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      label: 'Calendar PDF',
      relationTo: 'media',
      type: 'upload',
    })
    expect(title).toMatchObject({
      defaultValue: 'Academic calendar PDF',
      label: 'PDF Document Label',
      type: 'text',
    })
    expect(label).toMatchObject({
      defaultValue: 'Download',
      label: 'PDF Button Label',
      type: 'text',
    })
    expect(title.admin?.condition?.({}, {})).toBe(false)
    expect(title.admin?.condition?.({}, { calendarPdf: 'media-id' })).toBe(true)
    expect(label.admin?.condition?.({}, {})).toBe(false)
    expect(label.admin?.condition?.({}, { calendarPdf: 'media-id' })).toBe(true)
  })

  it('resolves only populated PDF Media and normalizes labels', () => {
    expect(resolveCalendarPdf(pdf, ' Academic year calendar ', ' Save PDF ')).toEqual({
      filename: 'academic-calendar-2026-27.pdf',
      href: '/media/academic-calendar-2026-27.pdf',
      label: 'Save PDF',
      title: 'Academic year calendar',
    })
    expect(resolveCalendarPdf(pdf, '   ', '   ')).toMatchObject({
      label: 'Download',
      title: 'Academic calendar PDF',
    })
    expect(resolveCalendarPdf('calendar-pdf')).toBeUndefined()
    expect(resolveCalendarPdf({ ...pdf, mimeType: 'image/jpeg' } as Media)).toBeUndefined()
    expect(resolveCalendarPdf({ ...pdf, url: null } as Media)).toBeUndefined()
  })

  it.each([
    ['Calendar', CalendarBlock],
    ['Annual Calendar', AnnualCalendarBlock],
  ])('registers the shared PDF fields in %s', (_label, block) => {
    expect(findNamedField(block.fields, 'calendarPdf')).toMatchObject({
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      relationTo: 'media',
      type: 'upload',
    })
    expect(findNamedField(block.fields, 'calendarPdfTitle')).toMatchObject({
      defaultValue: 'Academic calendar PDF',
      type: 'text',
    })
    expect(findNamedField(block.fields, 'calendarPdfLabel')).toMatchObject({
      defaultValue: 'Download',
      type: 'text',
    })
  })

  it('renders a stacked semantic panel with a full-width action', () => {
    const { container } = render(
      <CalendarPdfDownload
        download={{
          filename: 'academic-calendar.pdf',
          href: '/media/academic-calendar.pdf',
          label: 'Download PDF',
          title: 'Academic calendar document with a long wrapping title',
        }}
        surface="brand"
      />,
    )

    const panel = container.querySelector('[data-calendar-pdf-download="true"]')
    const link = panel?.querySelector('a')
    expect(panel?.className).toContain('flex-col')
    expect(panel?.className).not.toContain('sm:flex-row')
    expect(panel?.querySelector('[data-calendar-pdf-title="true"]')?.className).toContain(
      'break-words',
    )
    expect(link?.className).toContain('w-full')
    expect(link?.getAttribute('download')).toBe('academic-calendar.pdf')
    expect(link?.textContent).toContain('Download PDF')
    expect(panel?.className).toContain('border-primary-foreground/20')
    expect(link?.className).toContain('border-white')
  })

  it('composes one labelled full-height sidebar and pins an embedded PDF region', () => {
    const { container } = render(
      <CalendarSidebar
        download={{ href: '/calendar.pdf', label: 'Download', title: 'Academic calendar PDF' }}
        label="Upcoming"
        surface="light"
      >
        <CalendarUpcoming
          classifications={[]}
          embedded
          emptyMessage="No events"
          eyebrow="Up next"
          events={[]}
          showLegend={false}
          title="Upcoming"
        />
      </CalendarSidebar>,
    )

    const sidebar = container.querySelector('[data-calendar-sidebar="true"]')
    const upcoming = sidebar?.querySelector('[data-calendar-upcoming="true"]')
    const download = sidebar?.querySelector('[data-calendar-pdf-download="true"]')

    expect(sidebar?.tagName).toBe('ASIDE')
    expect(sidebar?.getAttribute('aria-label')).toBe('Upcoming calendar sidebar')
    expect(sidebar?.className).toContain('lg:h-full')
    expect(upcoming?.tagName).toBe('DIV')
    expect(upcoming?.getAttribute('data-calendar-upcoming-embedded')).toBe('true')
    expect(download?.getAttribute('data-calendar-pdf-embedded')).toBe('true')
    expect(download?.className).toContain('lg:mt-auto')
    expect(download?.className).toContain('border-t')
  })
})
