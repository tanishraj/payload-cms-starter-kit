import { describe, expect, it } from 'vitest'

import {
  buildFormNotificationEmail,
  buildSubmitterConfirmationEmail,
} from '@/lib/formNotifications'

const form = {
  fields: [
    { label: 'Email', name: 'email', required: true, type: 'email' },
    { label: 'Telephone', name: 'phone', required: false, type: 'phone' },
    {
      label: 'Topic',
      name: 'topic',
      options: [{ label: 'Admissions', value: 'admissions' }],
      required: false,
      type: 'select',
    },
  ],
  notificationRecipients: [],
  slug: 'contact',
  submitterReply: {
    enabled: true,
    message: 'We received your message.',
    subject: 'Message received',
  },
  title: 'Contact',
} as never

describe('form notification email', () => {
  it('uses site identity, timezone, display labels, and actionable contact links', () => {
    const email = buildFormNotificationEmail({
      form,
      siteName: 'Example Institute',
      submittedAt: new Date('2026-09-12T08:00:00.000Z'),
      timeZone: 'Asia/Dubai',
      values: { email: 'person@example.com', phone: '+971 50 123 4567', topic: 'admissions' },
    })
    expect(email.text).toContain('12 September 2026 at 12:00 pm')
    expect(email.text).toContain('Topic: Admissions')
    expect(email.html).toContain('Example Institute')
    expect(email.html).toContain('mailto:person@example.com')
    expect(email.html).toContain('tel:+971501234567')
    expect(email.html).not.toContain('SNMIH')
  })

  it('brands submitter confirmations with the supplied site identity', () => {
    const email = buildSubmitterConfirmationEmail({
      form,
      siteName: 'Example Institute',
      submitterName: 'Sam',
    })
    expect(email.html).toContain('Example Institute')
    expect(email.html).toContain('Hi Sam,')
    expect(email.text).toContain('We received your message.')
  })
})

it('formats multiple original choice labels and escapes their HTML', () => {
  const email = buildFormNotificationEmail({
    form: {
      fields: [
        {
          name: 'topics',
          label: 'Interests',
          type: 'multiSelect',
          options: [
            { label: '<script>Alpha</script>', value: 'alpha' },
            { label: 'Beta & Gamma', value: 'beta' },
          ],
        },
      ],
      title: 'Choices',
      slug: 'choices',
    } as never,
    siteName: 'Example',
    submittedAt: new Date('2026-10-14T00:00:00.000Z'),
    values: { topics: ['alpha', 'beta'] },
  })
  expect(email.text).toContain('Interests: <script>Alpha</script>; Beta & Gamma')
  expect(email.html).toContain('&lt;script&gt;Alpha&lt;/script&gt;; Beta &amp; Gamma')
  expect(email.html).not.toContain('<script>')
})

it('keeps Date/Time local values and Switch meaning in notifications without contact links', () => {
  const email = buildFormNotificationEmail({
    form: {
      title: 'Visits',
      slug: 'visits',
      fields: [
        { name: 'email', label: 'Day', type: 'date' },
        { name: 'phone', label: 'Time', type: 'time' },
        { name: 'reminder', label: 'Reminder', type: 'switch' },
      ],
    } as never,
    siteName: 'Example',
    submittedAt: new Date('2026-10-14T00:00:00.000Z'),
    values: { email: '2026-10-22', phone: '10:30', reminder: false },
  })
  expect(email.text).toContain('Day: 2026-10-22')
  expect(email.text).toContain('Time: 10:30')
  expect(email.text).toContain('Reminder: No')
  expect(email.html).not.toContain('mailto:')
  expect(email.html).not.toContain('tel:')
})
