import fs from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { GlobalAnnouncement } from '@/components/global/GlobalAnnouncement'
import { PageSettings } from '@/globals/PageSettings'

describe('global announcement settings', () => {
  it('keeps announcement fields inside Website Defaults instead of a separate global', () => {
    const payloadConfigSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/payload.config.ts'),
      'utf8',
    )

    expect(payloadConfigSource).not.toContain("import { AnnouncementSettings } from './globals/AnnouncementSettings'")
    expect(payloadConfigSource).not.toContain('AnnouncementSettings,')
  })

  it('defines the announcement schema inside Website Defaults', () => {
    expect(PageSettings.slug).toBe('page-settings')

    const tabsField = PageSettings.fields.find(
      (field) => typeof field === 'object' && field !== null && 'tabs' in field,
    ) as { tabs: Array<{ label: string; fields: unknown[] }> } | undefined
    const announcementTab = tabsField?.tabs.find((tab) => tab.label === 'Announcement')
    const enabledField = announcementTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'announcementEnabled',
    ) as { defaultValue?: boolean; type?: string } | undefined
    const labelField = announcementTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'announcementLabel',
    ) as { label?: string; type?: string } | undefined
    const displayModeField = announcementTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'announcementDisplayMode',
    ) as { defaultValue?: string; label?: string; options?: Array<{ value: string }>; type?: string } | undefined
    const intervalField = announcementTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'announcementIntervalMs',
    ) as { defaultValue?: number; min?: number; type?: string } | undefined
    const marqueeDurationField = announcementTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'announcementMarqueeDurationMs',
    ) as { defaultValue?: number; type?: string } | undefined
    const itemsField = announcementTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'announcementItems',
    ) as { minRows?: number; type?: string } | undefined

    expect(enabledField?.type).toBe('checkbox')
    expect(enabledField?.defaultValue).toBe(false)
    expect(labelField?.type).toBe('text')
    expect(labelField?.label).toBe('Announcement Label')
    expect(displayModeField?.type).toBe('select')
    expect(displayModeField?.label).toBe('Animation Mode')
    expect(displayModeField?.defaultValue).toBe('vertical')
    expect(displayModeField?.options?.map((option) => option.value)).toEqual([
      'vertical',
      'horizontal',
      'marquee',
    ])
    expect(intervalField?.type).toBe('number')
    expect(intervalField?.defaultValue).toBe(4000)
    expect(intervalField?.min).toBeUndefined()
    expect(marqueeDurationField?.type).toBe('number')
    expect(marqueeDurationField?.defaultValue).toBe(18000)
    expect(itemsField?.type).toBe('array')
    expect(itemsField?.minRows).toBe(1)
  })

  it('renders nothing when no valid global announcement items are available', () => {
    expect(renderToStaticMarkup(createElement(GlobalAnnouncement, { items: null }))).toBe('')
    expect(
      renderToStaticMarkup(
        createElement(GlobalAnnouncement, {
          items: [{ title: '   ', description: '   ' }],
        }),
      ),
    ).toBe('')
  })

  it('renders the announcement icon, optional title, and item description', () => {
    const html = renderToStaticMarkup(
      createElement(GlobalAnnouncement, {
        displayMode: 'horizontal',
        intervalMs: 4000,
        items: [{ title: 'Maintenance', description: 'Scheduled tonight at 10:00 PM.' }],
        label: 'Important',
      }),
    )

    expect(html).toContain('lucide-megaphone')
    expect(html).toContain('Important')
    expect(html).toContain('Maintenance')
    expect(html).toContain('Scheduled tonight at 10:00 PM.')
    expect(html).toContain('bg-primary')
    expect(html).toContain('text-primary-foreground')
  })

  it('renders a linked description and does not require a title', () => {
    const html = renderToStaticMarkup(
      createElement(GlobalAnnouncement, {
        intervalMs: 4000,
        items: [{ description: 'Read update', url: '/updates' }],
      }),
    )

    expect(html).not.toContain('—')
    expect(html).toContain('href="/updates"')
    expect(html).toContain('Read update')
  })

  it('renders the global announcement as sticky with the provided toolbar offset', () => {
    const html = renderToStaticMarkup(
      createElement(GlobalAnnouncement, {
        intervalMs: 4000,
        items: [{ title: 'Maintenance', description: 'Scheduled tonight at 10:00 PM.' }],
        stickyTopOffset: '3rem',
      }),
    )

    expect(html).toContain('position:sticky')
    expect(html).toContain('top:3rem')
  })

  it('wires the frontend layout to fetch and render the announcement global', () => {
    const layoutSource = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(frontend)/layout.tsx'), 'utf8')

    expect(layoutSource).toContain("import { GlobalAnnouncement } from '@/components/global/GlobalAnnouncement'")
    expect(layoutSource).toContain("slug: 'page-settings'")
    expect(layoutSource).toContain('<GlobalAnnouncement')
    expect(layoutSource).toContain('const announcementDisplayMode = pageSettings?.announcementEnabled')
    expect(layoutSource).toContain('const announcementIntervalMs = pageSettings?.announcementEnabled')
    expect(layoutSource).toContain('const announcementLabel = pageSettings?.announcementEnabled')
    expect(layoutSource).toContain('const announcementMarqueeDurationMs = pageSettings?.announcementEnabled')
    expect(layoutSource).toContain('const announcementItems = pageSettings?.announcementEnabled')
    expect(layoutSource).toContain('displayMode={announcementDisplayMode}')
    expect(layoutSource).toContain('intervalMs={announcementIntervalMs}')
    expect(layoutSource).toContain('items={announcementItems}')
    expect(layoutSource).toContain('label={announcementLabel}')
    expect(layoutSource).toContain('marqueeDurationMs={announcementMarqueeDurationMs}')
    expect(layoutSource).toContain('stickyTopOffset={cmsToolbarOffset}')
  })
})
