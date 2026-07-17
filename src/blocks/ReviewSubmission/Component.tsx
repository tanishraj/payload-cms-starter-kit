'use client'

import { ArrowRight, Star } from 'lucide-react'
import { useState } from 'react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FORM_HONEYPOT_FIELD_NAME } from '@/lib/forms'
import { reviewRatingOptions } from '@/lib/reviews'
import { cn } from '@/lib/utils'
import type { Form } from '@/payload-types'

type Benefit = {
  text?: string | null
}

type ReviewFieldName = 'rating' | 'reviewBody' | 'reviewerEmail' | 'reviewerName' | 'subjectLabel'

type ReviewFieldOption = {
  label: string
  value: string
}

type ReviewFieldDefinition = {
  description?: string
  label: string
  name: ReviewFieldName
  options?: ReviewFieldOption[]
  placeholder?: string
  required: boolean
  type: 'checkbox' | 'email' | 'select' | 'text' | 'textarea'
}

type ReviewSubmissionValues = {
  rating: string
  reviewBody: string
  reviewerEmail: string
  reviewerName: string
  subjectLabel: string
}

type FormLike = Pick<Form, 'fields' | 'slug' | 'submitButtonLabel' | 'successMessage' | 'title'>

type ReviewSubmissionBlockLike = {
  appearance?: BlockAppearance | null
  benefits?: Benefit[] | null
  description?: string | null
  eyebrow?: string | null
  form?: FormLike | number | string | null
  formEyebrow?: string | null
  formDescription?: string | null
  formHeading?: string | null
  heading: string
  size?: 'comfortable' | 'compact' | 'default' | null
}

const sectionSizeClasses = {
  compact: 'py-16 md:py-20',
  default: 'py-20 md:py-24',
  comfortable: 'py-24 md:py-28',
} as const

const headingSizeClasses = {
  compact: 'text-3xl sm:text-4xl lg:text-[2.75rem]',
  default: 'text-3xl sm:text-4xl lg:text-5xl',
  comfortable: 'text-4xl sm:text-[2.75rem] lg:text-[3.25rem]',
} as const

const descriptionSizeClasses = {
  compact: 'text-sm leading-7 sm:text-base',
  default: 'text-base leading-7 lg:text-lg',
  comfortable: 'text-base leading-8 lg:text-lg',
} as const

const splitLayoutClasses = {
  compact: 'grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-12',
  default: 'grid items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-16',
  comfortable: 'grid items-start gap-10 md:grid-cols-2 md:gap-14 lg:gap-18',
} as const

const ratingToneLabels: Record<string, string> = {
  '1': 'Poor',
  '2': 'Fair',
  '3': 'Good',
  '4': 'Very Good',
  '5': 'Excellent',
}

const initialValues: ReviewSubmissionValues = {
  rating: '',
  reviewBody: '',
  reviewerEmail: '',
  reviewerName: '',
  subjectLabel: '',
}

const fallbackFieldDefinitions: Record<ReviewFieldName, ReviewFieldDefinition> = {
  rating: {
    label: 'Rating',
    name: 'rating',
    options: reviewRatingOptions.map((option) => ({
      label: option.label,
      value: option.value,
    })),
    required: true,
    type: 'select',
  },
  reviewBody: {
    label: 'Your review',
    name: 'reviewBody',
    placeholder: 'Tell us what stood out — a professor, a program, a moment on campus.',
    required: true,
    type: 'textarea',
  },
  reviewerName: {
    label: 'Your name',
    name: 'reviewerName',
    placeholder: 'Jane Doe',
    required: true,
    type: 'text',
  },
  reviewerEmail: {
    label: 'Email',
    name: 'reviewerEmail',
    placeholder: 'jane@example.com',
    required: false,
    type: 'email',
  },
  subjectLabel: {
    label: 'What is this about?',
    name: 'subjectLabel',
    options: [
      { label: 'Academics', value: 'academics' },
      { label: 'Campus', value: 'campus' },
      { label: 'Faculty', value: 'faculty' },
      { label: 'Admissions', value: 'admissions' },
      { label: 'Research', value: 'research' },
    ],
    required: false,
    type: 'select',
  },
}

function resolveFormRecord(form: ReviewSubmissionBlockLike['form']): FormLike | null {
  if (!form || typeof form !== 'object') {
    return null
  }

  return form as FormLike
}

function getFieldDefinition(
  formRecord: FormLike | null,
  name: ReviewFieldName,
): ReviewFieldDefinition {
  const fallback = fallbackFieldDefinitions[name]
  const rawField = formRecord?.fields?.find((field) => field?.name === name)

  if (!rawField) {
    return fallback
  }

  const resolvedOptions =
    rawField.options?.flatMap((option) => {
      const label = option?.label?.trim()
      const value = option?.value?.trim()

      return label && value ? [{ label, value }] : []
    }) ?? []

  return {
    ...fallback,
    description: name === 'reviewBody' ? fallback.description : undefined,
    label: rawField.label?.trim() || fallback.label,
    options: resolvedOptions.length ? resolvedOptions : fallback.options,
    placeholder: rawField.placeholder?.trim() || fallback.placeholder,
    required: name === 'reviewerEmail' ? false : (rawField.required ?? fallback.required),
    type:
      rawField.type === 'checkbox' ||
      rawField.type === 'email' ||
      rawField.type === 'select' ||
      rawField.type === 'text' ||
      rawField.type === 'textarea'
        ? rawField.type
        : fallback.type,
  }
}

function getSubmissionMetadata() {
  if (typeof window === 'undefined') {
    return {}
  }

  const url = new URL(window.location.href)
  const referrer = document.referrer
  let resolvedSource = url.searchParams.get('utm_source') || undefined

  if (!resolvedSource && referrer) {
    try {
      resolvedSource = new URL(referrer).hostname || undefined
    } catch {
      resolvedSource = undefined
    }
  }

  return {
    campaign: url.searchParams.get('utm_campaign') || undefined,
    landingPage: `${url.pathname}${url.search}`,
    source: resolvedSource,
  }
}

export function ReviewSubmissionBlockComponent({
  appearance,
  benefits,
  description,
  eyebrow,
  form,
  formEyebrow,
  formDescription,
  formHeading,
  heading,
  size = 'default',
}: ReviewSubmissionBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedSize = size ?? 'default'
  const formRecord = resolveFormRecord(form)
  const formSlug = formRecord?.slug?.trim()
  const isFormAvailable = Boolean(formSlug)
  const ratingField = getFieldDefinition(formRecord, 'rating')
  const subjectField = getFieldDefinition(formRecord, 'subjectLabel')
  const bodyField = getFieldDefinition(formRecord, 'reviewBody')
  const nameField = getFieldDefinition(formRecord, 'reviewerName')
  const emailField = getFieldDefinition(formRecord, 'reviewerEmail')
  const submitLabel = formRecord?.submitButtonLabel?.trim() || 'Submit review'
  const resolvedFormHeading =
    formHeading?.trim() || formRecord?.title?.trim() || 'Share your review'
  const resolvedFormDescription = formDescription?.trim()
  const benefitItems = (benefits ?? []).flatMap((benefit) => {
    const text = benefit?.text?.trim()

    return text ? [text] : []
  })
  const defaultSubjectLabel = subjectField.options?.[0]?.value ?? ''

  const [values, setValues] = useState<ReviewSubmissionValues>(() => ({
    ...initialValues,
    subjectLabel: defaultSubjectLabel,
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'default' | 'destructive'>('default')
  const [hoveredRating, setHoveredRating] = useState<string | null>(null)

  const updateValue = <K extends keyof ReviewSubmissionValues>(
    key: K,
    nextValue: ReviewSubmissionValues[K],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }))
    setErrors((currentErrors) => {
      if (!(key in currentErrors)) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[key]
      return nextErrors
    })
    if (key === 'rating') {
      setHoveredRating(null)
    }
    setMessage(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formSlug || isPending) {
      return
    }

    setIsPending(true)
    setErrors({})
    setMessage(null)

    try {
      const response = await fetch(`/api/forms/${formSlug}/submit`, {
        body: JSON.stringify({
          metadata: getSubmissionMetadata(),
          values: {
            ...values,
            [FORM_HONEYPOT_FIELD_NAME]: '',
            isGenuineExperience: true,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const payload = (await response.json()) as {
        errors?: Record<string, string>
        message?: string
      }

      if (!response.ok) {
        setErrors(payload.errors ?? {})
        setMessage(payload.message || 'Please correct the highlighted fields and try again.')
        setMessageTone('destructive')
        return
      }

      setValues({
        ...initialValues,
        subjectLabel: defaultSubjectLabel,
      })
      setErrors({})
      setMessage(
        payload.message ||
          formRecord?.successMessage?.trim() ||
          'Thanks. Your review has been received.',
      )
      setMessageTone('default')
    } catch {
      setMessage('Something went wrong while sending your review. Please try again.')
      setMessageTone('destructive')
    } finally {
      setIsPending(false)
    }
  }

  const activeRatingLabel = ratingToneLabels[hoveredRating ?? values.rating] ?? ''
  const bodyCharacterCount = values.reviewBody.length

  return (
    <section
      className={cn(sectionSizeClasses[resolvedSize], appearanceClasses.className)}
      data-review-submission-background={appearance?.background ?? 'none'}
      data-review-submission-size={resolvedSize}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div className={splitLayoutClasses[resolvedSize]}>
          <div className="flex flex-col gap-6 lg:max-w-xl">
            <div className="flex flex-col gap-4">
              {eyebrow?.trim() ? (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {eyebrow.trim()}
                </p>
              ) : null}
              <h2
                className={cn(
                  'max-w-3xl font-semibold tracking-tight text-balance text-foreground',
                  headingSizeClasses[resolvedSize],
                )}
              >
                {heading}
              </h2>
              {description?.trim() ? (
                <p
                  className={cn(
                    'max-w-2xl text-balance text-muted-foreground',
                    descriptionSizeClasses[resolvedSize],
                  )}
                >
                  {description.trim()}
                </p>
              ) : null}
            </div>

            {benefitItems.length ? (
              <ul className="flex flex-col">
                {benefitItems.map((benefit, index) => (
                  <li
                    key={`${benefit}-${index}`}
                    className="flex items-start gap-3 border-b border-border/70 py-5 last:border-b-0"
                  >
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    <p className="text-base leading-7 text-foreground">{benefit}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Card className="w-full border border-border/70 [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(8)]">
            <CardHeader className="items-center gap-3 text-center">
              {formEyebrow?.trim() ? (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {formEyebrow.trim()}
                </p>
              ) : null}
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {resolvedFormHeading}
              </CardTitle>
              {resolvedFormDescription ? (
                <CardDescription className="max-w-[40ch] text-sm leading-6 sm:text-base">
                  {resolvedFormDescription}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="@container/form-card">
              {isFormAvailable ? (
                <form
                  className="mx-auto flex w-full max-w-xl flex-col gap-7"
                  onSubmit={handleSubmit}
                >
                  <FieldGroup className="gap-6">
                    <FieldSet className="items-center gap-2 text-center">
                      <FieldLegend className="sr-only">{ratingField.label}</FieldLegend>
                      <Field
                        className="items-center"
                        data-invalid={Boolean(errors.rating) || undefined}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <RadioGroup
                            aria-invalid={Boolean(errors.rating) || undefined}
                            className="flex w-fit items-center gap-0"
                            id="review-rating"
                            required={ratingField.required}
                            value={values.rating}
                            onMouseLeave={() => setHoveredRating(null)}
                            onValueChange={(nextValue) => updateValue('rating', nextValue)}
                          >
                            {(ratingField.options ?? reviewRatingOptions).map((option) => {
                              const optionValue = Number(option.value)
                              const activeValue = Number((hoveredRating ?? values.rating) || '0')
                              const isFilled = activeValue >= optionValue
                              const ratingLabel = ratingToneLabels[option.value] ?? option.label

                              return (
                                <RadioGroupItem
                                  aria-label={`${option.label} star${option.label === '1' ? '' : 's'} - ${ratingLabel}`}
                                  className={cn(
                                    'size-auto rounded-none border-0 bg-transparent px-1.5 py-1 text-muted-foreground shadow-none after:hidden focus-visible:border-0 focus-visible:ring-0 data-checked:bg-transparent data-checked:text-primary [&_svg]:size-8 sm:[&_svg]:size-9',
                                    '**:data-[slot=radio-group-indicator]:hidden',
                                    isFilled ? 'text-primary' : 'hover:text-primary/80',
                                  )}
                                  key={option.value}
                                  value={option.value}
                                  onBlur={() => setHoveredRating(null)}
                                  onFocus={() => setHoveredRating(option.value)}
                                  onMouseEnter={() => setHoveredRating(option.value)}
                                >
                                  <Star
                                    aria-hidden="true"
                                    className={cn(
                                      'transition-colors',
                                      isFilled ? 'fill-current' : 'fill-transparent',
                                    )}
                                  />
                                </RadioGroupItem>
                              )
                            })}
                          </RadioGroup>
                          <p className="min-h-6 self-center text-sm leading-6 text-muted-foreground">
                            {activeRatingLabel}
                          </p>
                        </div>
                        <FieldError>{errors.rating}</FieldError>
                      </Field>
                    </FieldSet>

                    {subjectField.options?.length ? (
                      <FieldSet className="items-center gap-3 text-center">
                        <FieldLegend className="mb-0 text-center text-sm font-medium text-foreground">
                          {subjectField.label}
                        </FieldLegend>
                        <Field
                          className="items-center"
                          data-invalid={Boolean(errors.subjectLabel) || undefined}
                        >
                          <ToggleGroup
                            aria-invalid={Boolean(errors.subjectLabel) || undefined}
                            className="flex w-full flex-wrap justify-center"
                            size="sm"
                            type="single"
                            value={values.subjectLabel}
                            variant="outline"
                            onValueChange={(nextValue) => {
                              if (nextValue) {
                                updateValue('subjectLabel', nextValue)
                              }
                            }}
                          >
                            {subjectField.options.map((option) => (
                              <ToggleGroupItem
                                className="px-4 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                          <FieldError>{errors.subjectLabel}</FieldError>
                        </Field>
                      </FieldSet>
                    ) : null}

                    <FieldGroup className="gap-4 @md/form-card:grid @md/form-card:grid-cols-2">
                      <Field
                        className="gap-2.5"
                        data-invalid={Boolean(errors.reviewerName) || undefined}
                      >
                        <FieldLabel className="text-sm font-medium" htmlFor="reviewer-name">
                          {nameField.label}
                        </FieldLabel>
                        <Input
                          aria-invalid={Boolean(errors.reviewerName) || undefined}
                          className="h-11"
                          id="reviewer-name"
                          placeholder={nameField.placeholder}
                          required={nameField.required}
                          type="text"
                          value={values.reviewerName}
                          onChange={(event) => updateValue('reviewerName', event.target.value)}
                        />
                        <FieldError>{errors.reviewerName}</FieldError>
                      </Field>

                      <Field
                        className="gap-2.5"
                        data-invalid={Boolean(errors.reviewerEmail) || undefined}
                      >
                        <FieldLabel className="text-sm font-medium" htmlFor="reviewer-email">
                          {emailField.label}
                          {!emailField.required ? (
                            <span className="font-normal text-muted-foreground">(optional)</span>
                          ) : null}
                        </FieldLabel>
                        <Input
                          aria-invalid={Boolean(errors.reviewerEmail) || undefined}
                          className="h-11"
                          id="reviewer-email"
                          placeholder={emailField.placeholder}
                          required={emailField.required}
                          type="email"
                          value={values.reviewerEmail}
                          onChange={(event) => updateValue('reviewerEmail', event.target.value)}
                        />
                        <FieldError>{errors.reviewerEmail}</FieldError>
                      </Field>
                    </FieldGroup>

                    <Field
                      className="gap-2.5"
                      data-invalid={Boolean(errors.reviewBody) || undefined}
                    >
                      <FieldLabel className="text-sm font-medium" htmlFor="review-body">
                        {bodyField.label}
                      </FieldLabel>
                      <Textarea
                        aria-invalid={Boolean(errors.reviewBody) || undefined}
                        className="min-h-32"
                        id="review-body"
                        maxLength={1000}
                        placeholder={bodyField.placeholder}
                        required={bodyField.required}
                        rows={6}
                        value={values.reviewBody}
                        onChange={(event) => updateValue('reviewBody', event.target.value)}
                      />
                      <div className="flex items-start justify-between gap-4">
                        {bodyField.description ? (
                          <FieldDescription>{bodyField.description}</FieldDescription>
                        ) : (
                          <span aria-hidden="true" />
                        )}
                        <p className="shrink-0 text-sm text-muted-foreground">
                          {bodyCharacterCount}/1000
                        </p>
                      </div>
                      <FieldError>{errors.reviewBody}</FieldError>
                    </Field>
                  </FieldGroup>

                  <input
                    aria-hidden="true"
                    autoComplete="off"
                    className="hidden"
                    name={FORM_HONEYPOT_FIELD_NAME}
                    tabIndex={-1}
                    type="text"
                    value=""
                    readOnly
                  />

                  {message ? (
                    <p
                      className={cn(
                        'text-sm leading-6',
                        messageTone === 'destructive'
                          ? 'text-destructive'
                          : 'text-muted-foreground',
                      )}
                    >
                      {message}
                    </p>
                  ) : null}

                  <Button className="h-12 w-full" disabled={isPending} type="submit">
                    {isPending ? 'Sending…' : submitLabel}
                  </Button>
                </form>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  This review form is currently unavailable.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
