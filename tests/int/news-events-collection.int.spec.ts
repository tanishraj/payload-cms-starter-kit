import { describe, expect, it } from 'vitest'

import { NewsEvents } from '@/collections/NewsEvents'
import { NewsEventsSettings } from '@/globals/NewsEventsSettings'
import { normalizeNewsEventFields } from '@/hooks/normalizeNewsEventFields'
import config from '@/payload.config'

const getTabs = (fields: unknown[]) => {
  const tabs = fields.find(
    (field) =>
      typeof field === 'object' && field !== null && 'type' in field && field.type === 'tabs',
  ) as { tabs?: Array<{ fields: unknown[]; label: string }> } | undefined

  return tabs?.tabs ?? []
}

describe('News & Events editorial model', () => {
  it('registers the typed collection and settings global', async () => {
    const resolvedConfig = await config

    expect(resolvedConfig.collections?.map(({ slug }) => slug)).toContain('news-events')
    expect(resolvedConfig.globals?.map(({ slug }) => slug)).toContain('news-events-settings')
    expect(NewsEvents.versions).toBeTruthy()
    expect(
      typeof NewsEvents.versions === 'object' && NewsEvents.versions !== null
        ? 'drafts' in NewsEvents.versions
        : NewsEvents.versions === true,
    ).toBe(true)
  })

  it('organizes collection and global fields into clear tabs', () => {
    expect(getTabs(NewsEvents.fields).map(({ label }) => label)).toEqual([
      'Content',
      'Classification',
      'Event Details',
      'Presentation',
      'SEO',
      'Workflow',
    ])
    expect(getTabs(NewsEventsSettings.fields).map(({ label }) => label)).toEqual([
      'Content',
      'Layout & Theme',
      'SEO',
    ])
  })

  it('clears event-only values when an entry changes to News', async () => {
    const result = await normalizeNewsEventFields({
      data: {
        contentType: 'news',
        eventEnd: '2026-08-02T00:00:00.000Z',
        eventLocation: 'Campus',
        eventRegistrationAction: [{ label: 'Register' }],
        eventStart: '2026-08-01T00:00:00.000Z',
      },
    } as never)

    expect(result).toMatchObject({
      eventEnd: null,
      eventLocation: null,
      eventRegistrationAction: [],
      eventStart: null,
    })
  })
})
