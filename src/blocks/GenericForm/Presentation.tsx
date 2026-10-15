'use client'

import { GenericForm } from '@/components/revamp/generic-form'
import { FieldDescription, FieldError } from '@/components/revamp/ui/field'
import {
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'
import type { GenericFormDefinition } from '@/lib/genericFormShared'
import { uploadFormAttachment } from '@/lib/uploadFormAttachment'
import { submitGenericForm } from '@/lib/submitGenericForm'

export type GenericFormPresentationProps = {
  definition: GenericFormDefinition | null
  heading?: string | null
  description?: string | null
  size?: RegularBlockSize | null
  preview?: boolean
}

/** CMS/transport adapter around the reviewed upstream presentation. */
export function GenericFormBlockPresentation({
  definition,
  heading,
  description,
  size,
  preview = false,
}: GenericFormPresentationProps) {
  return (
    <section
      className={cn(
        'bg-background text-foreground',
        regularBlockMobilePaddingClasses[size ?? 'default'],
      )}
      data-generic-form-preview={preview || undefined}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-4 px-4">
        {preview && (
          <FieldDescription>
            Preview only — submissions are disabled. Publish the Form and Page to accept responses.
          </FieldDescription>
        )}
        {definition ? (
          <GenericForm
            key={definition.slug}
            heading={heading?.trim() ?? ''}
            description={description?.trim() || undefined}
            appearance={definition.appearance}
            entries={definition.entries}
            fields={definition.fields}
            revision={definition.revision}
            submitButtonLabel={definition.submitButtonLabel}
            protectRetries
            disabled={preview}
            onFileUpload={
              preview
                ? undefined
                : (file, field, revision, key, uploadID, signal, progress) =>
                    uploadFormAttachment(
                      definition.slug,
                      file,
                      field,
                      revision,
                      key,
                      uploadID,
                      signal,
                      progress,
                    )
            }
            onSubmit={(values, revision, submissionKey) =>
              preview
                ? Promise.resolve({
                    success: false,
                    message: 'Submissions are disabled in preview.',
                  })
                : submitGenericForm(definition.slug, values, revision, submissionKey)
            }
          />
        ) : (
          <FieldError>This form is unavailable. Please try another way to contact us.</FieldError>
        )}
      </div>
    </section>
  )
}
