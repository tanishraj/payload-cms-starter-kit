// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import type { FormSubmission } from '@/payload-types'
import { exportFormSubmissions } from '@/endpoints/forms/exportSubmissions'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import {
  formExportCell,
  formExportLine,
  formSubmissionExportRows,
} from '@/lib/formSubmissionExport'

const captured = buildFormSubmissionSnapshot(
  {
    id: 'original-form',
    title: 'Original form',
    slug: 'enquiry',
    fields: [
      {
        id: 'question-a',
        name: 'department',
        label: 'Original department',
        type: 'select',
        options: [{ label: 'Admissions', value: 'admissions' }],
      },
      { id: 'question-b', name: 'consent', label: 'Consent', type: 'checkbox' },
      { id: 'question-c', name: 'documents', label: 'Documents', type: 'file' },
    ],
  },
  { department: 'admissions', consent: false, documents: ['private-upload-token'] },
  [
    {
      fieldName: 'documents',
      filename: 'résumé.pdf',
      token: 'private-upload-token',
    },
  ],
)
const submission = {
  id: 'submission-1',
  form: 'original-form',
  status: 'new',
  submittedAt: '2026-10-16T00:00:00.000Z',
  data: { secret: 'must-not-fallback' },
  internalNotes: 'staff-only-note',
  ...captured,
} as unknown as FormSubmission

function request(
  docs: FormSubmission[] = [submission],
  user: unknown = { role: 'admin' },
  query = {},
) {
  const find = vi.fn().mockResolvedValue({ docs })
  const req = {
    user,
    query,
    payload: {
      find,
      collections: {
        'form-submissions': {
          config: { admin: { listSearchableFields: ['submitterEmail', 'source'] } },
        },
      },
      logger: { error: vi.fn() },
    },
  } as unknown as PayloadRequest
  return { req, find }
}

describe('historical form CSV', () => {
  it('preserves original identity, labels, option meaning, booleans and revision without reading a live Form', () => {
    const rows = [...formSubmissionExportRows(submission)]
    expect(rows[0].slice(3)).toEqual([
      'original-form',
      'Original form',
      'enquiry',
      captured.formRevision,
      'captured',
      'question-a',
      'department',
      'Original department',
      'select',
      'Admissions',
      '"admissions"',
    ])
    expect(rows[1].slice(-2)).toEqual(['No', 'false'])
    expect(rows[2].slice(-2)).toEqual(['résumé.pdf', ''])
    expect(rows.flat().join()).not.toContain('private-upload-token')
    expect(rows.flat().join()).not.toContain('staff-only-note')
    expect(rows.flat().join()).not.toContain('must-not-fallback')
  })
  it('does not invent current labels or types for legacy data; distinguishes an intentionally empty captured submission', () => {
    const legacy = {
      ...submission,
      formSnapshot: null,
      formRevision: null,
      answers: null,
      data: { custom: 'Old answer', checked: true, multiple: ['a', 'b'] },
    }
    const rows = [...formSubmissionExportRows(legacy)]
    expect(rows[0].slice(4)).toEqual([
      '',
      '',
      '',
      'legacy_raw',
      '',
      'custom',
      '',
      '',
      'Old answer',
      '"Old answer"',
    ])
    expect(rows[2].slice(-2)).toEqual(['["a","b"]', '["a","b"]'])
    expect([...formSubmissionExportRows({ ...submission, answers: [] })]).toHaveLength(1)
    expect([...formSubmissionExportRows({ ...submission, form: null } as never)][0][3]).toBe(
      'original-form',
    )
  })
  it.each(['=1+1', '+cmd', '-1', '@SUM(A1)', '  =cmd', '\t=cmd', '\r\n@cmd', '\u0000=cmd'])(
    'neutralizes spreadsheet formulas %j',
    (value) => {
      expect(formExportCell(value)).toBe(`"'${value}"`)
    },
  )
  it('quotes commas, quotes, CRLF and Unicode without losing cell boundaries', () => {
    expect(formExportLine(['a,b', '"Quoted"', 'one\r\ntwo', 'Café'])).toBe(
      '"a,b","""Quoted""","one\r\ntwo","Café"\r\n',
    )
  })
  it.each([
    null,
    { role: 'siteManager', features: { forms: true } },
    { role: 'siteManager', features: { reviews: true } },
  ])('denies unauthenticated and dependency-only users before querying: %j', async (user) => {
    const { req, find } = request([], user)
    const response = await exportFormSubmissions(req)
    expect(response.status).toBe(user ? 403 : 401)
    expect(find).not.toHaveBeenCalled()
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
  it('enforces native read access with the same request/user and merges search with filters', async () => {
    const { req, find } = request(
      [submission],
      { role: 'siteManager', features: { formSubmissions: true } },
      {
        search: 'admissions',
        filter: JSON.stringify({ status: { equals: 'new' } }),
      },
    )
    const response = await exportFormSubmissions(req)
    expect(response.status).toBe(200)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        req,
        user: req.user,
        overrideAccess: false,
        depth: 0,
        limit: 100,
        pagination: false,
        sort: 'id',
        where: {
          and: [
            {
              and: [
                { status: { equals: 'new' } },
                {
                  or: [
                    { submitterEmail: { like: 'admissions' } },
                    { source: { like: 'admissions' } },
                  ],
                },
              ],
            },
            { createdAt: { less_than_equal: expect.any(String) } },
          ],
        },
      }),
    )
    expect(response.headers.get('x-submission-count')).toBe('1')
    const csv = await response.text()
    expect(csv).toContain('"answer_json"')
    expect(csv).toContain('"Admissions"')
    expect(csv).not.toContain('private-upload-token')
  })
  it.each([
    '{',
    'null',
    '[]',
    '{"__proto__":{}}',
    '{"$where":"bad"}',
    '{"status":null}',
    '{"status":{}}',
    '{"status":"new"}',
    '{"and":"invalid"}',
    '{"status":{"invalid":"new"}}',
    'x'.repeat(12001),
  ])('rejects invalid/unsafe/bounded filter input', async (filter) => {
    const { req, find } = request([], undefined, { filter })
    expect((await exportFormSubmissions(req)).status).toBe(400)
    expect(find).not.toHaveBeenCalled()
  })
  it('returns header-only CSV for no matches', async () => {
    const { req } = request([])
    const response = await exportFormSubmissions(req)
    expect(response.headers.get('x-submission-count')).toBe('0')
    expect((await response.text()).split('\r\n')).toHaveLength(2)
  })
  it('uses cursor pages to include more than the visible page, without accepting page/limit overrides', async () => {
    const { req, find } = request([], undefined, { page: '10', limit: '1', trash: true })
    const docs = Array.from({ length: 100 }, (_, i) => ({
      ...submission,
      id: String(i).padStart(24, '0'),
    }))
    find.mockResolvedValueOnce({ docs }).mockResolvedValueOnce({ docs: [submission] })
    const response = await exportFormSubmissions(req)
    expect(response.headers.get('x-submission-count')).toBe('101')
    expect(find.mock.calls[1][0].where.and.at(-1)).toEqual({
      id: { greater_than: docs.at(-1)!.id },
    })
  })
  it('fails with no partial download when row or byte limits are exceeded', async () => {
    const { req, find } = request(Array.from({ length: 100 }, () => submission))
    const limited = await exportFormSubmissions(req)
    expect(limited.status).toBe(413)
    expect(find).toHaveBeenCalledTimes(11)
    expect(limited.headers.get('content-disposition')).toBeNull()
    const large = request([
      {
        ...submission,
        answers: [{ ...submission.answers![0], displayValue: 'a'.repeat(8 * 1024 * 1024) }],
      },
    ])
    expect((await exportFormSubmissions(large.req)).status).toBe(413)
  })
  it('does not return partial CSV or database details on a failed page', async () => {
    const { req, find } = request()
    find.mockRejectedValue(new Error('private connection string'))
    const response = await exportFormSubmissions(req)
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('private connection string')
  })
})
