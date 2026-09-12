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
