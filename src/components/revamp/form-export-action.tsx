'use client'

import { Button } from '@/components/revamp/ui/button'

/** Existing Button dependency from authenticated @shadcnblocks/input-input-special-1.
 * Keep the upstream presentation; callers own filtering, permissions and downloads. */
export function FormExportAction({
  pending = false,
  disabled = false,
  onExport,
  className,
}: {
  pending?: boolean
  disabled?: boolean
  onExport: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={onExport}
      className={className}
    >
      {pending ? 'Preparing CSV…' : 'Export answers (CSV)'}
    </Button>
  )
}
