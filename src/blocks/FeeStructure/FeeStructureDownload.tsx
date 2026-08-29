import { Download, FileText } from 'lucide-react'

import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import { Button, buttonVariants } from '@/components/ui/button'
import type { CmsActionVariant } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

import type { FeeStructureDownloadButtonVariant, ResolvedFeeStructureDownload } from './types'

const downloadButtonVariants = new Set<CmsActionVariant>([
  'default',
  'primary',
  'secondary',
  'outline',
  'white',
  'whiteOutline',
])

export const resolveDownloadButtonVariant = (
  value?: FeeStructureDownloadButtonVariant | null,
): FeeStructureDownloadButtonVariant =>
  downloadButtonVariants.has(value as CmsActionVariant)
    ? (value as FeeStructureDownloadButtonVariant)
    : 'outline'

export function FeeStructureDownload({ download }: { download: ResolvedFeeStructureDownload }) {
  const appearance = resolveBlockAppearanceClasses(download.appearance)
  const surface = appearance.background === 'none' ? download.sectionBackground : appearance.surface

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-card border border-current/15 p-5 sm:flex-row sm:items-center sm:justify-between',
        appearance.className,
      )}
      data-fee-document="true"
      data-fee-download-background={appearance.background}
    >
      <div className="flex items-center gap-3">
        <FileText aria-hidden="true" className="size-5" />
        <p className="font-semibold">Official fee structure</p>
      </div>
      {download.mode === 'link' ? (
        <a
          className={cn(
            buttonVariants({ variant: 'link' }),
            'group/button h-auto gap-2 px-0 py-0 text-sm font-semibold text-current no-underline hover:text-current/80 hover:no-underline',
          )}
          data-fee-download-mode="link"
          download
          href={download.url}
        >
          <span className="underline decoration-current decoration-2 underline-offset-4">
            {download.label}
          </span>
          <Download aria-hidden="true" data-icon="inline-end" />
        </a>
      ) : (
        <Button
          asChild
          className={cn(
            surface === 'brand' &&
              download.buttonVariant === 'outline' &&
              'border-current/70 text-current hover:border-current hover:bg-current/10',
          )}
          variant={download.buttonVariant}
        >
          <a data-fee-download-mode="button" download href={download.url}>
            <Download aria-hidden="true" data-icon="inline-start" />
            {download.label}
          </a>
        </Button>
      )}
    </div>
  )
}
