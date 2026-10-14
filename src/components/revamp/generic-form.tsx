'use client'

/**
 * Source: @shadcnblocks/form-form-patterns-4 (authenticated, 2026-10-06).
 * Checkbox composition: @shadcnblocks/checkbox-checkbox-standard-1.
 * THESIS: Published questions become a usable form without fixed contact names.
 * OWN-WORLD: Inherit official Neutral light/dark, Radix Luma, system sans.
 * STORY: Read the questions, enter answers, correct errors, receive confirmation.
 * FIRST VIEWPORT: Original max-w-md stacked FieldGroup with full-width submit.
 * FORM: Pinned upstream structure; no alternative visual direction.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
 * Adaptations: typed schema, shared validation, unique IDs, submission states.
 */
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Controller, useForm, type Resolver, type ResolverResult } from 'react-hook-form'

import { Button } from '@/components/revamp/ui/button'
import { Checkbox } from '@/components/revamp/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/revamp/ui/field'
import { Input } from '@/components/revamp/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/revamp/ui/select'
import { cn } from '@/lib/utils'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'
import { Textarea } from '@/components/revamp/ui/textarea'
import {
  FORM_HONEYPOT_FIELD_NAME,
  FORM_MAX_EMAIL_LENGTH,
  FORM_MAX_SINGLE_LINE_LENGTH,
  FORM_MAX_TEXTAREA_LENGTH,
  FORM_PHONE_MAX_INPUT_LENGTH,
  sanitizePhoneNumberInput,
  validateFormFieldDefinitions,
  validateFormSubmission,
  type FormSubmissionErrors,
  type SimpleFormField,
} from '@/lib/forms'

export type GenericFormResult = {
  success: boolean
  message: string
  requestKeyConflict?: boolean
  errors?: FormSubmissionErrors
  updatedForm?: { fields: SimpleFormField[]; revision: string; submitButtonLabel: string }
}
export type GenericFormProps = {
  /** Contact6 preserves its first two short controls in a responsive split row. */
  layout?: 'stacked' | 'contact6'
  fields: SimpleFormField[]
  formLabel?: string
  heading?: string
  description?: string
  submitButtonLabel?: string
  pendingLabel?: string
  disabled?: boolean
  revision?: string
  protectRetries?: boolean
  onSubmit: (
    values: Record<string, boolean | string>,
    revision?: string,
    submissionKey?: string,
  ) => Promise<GenericFormResult>
}

type Answers = { answers: Record<string, boolean | string>; website: string }

const maxLengths = {
  text: FORM_MAX_SINGLE_LINE_LENGTH,
  email: FORM_MAX_EMAIL_LENGTH,
  phone: FORM_PHONE_MAX_INPUT_LENGTH,
  textarea: FORM_MAX_TEXTAREA_LENGTH,
}

const subscribeToHydration = () => () => {}

/** Presentation only. The caller owns fetching, form identity and persistence. */
function FormPresentation({
  fields: initialFields,
  revision: initialRevision,
  layout = 'stacked',
  heading = 'Get in touch',
  formLabel = 'Enquiry form',
  description,
  submitButtonLabel: initialSubmitLabel = 'Send Message',
  pendingLabel = 'Sending…',
  disabled = false,
  protectRetries = false,
  onSubmit,
}: GenericFormProps) {
  const [fields, setFields] = useState(initialFields)
  const [revision, setRevision] = useState(initialRevision)
  const [updatedSubmitLabel, setSubmitButtonLabel] = useState<string | null>(null)
  const submitButtonLabel = updatedSubmitLabel ?? initialSubmitLabel
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null)
  const recoveryRef = useRef<HTMLParagraphElement>(null)
  const splitFirstRow =
    layout === 'contact6' &&
    fields.length >= 2 &&
    fields.slice(0, 2).every((field) => field.type !== 'textarea' && field.type !== 'checkbox')
  // The server-rendered form must not submit to the page before React is ready.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const prefix = useId()
  const [selectContainer, setSelectContainer] = useState<HTMLDivElement | null>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const submittingRef = useRef(false)
  const submissionKeyRef = useRef<string | null>(null)
  const [result, setResult] = useState<GenericFormResult | null>(null)
  const resolver: Resolver<Answers> = (input): ResolverResult<Answers> => {
    const { errors, normalizedData } = validateFormSubmission({ fields, values: input.answers })
    if (Object.keys(errors).length) {
      return {
        values: {},
        errors: {
          answers: Object.fromEntries(
            Object.entries(errors).map(([name, message]) => [name, { type: 'validate', message }]),
          ),
        },
      }
    }
    return { values: { answers: normalizedData, website: input.website }, errors: {} }
  }
  const form = useForm<Answers>({
    resolver,
    defaultValues: {
      answers: Object.fromEntries(
        fields.map((field) => [field.name, field.type === 'checkbox' ? false : '']),
      ),
      website: '',
    },
    shouldFocusError: true,
  })
  useEffect(() => {
    if (result?.success) messageRef.current?.focus()
  }, [result])

  useEffect(() => {
    if (recoveryMessage) recoveryRef.current?.focus()
  }, [recoveryMessage, revision])

  const pending = form.formState.isSubmitting
  const inactive = !hydrated || disabled || pending || Boolean(result?.requestKeyConflict)
  const hasErrors = Boolean(form.formState.errors.answers)
  const submitAnswers = async ({ answers, website }: Answers) => {
    if (disabled || submittingRef.current || result?.success || result?.requestKeyConflict) return
    submittingRef.current = true
    setResult(null)
    form.clearErrors('root')
    try {
      const submittedValues = { ...answers, [FORM_HONEYPOT_FIELD_NAME]: website }
      if (protectRetries) submissionKeyRef.current ??= crypto.randomUUID()
      const response = protectRetries
        ? await onSubmit(submittedValues, revision, submissionKeyRef.current ?? undefined)
        : revision
          ? await onSubmit(submittedValues, revision)
          : await onSubmit(submittedValues)
      if (!response.success && response.updatedForm) {
        const updated = response.updatedForm
        const recovered = recoverFormAnswers(fields, updated.fields, answers)
        setFields(updated.fields)
        setRevision(updated.revision)
        setSubmitButtonLabel(updated.submitButtonLabel)
        form.reset({ answers: recovered.values, website: '' })
        setRecoveryMessage(
          `The questions have changed. Your compatible answers are still here. ${
            recovered.clearedLabels.length
              ? `These answers were cleared because their questions changed: ${recovered.clearedLabels.join(', ')}. `
              : ''
          }Review the updated questions before submitting again.`,
        )
        setResult(null)
        return
      }
      setResult(response)
      if (response.requestKeyConflict) setRecoveryMessage(response.message)
      if (response.success) setRecoveryMessage(null)
      if (!response.success) {
        let firstInvalid: string | undefined
        for (const field of fields) {
          const message = response.errors?.[field.name]
          if (!message) continue
          form.setError(`answers.${field.name}`, { type: 'server', message })
          firstInvalid ??= field.name
        }
        if (firstInvalid) form.setFocus(`answers.${firstInvalid}`)
      }
    } catch {
      // A lost response may follow a stored submission; do not promise it failed.
      setResult({
        success: false,
        message:
          'We couldn’t confirm your submission. Your answers are still here. Check your connection and try again.',
      })
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <div className={cn('w-full', layout === 'stacked' && 'max-w-md')} ref={setSelectContainer}>
      <form
        method="post"
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          if (inactive || submittingRef.current || result?.success) {
            event.preventDefault()
            return
          }
          void form.handleSubmit(submitAnswers)(event)
        }}
        aria-labelledby={heading ? `${prefix}-heading` : undefined}
        aria-label={heading ? undefined : formLabel}
        aria-busy={!hydrated || pending}
      >
        {recoveryMessage && (
          <FieldDescription ref={recoveryRef} role="status" tabIndex={-1}>
            {recoveryMessage}
          </FieldDescription>
        )}
        <noscript>
          <FieldDescription>Enable JavaScript to send this form.</FieldDescription>
        </noscript>
        {(heading || description) && (
          <div className="flex flex-col gap-2">
            {heading && (
              <h2 id={`${prefix}-heading`} className="text-2xl font-bold">
                {heading}
              </h2>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        <FieldDescription
          ref={messageRef}
          tabIndex={result?.success ? -1 : undefined}
          role={recoveryMessage && !pending ? undefined : 'status'}
          className="empty:hidden"
        >
          {result?.success ? result.message : pending ? pendingLabel : ''}
        </FieldDescription>
        {!result?.success && (
          <>
            {fields.some((field) => field.required) && (
              <FieldDescription>Fields marked * are required.</FieldDescription>
            )}
            {!result?.requestKeyConflict && (hasErrors || result?.success === false) && (
              <FieldError>
                {result?.success === false
                  ? result.message
                  : 'Please correct the highlighted fields and try again.'}
              </FieldError>
            )}
            {result?.requestKeyConflict && (
              <Button
                type="button"
                variant="outline"
                disabled={!hydrated || disabled || pending}
                onClick={() => {
                  submissionKeyRef.current = null
                  setResult(null)
                  setRecoveryMessage(
                    'Your answers are still here. Review them before sending a new response.',
                  )
                }}
              >
                Start a new response
              </Button>
            )}
            <FieldGroup
              className={cn(
                layout === 'contact6' && 'gap-6',
                splitFirstRow && 'grid sm:grid-cols-2',
              )}
            >
              {fields.map((definition, index) => (
                <Controller
                  key={definition.id ?? definition.name}
                  name={`answers.${definition.name}`}
                  control={form.control}
                  render={({ field, fieldState }) => {
                    const id = `${prefix}-${definition.name}`
                    const errorId = `${id}-error`
                    const a11y = {
                      id,
                      'aria-invalid': fieldState.invalid,
                      'aria-required': Boolean(definition.required),
                      'aria-describedby': fieldState.invalid ? errorId : undefined,
                    }
                    const label = (
                      <>
                        {definition.label}
                        {definition.required && <span aria-hidden="true"> *</span>}
                      </>
                    )
                    const value = typeof field.value === 'string' ? field.value : ''
                    if (definition.type === 'checkbox')
                      return (
                        <Field
                          className={cn(splitFirstRow && index >= 2 && 'sm:col-span-2')}
                          data-invalid={fieldState.invalid}
                          data-disabled={inactive}
                        >
                          <Field orientation="horizontal" className="gap-2">
                            <Checkbox
                              {...a11y}
                              ref={field.ref}
                              name={definition.name}
                              checked={field.value === true}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              onBlur={field.onBlur}
                              required={Boolean(definition.required)}
                              disabled={inactive}
                            />
                            <FieldLabel htmlFor={id}>{label}</FieldLabel>
                          </Field>
                          {fieldState.invalid && (
                            <FieldError id={errorId} errors={[fieldState.error]} />
                          )}
                        </Field>
                      )
                    return (
                      <Field
                        className={cn(splitFirstRow && index >= 2 && 'sm:col-span-2')}
                        data-invalid={fieldState.invalid}
                        data-disabled={inactive}
                      >
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        {definition.type === 'select' ? (
                          <Select
                            name={definition.name}
                            value={value}
                            onValueChange={field.onChange}
                            disabled={inactive}
                            required={Boolean(definition.required)}
                          >
                            <SelectTrigger
                              {...a11y}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              className={cn(layout === 'stacked' && 'bg-background')}
                            >
                              <SelectValue
                                placeholder={definition.placeholder || 'Choose an option'}
                              />
                            </SelectTrigger>
                            <SelectContent container={selectContainer}>
                              <SelectGroup>
                                {definition.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        ) : definition.type === 'textarea' ? (
                          <Textarea
                            {...field}
                            {...a11y}
                            name={definition.name}
                            value={value}
                            disabled={inactive}
                            required={Boolean(definition.required)}
                            maxLength={maxLengths.textarea}
                            rows={5}
                            placeholder={definition.placeholder ?? undefined}
                            className={cn('resize-none', layout === 'stacked' && 'bg-background')}
                          />
                        ) : (
                          <Input
                            {...field}
                            {...a11y}
                            name={definition.name}
                            value={value}
                            disabled={inactive}
                            required={Boolean(definition.required)}
                            maxLength={maxLengths[definition.type]}
                            type={definition.type === 'phone' ? 'tel' : definition.type}
                            onChange={(event) =>
                              field.onChange(
                                definition.type === 'phone'
                                  ? sanitizePhoneNumberInput(event.target.value)
                                  : event.target.value,
                              )
                            }
                            autoComplete={
                              definition.contactRole === 'name'
                                ? 'name'
                                : definition.type === 'email'
                                  ? 'email'
                                  : definition.type === 'phone'
                                    ? 'tel'
                                    : undefined
                            }
                            placeholder={definition.placeholder ?? undefined}
                            className={cn(layout === 'stacked' && 'bg-background')}
                          />
                        )}
                        {fieldState.invalid && (
                          <FieldError id={errorId} errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
              ))}
            </FieldGroup>
            <div hidden aria-hidden="true">
              <label htmlFor={`${prefix}-website`}>Website</label>
              <input
                {...form.register('website')}
                id={`${prefix}-website`}
                tabIndex={-1}
                disabled={inactive}
                autoComplete="off"
              />
            </div>
            <Button className="w-full" type="submit" disabled={inactive}>
              {pending ? pendingLabel : submitButtonLabel}
            </Button>
          </>
        )}
      </form>
    </div>
  )
}

export function GenericForm(props: GenericFormProps) {
  if (validateFormFieldDefinitions(props.fields) !== true) {
    return <FieldError>This form is unavailable. Please try another way to contact us.</FieldError>
  }
  // Replacing the schema must drop removed answers and reset validation/status.
  return <FormPresentation key={JSON.stringify([props.revision, props.fields])} {...props} />
}
