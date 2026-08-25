import type { Field, UploadField } from 'payload'

export const DEFAULT_CALENDAR_PDF_LABEL = 'Download'
export const DEFAULT_CALENDAR_PDF_TITLE = 'Academic calendar PDF'

export const createCalendarPdfFields = (): Field[] => [
  {
    name: 'calendarPdf',
    label: 'Calendar PDF',
    type: 'upload',
    relationTo: 'media',
    filterOptions: { mimeType: { equals: 'application/pdf' } },
    admin: { description: 'Optional PDF shown as a download below Upcoming.' },
  } satisfies UploadField,
  {
    name: 'calendarPdfTitle',
    label: 'PDF Document Label',
    type: 'text',
    defaultValue: DEFAULT_CALENDAR_PDF_TITLE,
    admin: { condition: (_data, siblingData) => Boolean(siblingData?.calendarPdf) },
  },
  {
    name: 'calendarPdfLabel',
    label: 'PDF Button Label',
    type: 'text',
    defaultValue: DEFAULT_CALENDAR_PDF_LABEL,
    admin: { condition: (_data, siblingData) => Boolean(siblingData?.calendarPdf) },
  },
]
