'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/revamp/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/revamp/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/revamp/ui/select'
import './page-section-select.css'

export type PageSectionOption = { id: string; label: string }
export type PageSectionSelectProps = {
  options: PageSectionOption[]
  value: string
  status: 'loading' | 'ready' | 'empty' | 'error'
  disabled?: boolean
  invalid?: boolean
  onChange: (value: string) => void
  onRetry: () => void
}

/** Sources: authenticated @shadcnblocks/field-field-selects-2 and
 * @shadcnblocks/select-select-full-width. Callers own access, loading and draft creation. */
export function PageSectionSelect({
  options,
  value,
  status,
  disabled = false,
  invalid = false,
  onChange,
  onRetry,
}: PageSectionSelectProps) {
  const id = useId()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const unavailable = disabled || status !== 'ready'
  const description =
    status === 'loading'
      ? 'Loading your available website sections…'
      : status === 'error'
        ? 'Website sections could not be loaded. Try again; your Page title and starting point are unchanged.'
        : status === 'empty'
          ? 'No website sections are available. Ask an Admin to assign an active section and Pages access, then check again.'
          : 'The draft starts directly under this section. You can choose a different parent within the same section in the native editor.'
  return (
    <div className="page-section-select" ref={setContainer}>
      <div className="w-full max-w-md">
        <FieldGroup>
          <Field data-disabled={unavailable} data-invalid={invalid}>
            <FieldLabel htmlFor={id}>Website section</FieldLabel>
            <Select value={value} onValueChange={onChange} disabled={unavailable}>
              <SelectTrigger
                id={id}
                className="w-full bg-background"
                aria-describedby={`${id}-description`}
                aria-invalid={invalid || undefined}
                aria-required="true"
              >
                <SelectValue placeholder="Choose a website section" />
              </SelectTrigger>
              <SelectContent container={container} align="start" position="popper">
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription id={`${id}-description`} role="status">
              {description}
            </FieldDescription>
          </Field>
          {status === 'error' || status === 'empty' ? (
            <Button type="button" variant="outline" disabled={disabled} onClick={onRetry}>
              {status === 'empty' ? 'Check sections again' : 'Try loading sections again'}
            </Button>
          ) : null}
        </FieldGroup>
      </div>
    </div>
  )
}
