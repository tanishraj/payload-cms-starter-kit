import configPromise from '@payload-config'
import { getPayload } from 'payload'

import {
  CALENDAR_MAX_CLASSIFICATIONS,
  type CalendarMonthSnapshot,
} from '@/blocks/Calendar/calendarShared'
import {
  CalendarScopeError,
  getDraftCalendarMonth,
  getPublicCalendarMonth,
} from '@/lib/calendarEvents'
import { parseZonedMonthKey } from '@/lib/siteTimeZone'

type ParsedCalendarRequest =
  | { classificationIDs: string[]; draft: boolean; monthKey: string; ok: true }
  | { message: string; ok: false }

const calendarIDPattern = /^[A-Za-z0-9:_-]{1,128}$/

export const parseCalendarRequest = (searchParams: URLSearchParams): ParsedCalendarRequest => {
  const monthValues = searchParams.getAll('month')
  const classificationValues = searchParams.getAll('classifications')
  const draftValues = searchParams.getAll('draft')

  if (monthValues.length !== 1 || !parseZonedMonthKey(monthValues[0] ?? '')) {
    return { message: 'Month must use YYYY-MM.', ok: false }
  }
  if (classificationValues.length !== 1 || !classificationValues[0]?.trim()) {
    return { message: 'One to five classifications are required.', ok: false }
  }
  if (draftValues.length > 1 || (draftValues.length === 1 && draftValues[0] !== 'true')) {
    return { message: 'Draft must be omitted or set to true.', ok: false }
  }

  const classificationIDs = classificationValues[0].split(',').map((id) => id.trim())
  if (
    classificationIDs.length < 1 ||
    classificationIDs.length > CALENDAR_MAX_CLASSIFICATIONS ||
    classificationIDs.some((id) => !calendarIDPattern.test(id)) ||
    new Set(classificationIDs).size !== classificationIDs.length
  ) {
    return { message: 'Classification scope is invalid.', ok: false }
  }

  return {
    classificationIDs,
    draft: draftValues[0] === 'true',
    monthKey: monthValues[0],
    ok: true,
  }
}

const errorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') return undefined
  const status =
    (error as { status?: unknown; statusCode?: unknown }).statusCode ??
    (error as { status?: unknown }).status
  return typeof status === 'number' ? status : undefined
}

export async function GET(request: Request): Promise<Response> {
  const parsed = parseCalendarRequest(new URL(request.url).searchParams)
  if (!parsed.ok) return Response.json({ message: parsed.message }, { status: 400 })

  try {
    let snapshot: CalendarMonthSnapshot
    if (!parsed.draft) {
      snapshot = await getPublicCalendarMonth(parsed.classificationIDs, parsed.monthKey)
    } else {
      const payload = await getPayload({ config: configPromise })
      const { user } = await payload.auth({
        canSetHeaders: false,
        headers: new Headers(request.headers),
      })
      if (!user) return Response.json({ message: 'Authentication required.' }, { status: 401 })
      snapshot = await getDraftCalendarMonth(parsed.classificationIDs, parsed.monthKey, user)
    }

    return Response.json(snapshot, {
      headers: { 'Cache-Control': parsed.draft ? 'private, no-store' : 'public, max-age=60' },
    })
  } catch (error) {
    if (error instanceof CalendarScopeError) {
      return Response.json({ message: error.message }, { status: 400 })
    }
    if (parsed.draft && (errorStatus(error) === 401 || errorStatus(error) === 403)) {
      return Response.json({ message: 'You do not have access to this Calendar.' }, { status: 403 })
    }
    return Response.json(
      { message: 'Calendar events are temporarily unavailable.' },
      { status: 500 },
    )
  }
}
