import {
  DEFAULT_CALENDAR_PDF_LABEL,
  DEFAULT_CALENDAR_PDF_TITLE,
} from '@/blocks/shared/calendarPdfFields'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'

export type ResolvedCalendarPdf = {
  filename?: string
  href: string
  label: string
  title: string
}

export function resolveCalendarPdf(
  media: string | number | Media | null | undefined,
  title?: string | null,
  label?: string | null,
): ResolvedCalendarPdf | undefined {
  if (!isMediaDoc(media) || media.mimeType?.toLowerCase() !== 'application/pdf') return undefined

  const href = getMediaAbsoluteUrl(media)
  if (!href) return undefined

  return {
    filename: media.filename?.trim() || undefined,
    href,
    label: label?.trim() || DEFAULT_CALENDAR_PDF_LABEL,
    title: title?.trim() || DEFAULT_CALENDAR_PDF_TITLE,
  }
}
