import { describe, expect, it } from 'vitest'

import { NewsEvents } from '@/collections/NewsEvents'
import { normalizeNewsEventFields } from '@/hooks/normalizeNewsEventFields'
import config from '@/payload.config'

const getTabs = (fields: unknown[]) => {
  const tabs = fields.find(
    (field) =>
      typeof field === 'object' && field !== null && 'type' in field && field.type === 'tabs',
  ) as { tabs?: Array<{ fields: unknown[]; label: string }> } | undefined

  return tabs?.tabs ?? []
}

const findNamedField = (value: unknown, name: string): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.name === name) return record

    for (const child of Object.values(record)) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  return undefined
}

describe('News & Events editorial model', () => {
  it('registers the typed collection without the retired archive settings global', async () => {
    const resolvedConfig = await config

    expect(resolvedConfig.collections?.map(({ slug }) => slug)).toContain('news-events')
    expect(resolvedConfig.globals?.map(({ slug }) => slug)).not.toContain('news-events-settings')
    expect(NewsEvents.versions).toBeTruthy()
    expect(
      typeof NewsEvents.versions === 'object' && NewsEvents.versions !== null
        ? 'drafts' in NewsEvents.versions
        : NewsEvents.versions === true,
    ).toBe(true)
  })

  it('organizes collection fields into clear tabs', () => {
    expect(getTabs(NewsEvents.fields).map(({ label }) => label)).toEqual([
      'Content',
      'Classification',
      'Event Details',
      'Presentation',
      'SEO',
      'Workflow',
    ])
  })

  it('uses one required seven-value entry classification', () => {
    expect(findNamedField(NewsEvents.fields, 'contentType')).toMatchObject({
      defaultValue: 'news',
      label: 'Entry Classification',
      options: [
        { label: 'News', value: 'news' },
        { label: 'Events', value: 'event' },
        { label: 'Notice', value: 'notice' },
        { label: 'Holiday', value: 'holiday' },
        { label: 'Achievements', value: 'achievement' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Others', value: 'other' },
      ],
      required: true,
      type: 'select',
    })
  })

  it('retains but hides the legacy per-entry Byline', () => {
    expect(findNamedField(NewsEvents.fields, 'authorName')?.admin).toMatchObject({ hidden: true })
    expect(NewsEvents.admin?.listSearchableFields).not.toContain('authorName')
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

  it.each(['notice', 'holiday', 'achievement', 'announcement', 'other'])(
    'clears event-only values for %s entries',
    async (contentType) => {
      const result = await normalizeNewsEventFields({
        data: {
          contentType,
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
    },
  )

  it('retains event-only values for Event entries', async () => {
    const data = {
      contentType: 'event',
      eventEnd: '2026-08-02T00:00:00.000Z',
      eventLocation: 'Campus',
      eventRegistrationAction: [{ label: 'Register' }],
      eventStart: '2026-08-01T00:00:00.000Z',
    }
    const result = await normalizeNewsEventFields({ data } as never)

    expect(result).toEqual(data)
  })
})
