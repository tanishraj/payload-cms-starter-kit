'use client'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import { Button } from '@/components/revamp/ui/button'
import { isUploadToken } from '@/lib/formAttachments'
/** Source dependency: Button from @shadcnblocks/input-input-special-1.
 * Native Payload field integration only; every click rechecks submission access. */
export function FormAttachmentDownload({ path }: { path: string }) {
  const { value } = useField<string>({ path })
  const { id } = useDocumentInfo()
  if (!id || !isUploadToken(value)) return null
  return (
    <Button
      asChild
      variant="outline"
      className="btn btn--style-secondary btn--size-small btn--no-margin btn--withoutPopup"
    >
      <a href={`/api/form-submissions/${encodeURIComponent(String(id))}/attachments/${value}`}>
        <span className="btn__content">
          <span className="btn__label">Download file</span>
        </span>
      </a>
    </Button>
  )
}
