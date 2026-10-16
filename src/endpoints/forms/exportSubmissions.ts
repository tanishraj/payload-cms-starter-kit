import type { PayloadRequest, Where } from 'payload'
import { mergeListSearchAndWhere, validOperators } from 'payload/shared'
import { hasFeature } from '@/access/featureAccess'
import {
  FORM_EXPORT_MAX_BYTES,
  FORM_EXPORT_MAX_SUBMISSIONS,
  formExportColumns,
  formExportLine,
  formSubmissionExportRows,
} from '@/lib/formSubmissionExport'

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
const error = (message: string, status: number) => Response.json({ message }, { status, headers })

/** Only standard native inbox filters/search are accepted. Payload validates field paths,
 * operators and read access. Bound nesting/size before passing any user query to it. */
function parseFilter(value: unknown): Where {
  if (value === undefined || value === '') return {}
  if (typeof value !== 'string' || value.length > 12_000) throw new Error('filter')
  const parsed: unknown = JSON.parse(value)
  let nodes = 0
  const check = (item: unknown, depth: number): void => {
    if (++nodes > 500 || depth > 12) throw new Error('filter')
    if (item && typeof item === 'object') {
      for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key) || key.startsWith('$'))
          throw new Error('filter')
        check(child, depth + 1)
      }
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('filter')
  check(parsed, 0)
  const validateWhere = (item: unknown): void => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('filter')
    for (const [path, constraint] of Object.entries(item)) {
      if (['and', 'or'].includes(path.toLowerCase())) {
        if (!Array.isArray(constraint)) throw new Error('filter')
        constraint.forEach(validateWhere)
      } else {
        if (!constraint || typeof constraint !== 'object' || Array.isArray(constraint))
          throw new Error('filter')
        const operators = Object.keys(constraint)
        if (
          !operators.length ||
          operators.some((key) => !validOperators.some((operator) => operator === key))
        )
          throw new Error('filter')
      }
    }
  }
  // Payload ignores some structurally empty constraints. Do not silently widen an export.
  validateWhere(parsed)
  return parsed as Where
}

export async function exportFormSubmissions(req: PayloadRequest): Promise<Response> {
  if (!req.user) return error('Sign in to export submissions.', 401)
  // Reviews dependency/Forms placement access does not grant inbox export access.
  if (!hasFeature(req.user, 'formSubmissions'))
    return error('Submission inbox access is required.', 403)
  let where: Where
  try {
    const search = req.query.search ?? ''
    if (typeof search !== 'string' || search.length > 500) throw new Error('search')
    where = mergeListSearchAndWhere({
      collectionConfig: req.payload.collections['form-submissions'].config,
      search,
      where: parseFilter(req.query.filter),
    })
  } catch {
    return error('These export filters are invalid. Reset the inbox filters and try again.', 400)
  }
  const cutoff = new Date().toISOString()
  const chunks = ['\ufeff' + formExportLine([...formExportColumns])]
  let byteLength = Buffer.byteLength(chunks[0])
  let count = 0
  let cursor: string | undefined
  try {
    while (true) {
      const result = await req.payload.find({
        collection: 'form-submissions',
        req,
        user: req.user,
        overrideAccess: false,
        depth: 0,
        pagination: false,
        limit: 100,
        sort: 'id',
        where: {
          and: [
            where,
            { createdAt: { less_than_equal: cutoff } },
            ...(cursor ? [{ id: { greater_than: cursor } }] : []),
          ],
        },
        select: {
          id: true,
          form: true,
          submittedAt: true,
          status: true,
          formRevision: true,
          formSnapshot: true,
          answers: true,
          data: true,
        },
      })
      for (const submission of result.docs) {
        if (++count > FORM_EXPORT_MAX_SUBMISSIONS)
          return error(
            'This export exceeds 1,000 submissions. Narrow the inbox filters and try again.',
            413,
          )
        for (const row of formSubmissionExportRows(submission)) {
          const line = formExportLine(row)
          byteLength += Buffer.byteLength(line)
          if (byteLength > FORM_EXPORT_MAX_BYTES)
            return error('This export exceeds 8 MiB. Narrow the inbox filters and try again.', 413)
          chunks.push(line)
        }
      }
      if (result.docs.length < 100) break
      cursor = String(result.docs[result.docs.length - 1].id)
    }
  } catch (cause) {
    // Query validation failures are recoverable; never return raw database details or a partial CSV.
    const status = (cause as { status?: number })?.status
    if (status === 400)
      return error('These export filters are invalid. Reset the inbox filters and try again.', 400)
    if (status === 401 || status === 403)
      return error('Submission export is no longer permitted.', 403)
    req.payload.logger.error({ err: cause }, 'Form submission export failed')
    return error('Export could not be completed. Try again.', 500)
  }
  return new Response(chunks.join(''), {
    headers: {
      ...headers,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="form-answers-${cutoff.slice(0, 10)}.csv"`,
      'X-Submission-Count': String(count),
    },
  })
}
