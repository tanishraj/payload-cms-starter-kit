import type { Form } from '@/payload-types'

const escapeHTML = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const formatSubmissionValue = (value: boolean | string): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return value || '—'
}

export const getNotificationRecipients = (form: Form): string[] => {
  return (form.notificationRecipients ?? [])
    .map((recipient) => recipient.email?.trim())
    .filter((email): email is string => Boolean(email))
}

export const buildFormNotificationEmail = ({
  form,
  submittedAt,
  values,
}: {
  form: Form
  submittedAt: Date
  values: Record<string, boolean | string>
}) => {
  const subject = `New submission: ${form.title}`
  const lines = (form.fields ?? []).map((field) => {
    return `${field.label}: ${formatSubmissionValue(values[field.name] ?? '')}`
  })

  const text = [
    `A new submission was received for "${form.title}".`,
    '',
    `Submitted at: ${submittedAt.toISOString()}`,
    '',
    ...lines,
  ].join('\n')

  const html = `
    <div>
      <p>A new submission was received for "<strong>${escapeHTML(form.title)}</strong>".</p>
      <p><strong>Submitted at:</strong> ${escapeHTML(submittedAt.toISOString())}</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tbody>
          ${lines
            .map((line) => {
              const [label, ...rest] = line.split(': ')
              return `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: 600; width: 35%;">${escapeHTML(label)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${escapeHTML(rest.join(': '))}</td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `.trim()

  return {
    html,
    subject,
    text,
  }
}
