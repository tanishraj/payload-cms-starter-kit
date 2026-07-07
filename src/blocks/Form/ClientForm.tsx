'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { FORM_HONEYPOT_FIELD_NAME, type SimpleFormField } from '@/lib/forms'
import { cn } from '@/lib/utils'

type ClientFormProps = {
  fields: SimpleFormField[]
  slug: string
  submitButtonLabel: string
  successMessage: string
  title: string
}

type SubmissionErrors = Record<string, string>
type SubmissionState = 'idle' | 'submitting' | 'success'

export function ClientForm({
  fields,
  slug,
  submitButtonLabel,
  successMessage,
  title,
}: ClientFormProps) {
  const initialValues = useMemo<Record<string, boolean | string>>(
    () =>
      ({
        ...Object.fromEntries(
          fields.map((field) => [field.name, field.type === 'checkbox' ? false : '']),
        ),
        [FORM_HONEYPOT_FIELD_NAME]: '',
      }) as Record<string, boolean | string>,
    [fields],
  )

  const [values, setValues] = useState<Record<string, boolean | string>>(initialValues)
  const [errors, setErrors] = useState<SubmissionErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [state, setState] = useState<SubmissionState>('idle')

  const updateValue = (name: string, value: boolean | string) => {
    if (state === 'success') {
      setState('idle')
    }

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[name]
      return nextErrors
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setState('submitting')
    setErrors({})
    setFormError(null)

    try {
      const response = await fetch(`/api/forms/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      })

      const result = (await response.json()) as
        | {
            errors?: SubmissionErrors
            message?: string
          }
        | undefined

      if (!response.ok) {
        setErrors(result?.errors ?? {})
        setFormError(result?.message ?? 'Unable to submit the form right now.')
        setState('idle')
        return
      }

      setValues(initialValues)
      setErrors({})
      setFormError(null)
      setState('success')
    } catch {
      setFormError('Unable to submit the form right now.')
      setState('idle')
    }
  }

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-8 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
            {state === 'success' && (
              <p className="rounded-lg border border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 px-4 py-3 text-sm text-foreground">
                {successMessage}
              </p>
            )}
            {formError && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div
              className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor={FORM_HONEYPOT_FIELD_NAME}>Website</label>
              <input
                id={FORM_HONEYPOT_FIELD_NAME}
                name={FORM_HONEYPOT_FIELD_NAME}
                type="text"
                autoComplete="off"
                tabIndex={-1}
                value={String(values[FORM_HONEYPOT_FIELD_NAME] ?? '')}
                onChange={(event) => updateValue(FORM_HONEYPOT_FIELD_NAME, event.target.value)}
              />
            </div>

            {fields.map((field) => {
              const hasError = Boolean(errors[field.name])
              const fieldError = errors[field.name]

              if (field.type === 'textarea') {
                return (
                  <div
                    key={field.name}
                    className="space-y-2"
                  >
                    <label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      {field.label}
                    </label>
                    <textarea
                      id={field.name}
                      name={field.name}
                      rows={5}
                      value={String(values[field.name] ?? '')}
                      onChange={(event) => updateValue(field.name, event.target.value)}
                      placeholder={field.placeholder ?? undefined}
                      aria-invalid={hasError}
                      className={cn(
                        'min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
                        hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                      )}
                    />
                    {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
                  </div>
                )
              }

              if (field.type === 'checkbox') {
                return (
                  <div
                    key={field.name}
                    className="space-y-2"
                  >
                    <label className="flex items-start gap-3 text-sm text-foreground">
                      <input
                        id={field.name}
                        name={field.name}
                        type="checkbox"
                        checked={Boolean(values[field.name])}
                        onChange={(event) => updateValue(field.name, event.target.checked)}
                        aria-invalid={hasError}
                        className="mt-0.5 size-4 rounded-sm border border-input bg-background accent-primary"
                      />
                      <span className="leading-6">{field.label}</span>
                    </label>
                    {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
                  </div>
                )
              }

              if (field.type === 'select') {
                return (
                  <div
                    key={field.name}
                    className="space-y-2"
                  >
                    <label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      {field.label}
                    </label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={String(values[field.name] ?? '')}
                      onChange={(event) => updateValue(field.name, event.target.value)}
                      aria-invalid={hasError}
                      className={cn(
                        'h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20',
                        hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                      )}
                    >
                      <option value="">Select an option</option>
                      {(field.options ?? []).map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
                  </div>
                )
              }

              return (
                <div
                  key={field.name}
                  className="space-y-2"
                >
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-foreground"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={String(values[field.name] ?? '')}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                    placeholder={field.placeholder ?? undefined}
                    aria-invalid={hasError}
                    className={cn(
                      'h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
                      hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                    )}
                  />
                  {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
                </div>
              )
            })}

            <Button
              type="submit"
              size="lg"
              disabled={state === 'submitting'}
            >
              {state === 'submitting' ? 'Submitting...' : submitButtonLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
