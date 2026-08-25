import { Download, FileText } from 'lucide-react'

import { resolveCalendarSurfaceClasses } from '@/blocks/Calendar/calendarStyles'
import type { BlockSurface } from '@/blocks/shared/blockAppearance'
import type { ResolvedCalendarPdf } from '@/blocks/shared/calendarPdf'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CalendarPdfDownloadProps = {
  download: ResolvedCalendarPdf
  embedded?: boolean
  surface?: BlockSurface
}

export function CalendarPdfDownload({
  download,
  embedded = false,
  surface = 'light',
}: CalendarPdfDownloadProps) {
  const styles = resolveCalendarSurfaceClasses(surface)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-4 p-5',
        embedded ? cn('border-t lg:mt-auto', styles.border) : styles.panel,
      )}
      data-calendar-pdf-download="true"
      data-calendar-pdf-embedded={embedded ? 'true' : undefined}
    >
      <div className="flex min-w-0 items-start gap-3">
        <FileText
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0"
          data-calendar-pdf-icon="true"
        />
        <p className="min-w-0 break-words font-semibold" data-calendar-pdf-title="true">
          {download.title}
        </p>
      </div>
      <Button
        asChild
        className="w-full"
        variant={surface === 'brand' ? 'whiteOutline' : 'outline'}
      >
        <a download={download.filename || true} href={download.href}>
          <Download aria-hidden="true" data-icon="inline-start" />
          {download.label}
        </a>
      </Button>
    </div>
  )
}
