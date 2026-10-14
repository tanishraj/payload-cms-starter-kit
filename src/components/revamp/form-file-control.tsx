'use client'

/** Source: @shadcnblocks/input-input-special-1, authenticated 2026-10-14.
 * Upload status/progress: @shadcnblocks/file-upload-file-upload-special-7.
 * Preserves native picker, bordered file rows, metadata and removal composition.
 * Integration: private-upload callbacks, real progress, abort/removal and explicit retry.
 */
import { FileText, X } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentProps, type Ref } from 'react'
import { Button } from '@/components/revamp/ui/button'
import { Input } from '@/components/revamp/ui/input'
import { Progress } from '@/components/revamp/ui/progress'
import { FieldDescription, FieldError } from '@/components/revamp/ui/field'
import {
  getClientFileError,
  getFormFileAccept,
  getFormFilePolicy,
  type FormFilePolicy,
  type UploadedFormFile,
} from '@/lib/formAttachments'

export type FormFileUpload = (
  file: File,
  uploadID: string,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
) => Promise<UploadedFormFile>
type Entry = {
  file: Pick<File, 'name' | 'size'>
  uploadID: string
  controller: AbortController
  progress: number
  error?: string
  token?: string
}
type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type' | 'multiple'> & {
  policy: FormFilePolicy
  value: UploadedFormFile[]
  onChange: (files: UploadedFormFile[]) => void
  onUpload: FormFileUpload
  onBlockedChange?: (blocked: boolean) => void
  controlRef?: Ref<HTMLInputElement>
}

export function FormFileControl({
  policy,
  value,
  onChange,
  onUpload,
  onBlockedChange,
  controlRef,
  disabled,
  ...inputProps
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const current = useRef({ value, onChange, onUpload, onBlockedChange })
  useEffect(() => {
    current.current = { value, onChange, onUpload, onBlockedChange }
  }, [value, onChange, onUpload, onBlockedChange])
  const active = useRef(new Map<string, Entry>())
  const publish = () => {
    const next = [...active.current.values()]
    setEntries(next)
    current.current.onBlockedChange?.(next.some((entry) => !entry.token))
  }
  useEffect(
    () => () => {
      for (const entry of active.current.values()) entry.controller.abort()
      active.current.clear()
      current.current.onBlockedChange?.(false)
    },
    [],
  )
  // Form refresh/removal is authoritative; do not silently re-add cleared tokens.
  useEffect(() => {
    for (const [id, entry] of active.current) {
      if (entry.token && !value.some((file) => file.token === entry.token))
        active.current.delete(id)
    }
  }, [value])
  const upload = async (entry: Entry) => {
    if (!(entry.file instanceof File)) return
    entry.error = undefined
    entry.progress = 0
    entry.controller = new AbortController()
    publish()
    try {
      const file = await current.current.onUpload(
        entry.file,
        entry.uploadID,
        entry.controller.signal,
        (progress) => {
          if (!active.current.has(entry.uploadID)) return
          entry.progress = Math.min(95, Math.max(0, Math.round(progress)))
          publish()
        },
      )
      if (!active.current.has(entry.uploadID)) return
      entry.token = file.token
      entry.progress = 100
      const next = [
        ...current.current.value.filter((existing) => existing.token !== file.token),
        file,
      ]
      current.current.value = next
      current.current.onChange(next)
    } catch (error) {
      if (!active.current.has(entry.uploadID)) return
      entry.error =
        error instanceof Error
          ? error.message
          : 'Upload could not be confirmed. Retry or remove this file.'
    }
    publish()
  }
  const remove = (entry: Entry) => {
    entry.controller.abort()
    active.current.delete(entry.uploadID)
    if (entry.token) {
      const next = current.current.value.filter((file) => file.token !== entry.token)
      current.current.value = next
      current.current.onChange(next)
    }
    publish()
  }
  const visible = [
    ...entries.filter((entry) => !entry.token || value.some((file) => file.token === entry.token)),
    ...value
      .filter((file) => !entries.some((entry) => entry.token === file.token))
      .map(
        (file) =>
          ({
            file: { name: file.filename, size: file.size },
            uploadID: file.token,
            token: file.token,
            controller: new AbortController(),
            progress: 100,
          }) as Entry,
      ),
  ]
  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        {...inputProps}
        ref={controlRef}
        type="file"
        className="bg-background"
        disabled={disabled}
        accept={getFormFileAccept(policy)}
        multiple={getFormFilePolicy(policy).maxFiles > 1}
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? [])
          event.target.value = ''
          setSelectionError(null)
          if (visible.length + selected.length > getFormFilePolicy(policy).maxFiles) {
            setSelectionError(
              `Choose no more than ${getFormFilePolicy(policy).maxFiles} files. Remove a file before adding another.`,
            )
            return
          }
          for (const file of selected) {
            const error = getClientFileError(file, policy)
            const entry: Entry = {
              file,
              uploadID: crypto.randomUUID(),
              controller: new AbortController(),
              progress: 0,
              error: error ?? undefined,
            }
            active.current.set(entry.uploadID, entry)
            if (!error) void upload(entry)
          }
          publish()
        }}
      />
      {selectionError && <FieldError role="alert">{selectionError}</FieldError>}
      {visible.map((entry) => (
        <div
          className="flex items-center justify-between gap-2 rounded-md border p-2"
          key={entry.uploadID}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate text-sm" title={entry.file.name}>
                {entry.file.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                ({(entry.file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            {!entry.token && !entry.error && (
              <Progress
                value={entry.progress}
                aria-label={`Uploading ${entry.file.name}`}
                className="h-1.5"
              />
            )}
            <FieldDescription role="status">
              {entry.token
                ? 'Uploaded — ready to send'
                : entry.error
                  ? entry.error
                  : `${entry.progress}% — uploading`}
            </FieldDescription>
            {entry.error && !getClientFileError(entry.file, policy) && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={disabled}
                onClick={() => void upload(entry)}
              >
                Retry {entry.file.name}
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            disabled={disabled}
            aria-label={`Remove ${entry.file.name}`}
            onClick={() => remove(entry)}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
