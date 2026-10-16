import type { FormSubmission } from '@/payload-types'

export const FORM_EXPORT_MAX_SUBMISSIONS = 1000
export const FORM_EXPORT_MAX_BYTES = 8 * 1024 * 1024
export const formExportColumns = [
  'submission_id',
  'submitted_at',
  'status',
  'form_id',
  'form_title',
  'form_slug',
  'form_revision',
  'history_source',
  'field_id',
  'field_name',
  'field_label',
  'field_type',
  'answer',
  'answer_json',
] as const

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/** Quote every cell and neutralize spreadsheet formulas, including whitespace-prefixed ones.
 * JSON answers are a separate column so arrays/booleans retain their submitted type. */
export const formExportCell = (value: string): string => {
  const safe = /^[\s\u0000-\u001f\u007f]*[=+@-]|^[\t\r\n]/u.test(value) ? `'${value}` : value
  return `"${safe.replaceAll('"', '""')}"`
}
export const formExportLine = (cells: string[]): string =>
  cells.map(formExportCell).join(',') + '\r\n'

/** Deliberately never resolve today's Form. Stored answer metadata is the historical authority.
 * Files export original filenames only; private tokens/URLs/bytes are never CSV data. */
export function* formSubmissionExportRows(submission: FormSubmission): Generator<string[]> {
  const snapshot = record(submission.formSnapshot) ? submission.formSnapshot : {}
  const form = submission.form
  const formID =
    typeof form === 'string' || typeof form === 'number' ? String(form) : text(snapshot.formID)
  const captured = Boolean(submission.answers?.length || snapshot.formatVersion === 1)
  const base = [
    String(submission.id),
    text(submission.submittedAt),
    text(submission.status),
    formID,
    text(snapshot.title),
    text(snapshot.slug),
    text(submission.formRevision),
    captured ? 'captured' : 'legacy_raw',
  ]
  if (captured) {
    if (!submission.answers?.length) {
      yield [...base, '', '', '', '', '', '']
      return
    }
    for (const answer of submission.answers) {
      const envelope = record(answer.value) ? answer.value : {}
      yield [
        ...base,
        text(answer.fieldID),
        text(answer.name),
        text(answer.label),
        text(answer.type),
        text(answer.displayValue),
        answer.type === 'file' ? '' : (JSON.stringify(envelope.raw) ?? ''),
      ]
    }
    return
  }
  // No backfill or invented labels/types for records that predate captured history.
  const data = record(submission.data) ? Object.entries(submission.data) : []
  if (!data.length) yield [...base, '', '', '', '', '', '']
  for (const [name, value] of data) {
    const json = JSON.stringify(value) ?? ''
    yield [...base, '', name, '', '', typeof value === 'string' ? value : json, json]
  }
}
