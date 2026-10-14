import {
  getFormFilePolicy,
  validateFormFilePolicy,
  isUploadToken,
  type FormFilePolicy,
} from '@/lib/formAttachments'
import { getFormTemporalError, validateFormTemporalConstraints } from '@/lib/formTemporal'
import { getFormNumberError, validateFormNumberConstraints } from '@/lib/formNumber'

export const formFieldTypeOptions = [
  {
    label: 'Text',
    value: 'text',
  },
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Phone',
    value: 'phone',
  },
  { label: 'URL', value: 'url' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Switch', value: 'switch' },
  { label: 'File', value: 'file' },
  {
    label: 'Textarea',
    value: 'textarea',
  },
  {
    label: 'Select',
    value: 'select',
  },
  { label: 'Radio', value: 'radio' },
  { label: 'Checkbox group', value: 'checkboxGroup' },
  { label: 'Multi-select', value: 'multiSelect' },
  {
    label: 'Checkbox',
    value: 'checkbox',
  },
] as const

export type FormFieldType = (typeof formFieldTypeOptions)[number]['value']

export const formSubmissionIntentOptions = [
  {
    label: 'General',
    value: 'general',
  },
  {
    label: 'Lead',
    value: 'lead',
  },
  {
    label: 'Review',
    value: 'review',
  },
] as const

export type FormSubmissionIntent = (typeof formSubmissionIntentOptions)[number]['value']

export type SimpleFormFieldOption = {
  id?: string | null
  label: string
  value: string
}

export type FormContactRole = 'name' | 'email' | 'phone'

export type SimpleFormField = FormFilePolicy & {
  contactRole?: FormContactRole | null
  helpText?: string | null
  defaultValue?: string | null
  defaultChecked?: boolean | null
  defaultSelections?: { value: string; id?: string | null }[] | null
  minDate?: string | null
  maxDate?: string | null
  minTime?: string | null
  maxTime?: string | null
  minSelections?: number | null
  maxSelections?: number | null
  /** Character limits apply to Text and Textarea only; dormant settings survive type changes. */
  minLength?: number | null
  maxLength?: number | null
  minValue?: number | null
  maxValue?: number | null
  step?: number | null
  id?: string | null
  name: string
  label: string
  options?: SimpleFormFieldOption[] | null
  placeholder?: string | null
  required?: boolean | null
  type: FormFieldType
}

export type FormAnswer = boolean | string | string[]
export type FormAnswers = Record<string, FormAnswer>

export type FormSubmissionValues = Record<string, unknown>
export type FormSubmissionErrors = Record<string, string>
export type FormSubmissionMetadata = {
  campaign?: string
  landingPage?: string
  source?: string
}

export const FORM_HONEYPOT_FIELD_NAME = 'website'
export const FORM_MAX_EMAIL_LENGTH = 320
export const FORM_MAX_URL_LENGTH = 2_048
export const FORM_MAX_NUMBER_LENGTH = 64
export const FORM_MAX_FIELDS = 100
export const FORM_MAX_METADATA_URL_LENGTH = 2_048
export const FORM_MAX_SINGLE_LINE_LENGTH = 500
export const FORM_MAX_TEXTAREA_LENGTH = 10_000
export const FORM_RATE_LIMIT_MAX_SUBMISSIONS = 5
export const FORM_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
export const FORM_PHONE_MAX_DIGITS = 15
export const FORM_PHONE_MAX_INPUT_LENGTH = 25

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneCharactersPattern = /^\+?[\d][\d\s()./-]*$/
const phoneDigitPattern = /\d/
const phoneFormattingCharacterPattern = /[\s()./-]/

export const sanitizePhoneNumberInput = (value: string): string => {
  let digitCount = 0
  let sanitizedValue = ''

  for (const character of value) {
    if (sanitizedValue.length >= FORM_PHONE_MAX_INPUT_LENGTH) break

    if (phoneDigitPattern.test(character)) {
      if (digitCount < FORM_PHONE_MAX_DIGITS) {
        sanitizedValue += character
        digitCount += 1
      }
      continue
    }

    if (character === '+' && sanitizedValue.length === 0) {
      sanitizedValue += character
      continue
    }

    if (digitCount > 0 && phoneFormattingCharacterPattern.test(character)) {
      sanitizedValue += character
    }
  }

  return sanitizedValue
}

export const isValidPhoneNumber = (value: string): boolean => {
  const normalizedValue = value.trim()
  if (!phoneCharactersPattern.test(normalizedValue)) return false
  const digitCount = normalizedValue.replace(/\D/g, '').length
  return digitCount >= 7 && digitCount <= FORM_PHONE_MAX_DIGITS
}

export const isTextLikeFormFieldType = (type: FormFieldType): boolean => {
  return (
    type === 'text' ||
    type === 'email' ||
    type === 'phone' ||
    type === 'textarea' ||
    type === 'url' ||
    type === 'number'
  )
}

export const isBooleanFormFieldType = (type: FormFieldType): boolean =>
  type === 'checkbox' || type === 'switch'
export const isTemporalFormFieldType = (type: FormFieldType): type is 'date' | 'time' =>
  type === 'date' || type === 'time'

export const isSelectFormFieldType = (type: FormFieldType): boolean => {
  return ['select', 'radio', 'checkboxGroup', 'multiSelect'].includes(type)
}

export const isMultipleChoiceFormFieldType = (type: FormFieldType): boolean =>
  type === 'checkboxGroup' || type === 'multiSelect'

export const FORM_MAX_CHOICES = 100

export const normalizeFormSubmissionIntent = (value: unknown): FormSubmissionIntent => {
  if (value === 'lead' || value === 'review') {
    return value
  }

  return 'general'
}

export const isReviewFormSubmissionIntent = (value: unknown): boolean => {
  return normalizeFormSubmissionIntent(value) === 'review'
}

export const normalizeFormFieldName = (value: string): string => {
  return value.trim()
}

const checkboxValues = new Set<unknown>([
  true,
  false,
  'true',
  'false',
  'on',
  'off',
  '1',
  '0',
  '',
  1,
  0,
])

const reservedFormFieldNames = new Set(['constructor', 'prototype', FORM_HONEYPOT_FIELD_NAME])

export const isValidFormFieldName = (value: string): boolean => {
  return /^[A-Za-z][A-Za-z0-9_]*$/.test(value) && !reservedFormFieldNames.has(value)
}

export const validateFormFieldDefinitions = (value: unknown): true | string => {
  if (!Array.isArray(value) || value.length === 0) {
    return 'Add at least one field.'
  }
  if (value.length > FORM_MAX_FIELDS) {
    return `Add no more than ${FORM_MAX_FIELDS} fields.`
  }

  const seen = new Set<string>()
  const contactRoles = new Set<string>()
  const fieldIDs = new Set<string>()

  for (const field of value) {
    if (!field || typeof field !== 'object') {
      return 'Each form field must be a valid object.'
    }

    const name = typeof field.name === 'string' ? normalizeFormFieldName(field.name) : ''

    if (!name) {
      return 'Each form field must include a name.'
    }

    if (!isValidFormFieldName(name)) {
      return 'Field names must start with a letter and use only letters, numbers, and underscores. The names constructor, prototype, and website are reserved.'
    }

    if (!formFieldTypeOptions.some((option) => option.value === field.type)) {
      return `Field "${name}" has an unsupported control type.`
    }

    if (seen.has(name)) {
      return `Field name "${name}" is duplicated.`
    }

    seen.add(name)
    if (field.id != null) {
      if (typeof field.id !== 'string' || !field.id.trim() || fieldIDs.has(field.id)) {
        return `Field "${name}" must have a unique, non-empty row identity.`
      }
      fieldIDs.add(field.id)
    }
    if (
      field.helpText != null &&
      (typeof field.helpText !== 'string' || field.helpText.length > 1_000)
    ) {
      return `Help text for "${name}" must contain no more than 1,000 characters.`
    }
    if (supportsFormTextLimits(field.type)) {
      const cap = getFieldValueMaxLength(field.type)!
      const minimum = field.minLength ?? 0
      const maximum = field.maxLength ?? cap
      if (
        !Number.isInteger(minimum) ||
        !Number.isInteger(maximum) ||
        minimum < 0 ||
        maximum < 1 ||
        maximum > cap ||
        minimum > maximum
      ) {
        return `Character limits for "${name}" must be whole numbers: minimum 0 or greater, maximum 1–${cap}, and minimum no greater than maximum.`
      }
    }
    if (isBooleanFormFieldType(field.type)) {
      if (field.defaultChecked != null && typeof field.defaultChecked !== 'boolean') {
        return `The initial ${field.type === 'switch' ? 'switch' : 'checkbox'} value for "${name}" must be true or false.`
      }
      if (field.required && field.defaultChecked === true) {
        return field.type === 'switch'
          ? `Required switch "${name}" must start off so visitors make their own choice.`
          : `Required checkbox "${name}" must start unchecked so visitors make their own choice.`
      }
    }

    if (field.type === 'file' && !validateFormFilePolicy(field))
      return `File limits for "${name}" require supported types, 1–3 MB per file and 1–5 files.`

    if (isTemporalFormFieldType(field.type) && !validateFormTemporalConstraints(field.type, field))
      return `${field.type === 'date' ? 'Date' : 'Time'} limits for "${name}" must use valid ${field.type === 'date' ? 'YYYY-MM-DD dates (year 0001–9999)' : 'HH:mm local times (00:00–23:59)'} with minimum no later than maximum.${field.type === 'time' ? ' Time limits must describe one same-day window.' : ''}`

    if (field.type === 'number' && !validateFormNumberConstraints(field)) {
      return `Numeric limits for "${name}" must be finite numbers, with minimum no greater than maximum and a positive step. Whole-number settings must be within the safe integer range.`
    }

    if (field.contactRole) {
      const roleTypes = { name: 'text', email: 'email', phone: 'phone' } as const
      if (!Object.hasOwn(roleTypes, field.contactRole)) {
        return `Field "${name}" has an unsupported contact role.`
      }
      if (contactRoles.has(field.contactRole)) {
        return `Choose only one field for the submitter ${field.contactRole}.`
      }
      const expectedType = roleTypes[field.contactRole as FormContactRole]
      if (field.type !== expectedType) {
        const typeLabel = expectedType[0].toUpperCase() + expectedType.slice(1)
        return `The submitter ${field.contactRole} field must use the ${typeLabel} type.`
      }
      contactRoles.add(field.contactRole)
    }

    if (isSelectFormFieldType(field.type)) {
      const options = Array.isArray(field.options) ? field.options : []

      if (!options.length) {
        return `${field.type === 'select' ? 'Select' : 'Choice'} field "${name}" must include at least one option.`
      }

      if (field.type !== 'select' && options.length > FORM_MAX_CHOICES)
        return `Choice field "${name}" must include no more than ${FORM_MAX_CHOICES} options.`
      const optionValues = new Set<string>()
      const optionIDs = new Set<string>()

      for (const option of options) {
        const optionValue = typeof option?.value === 'string' ? option.value.trim() : ''

        if (
          field.type !== 'select' &&
          (optionValue !== option?.value ||
            optionValue.length > 500 ||
            typeof option?.label !== 'string' ||
            !option.label.trim() ||
            option.label.length > 500)
        )
          return `Choices in "${name}" need labels and values of 1–500 characters, with no surrounding spaces in values.`
        if (!optionValue) {
          return `Each option in ${field.type === 'select' ? 'select' : 'choice'} field "${name}" must include a value.`
        }

        if (optionValues.has(optionValue)) {
          return `${field.type === 'select' ? 'Select' : 'Choice'} field "${name}" has duplicate option value "${optionValue}".`
        }

        optionValues.add(optionValue)
        if (option.id != null) {
          if (typeof option.id !== 'string' || !option.id.trim() || optionIDs.has(option.id)) {
            return `Options in "${name}" must have unique, non-empty row identities.`
          }
          optionIDs.add(option.id)
        }
      }
    }
    if (isMultipleChoiceFormFieldType(field.type)) {
      const count = field.options.length
      const minimum = field.minSelections ?? 0
      const maximum = field.maxSelections ?? count
      if (
        !Number.isInteger(minimum) ||
        !Number.isInteger(maximum) ||
        minimum < 0 ||
        maximum < 1 ||
        maximum > count ||
        minimum > maximum
      )
        return `Selection limits for "${name}" must be whole numbers: minimum 0 or greater, maximum 1–${count}, and minimum no greater than maximum.`
      if (field.defaultSelections != null) {
        if (
          !Array.isArray(field.defaultSelections) ||
          field.defaultSelections.some(
            (choice: unknown) =>
              !choice ||
              typeof choice !== 'object' ||
              !('value' in choice) ||
              typeof choice.value !== 'string',
          )
        )
          return `Initial selections for "${name}" must contain option values.`
        const defaults = field.defaultSelections.map((choice: { value: string }) => choice.value)
        // An empty starting state is always allowed; visitors satisfy required/minimum rules.
        const { errors } = validateFormSubmission({
          fields: [{ ...field, required: false, minSelections: defaults.length ? minimum : 0 }],
          values: { [name]: defaults },
        })
        if (errors[name]) return `Initial selections: ${errors[name]}`
      }
    }
    // Validate defaults only after choice definitions are known to be well formed.
    if (
      field.type !== 'file' &&
      !isBooleanFormFieldType(field.type) &&
      !isMultipleChoiceFormFieldType(field.type) &&
      field.defaultValue != null
    ) {
      if (typeof field.defaultValue !== 'string')
        return `The initial answer for "${name}" must contain text.`
      const { errors } = validateFormSubmission({
        fields: [{ ...field, required: false }],
        values: { [name]: field.defaultValue },
      })
      if (errors[name]) return `Initial answer: ${errors[name]}`
    }
  }

  return true
}

export const REVIEW_SUBMISSION_FIELD_NAMES = [
  'isGenuineExperience',
  'rating',
  'reviewBody',
  'reviewerEmail',
  'reviewerName',
  'reviewTitle',
  'subjectLabel',
] as const

const reviewSubmissionProvidedFieldNames = new Set<string>(REVIEW_SUBMISSION_FIELD_NAMES)

export const validateFormFieldDefinitionsForIntent = ({
  fields,
  submissionIntent,
}: {
  fields: unknown
  submissionIntent: unknown
}): true | string => {
  const fieldValidation = validateFormFieldDefinitions(fields)
  if (
    fieldValidation !== true ||
    !Array.isArray(fields) ||
    !isReviewFormSubmissionIntent(submissionIntent)
  ) {
    return fieldValidation
  }

  if (
    fields.some((field) =>
      [
        'url',
        'number',
        'radio',
        'checkboxGroup',
        'multiSelect',
        'switch',
        'date',
        'time',
        'file',
      ].includes(field.type),
    )
  ) {
    return 'URL, Number, choice, Switch, Date and Time questions require a General/Lead Form with Generic Form or Contact Cards & Form. Change the intent or choose a supported fixed Review control.'
  }
  if (fields.some((field) => Object.keys(getFormFieldConfiguration(field)).length)) {
    return 'Help text, initial answers and character limits require Generic Form or Contact Cards & Form. The fixed Review Submission presentation does not render them.'
  }

  const unsupportedRequiredField = fields.find((field): field is { name: string; required: true } =>
    Boolean(
      field &&
      typeof field === 'object' &&
      'required' in field &&
      field.required === true &&
      'name' in field &&
      typeof field.name === 'string' &&
      !reviewSubmissionProvidedFieldNames.has(normalizeFormFieldName(field.name)),
    ),
  )

  return unsupportedRequiredField
    ? `Review Submission cannot render required field "${normalizeFormFieldName(unsupportedRequiredField.name)}".`
    : true
}

const normalizeCheckboxValue = (value: unknown): boolean => {
  return value === true || value === 'true' || value === 'on' || value === '1' || value === 1
}

const normalizeTextValue = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const getFieldValueMaxLength = (type: FormFieldType): number | null => {
  if (type === 'date') return 10
  if (type === 'time') return 5
  if (type === 'url') return FORM_MAX_URL_LENGTH
  if (type === 'number') return FORM_MAX_NUMBER_LENGTH
  if (type === 'email') {
    return FORM_MAX_EMAIL_LENGTH
  }

  if (type === 'text') {
    return FORM_MAX_SINGLE_LINE_LENGTH
  }

  if (type === 'phone') {
    return FORM_PHONE_MAX_INPUT_LENGTH
  }

  if (type === 'textarea') {
    return FORM_MAX_TEXTAREA_LENGTH
  }

  return null
}

export const supportsFormTextLimits = (type: FormFieldType): boolean =>
  type === 'text' || type === 'textarea'

export const getFormFieldMaxLength = (field: SimpleFormField): number | undefined => {
  const cap = getFieldValueMaxLength(field.type)
  if (cap === null) return undefined
  return supportsFormTextLimits(field.type) &&
    Number.isInteger(field.maxLength) &&
    field.maxLength! > 0
    ? Math.min(field.maxLength!, cap)
    : cap
}

export const isValidFormURL = (value: string): boolean => {
  if (!/^https?:\/\//i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false
  try {
    const url = new URL(value)
    return (
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      (url.protocol === 'http:' || url.protocol === 'https:')
    )
  } catch {
    return false
  }
}

/** Include only active, meaningful configuration; legacy revisions stay unchanged. */
export const getFormFieldConfiguration = (field: SimpleFormField) => ({
  ...(field.helpText ? { helpText: field.helpText } : {}),
  ...(field.type === 'file' ? getFormFilePolicy(field) : {}),
  ...(field.type === 'date' && field.minDate ? { minDate: field.minDate } : {}),
  ...(field.type === 'date' && field.maxDate ? { maxDate: field.maxDate } : {}),
  ...(field.type === 'time' && field.minTime ? { minTime: field.minTime } : {}),
  ...(field.type === 'time' && field.maxTime ? { maxTime: field.maxTime } : {}),
  ...(field.type === 'number' && field.minValue != null ? { minValue: field.minValue } : {}),
  ...(field.type === 'number' && field.maxValue != null ? { maxValue: field.maxValue } : {}),
  ...(field.type === 'number' && field.step != null ? { step: field.step } : {}),
  ...(isMultipleChoiceFormFieldType(field.type) && field.defaultSelections?.length
    ? { defaultSelections: field.defaultSelections.map(({ value }) => ({ value })) }
    : {}),
  ...(isMultipleChoiceFormFieldType(field.type) && field.minSelections != null
    ? { minSelections: field.minSelections }
    : {}),
  ...(isMultipleChoiceFormFieldType(field.type) && field.maxSelections != null
    ? { maxSelections: field.maxSelections }
    : {}),
  ...(field.type !== 'file' &&
  !isBooleanFormFieldType(field.type) &&
  !isMultipleChoiceFormFieldType(field.type) &&
  typeof field.defaultValue === 'string' &&
  field.defaultValue.trim()
    ? { defaultValue: field.defaultValue.trim() }
    : {}),
  ...(isBooleanFormFieldType(field.type) && field.defaultChecked === true
    ? { defaultChecked: true }
    : {}),
  ...(supportsFormTextLimits(field.type) && field.minLength != null
    ? { minLength: field.minLength }
    : {}),
  ...(supportsFormTextLimits(field.type) && field.maxLength != null
    ? { maxLength: field.maxLength }
    : {}),
})

/** Defaults are presentation-only. Intake must validate the answers actually sent. */
export const getFormInitialAnswers = (fields: SimpleFormField[]): FormAnswers =>
  Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === 'file'
        ? []
        : isBooleanFormFieldType(field.type)
          ? field.defaultChecked === true && !field.required
          : isMultipleChoiceFormFieldType(field.type)
            ? (field.options ?? [])
                .filter((option) =>
                  field.defaultSelections?.some((choice) => choice.value === option.value),
                )
                .map((option) => option.value)
            : (field.defaultValue?.trim() ?? ''),
    ]),
  )

const formatCharacterLimit = (value: number): string => {
  return value.toLocaleString('en-US')
}

export const isFormSubmissionValues = (value: unknown): value is FormSubmissionValues => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export const validateFormSubmission = ({
  additionalFieldNames = [],
  fields,
  values,
}: {
  // Only the fixed review engine supplies additional names; it validates their values.
  additionalFieldNames?: readonly string[]
  fields: SimpleFormField[]
  values: unknown
}): {
  errors: FormSubmissionErrors
  normalizedData: FormAnswers
} => {
  const errors: FormSubmissionErrors = {}
  const normalizedData: FormAnswers = {}

  if (!isFormSubmissionValues(values)) {
    return {
      errors: {
        values: 'Submitted values must be an object.',
      },
      normalizedData,
    }
  }

  const submittedNames = Object.keys(values).filter((name) => name !== FORM_HONEYPOT_FIELD_NAME)
  if (submittedNames.length > FORM_MAX_FIELDS) {
    return {
      errors: {
        values: `Submit no more than ${FORM_MAX_FIELDS} fields.`,
      },
      normalizedData,
    }
  }

  const allowedNames = new Set([...fields.map((field) => field.name), ...additionalFieldNames])
  if (submittedNames.some((name) => !allowedNames.has(name))) {
    errors.values = 'Submitted values include fields that are not in this form.'
  }
  if (
    Object.hasOwn(values, FORM_HONEYPOT_FIELD_NAME) &&
    typeof values[FORM_HONEYPOT_FIELD_NAME] !== 'string'
  ) {
    errors.values = 'Submitted values contain an invalid field.'
  }

  for (const field of fields) {
    const rawValue = Object.hasOwn(values, field.name) ? values[field.name] : undefined

    if (field.type === 'file') {
      const tokens = rawValue === undefined ? [] : rawValue
      if (
        !validateFormFilePolicy(field) ||
        !Array.isArray(tokens) ||
        tokens.length > getFormFilePolicy(field).maxFiles ||
        tokens.some((token) => !isUploadToken(token)) ||
        new Set(tokens).size !== tokens.length
      ) {
        errors[field.name] = `${field.label}: choose valid files within the listed limits.`
        continue
      }
      normalizedData[field.name] = [...tokens]
      if (field.required && !tokens.length)
        errors[field.name] = `${field.label}: upload at least one file.`
      continue
    }

    if (isBooleanFormFieldType(field.type)) {
      if (field.type === 'switch' && rawValue !== undefined && typeof rawValue !== 'boolean') {
        errors[field.name] = `${field.label} must be true or false.`
        continue
      }
      // Keep finite legacy HTML checkbox encodings; reject arbitrary coercion.
      if (rawValue !== undefined && !checkboxValues.has(rawValue)) {
        errors[field.name] = `${field.label} must be a checkbox value.`
        continue
      }
      const normalizedValue = normalizeCheckboxValue(rawValue)
      normalizedData[field.name] = normalizedValue

      if (field.required && !normalizedValue) {
        errors[field.name] =
          field.type === 'switch'
            ? `${field.label} must be turned on.`
            : `${field.label} must be accepted.`
      }

      continue
    }

    if (isMultipleChoiceFormFieldType(field.type)) {
      const selected = rawValue === undefined ? [] : rawValue
      if (
        !Array.isArray(selected) ||
        selected.length > FORM_MAX_CHOICES ||
        selected.some((value) => typeof value !== 'string')
      ) {
        errors[field.name] =
          `${field.label} must contain a list of option values (up to ${FORM_MAX_CHOICES}).`
        continue
      }
      const allowed = new Set((field.options ?? []).map((option) => option.value))
      if (
        new Set(selected).size !== selected.length ||
        selected.some((value) => !allowed.has(value))
      ) {
        errors[field.name] = `${field.label} contains an invalid or duplicate option.`
        continue
      }
      // Selections are sets; authored option order makes storage and browser retries stable.
      normalizedData[field.name] = (field.options ?? [])
        .filter((option) => selected.includes(option.value))
        .map((option) => option.value)
      const minimum = Math.max(field.required ? 1 : 0, field.minSelections ?? 0)
      const maximum = field.maxSelections ?? field.options?.length ?? FORM_MAX_CHOICES
      if (selected.length < minimum)
        errors[field.name] =
          `${field.label}: choose at least ${minimum} option${minimum === 1 ? '' : 's'}.`
      else if (selected.length > maximum)
        errors[field.name] =
          `${field.label}: choose no more than ${maximum} option${maximum === 1 ? '' : 's'}.`
      continue
    }

    if (rawValue !== undefined && typeof rawValue !== 'string') {
      errors[field.name] = `${field.label} must contain text.`
      continue
    }
    const normalizedValue = normalizeTextValue(rawValue)
    normalizedData[field.name] = normalizedValue

    const maxLength = getFormFieldMaxLength(field)

    if (maxLength !== undefined && normalizedValue.length > maxLength) {
      errors[field.name] =
        `${field.label} must be ${formatCharacterLimit(maxLength)} characters or fewer.`
      continue
    }

    if (field.required && !normalizedValue) {
      errors[field.name] = `${field.label} is required.`
      continue
    }

    if (
      supportsFormTextLimits(field.type) &&
      normalizedValue &&
      field.minLength != null &&
      normalizedValue.length < field.minLength
    ) {
      errors[field.name] =
        `${field.label} must be at least ${formatCharacterLimit(field.minLength)} characters.`
      continue
    }

    if (field.type === 'email' && normalizedValue && !emailPattern.test(normalizedValue)) {
      errors[field.name] = `${field.label} must be a valid email address.`
      continue
    }

    if (field.type === 'url' && normalizedValue && !isValidFormURL(normalizedValue)) {
      errors[field.name] =
        `${field.label} must be a full http:// or https:// address without spaces or login details.`
      continue
    }
    if (
      isTemporalFormFieldType(field.type) &&
      !validateFormTemporalConstraints(field.type, field)
    ) {
      errors[field.name] = `${field.label} is unavailable because its date/time limits are invalid.`
      continue
    }

    if (field.type === 'number' && normalizedValue) {
      const error = getFormNumberError(normalizedValue, field, field.label)
      if (error) {
        errors[field.name] = error
        continue
      }
    }

    if (isTemporalFormFieldType(field.type) && normalizedValue) {
      const error = getFormTemporalError(normalizedValue, field.type, field, field.label)
      if (error) {
        errors[field.name] = error
        continue
      }
    }

    if (field.type === 'phone' && normalizedValue && !isValidPhoneNumber(normalizedValue)) {
      errors[field.name] = `${field.label} must be a valid phone number.`
      continue
    }

    if (isSelectFormFieldType(field.type) && normalizedValue) {
      const allowedValues = new Set((field.options ?? []).map((option) => option.value))

      if (!allowedValues.has(normalizedValue)) {
        errors[field.name] = `${field.label} contains an invalid option.`
      }
    }
  }

  return {
    errors,
    normalizedData,
  }
}

const getFirstNormalizedStringValue = (
  values: FormAnswers,
  candidateKeys: string[],
): string | undefined => {
  for (const key of candidateKeys) {
    const rawValue = values[key]

    if (typeof rawValue !== 'string') {
      continue
    }

    const normalizedValue = rawValue.trim()

    if (normalizedValue) {
      return normalizedValue
    }
  }

  return undefined
}

export const getSubmissionContactMetadata = (
  values: FormAnswers,
  fields: SimpleFormField[] = [],
): {
  email?: string
  name?: string
  phone?: string
} => {
  const getContactValue = (role: FormContactRole, legacyKeys: string[]) => {
    const mappedField = fields.find((field) => field.contactRole === role)
    // New generic controls may legitimately use a legacy contact key for another
    // question. Keep legacy presentation aliases, but never reinterpret new generic control answers.
    const compatibleLegacyKeys = legacyKeys.filter(
      (key) =>
        !fields.some(
          (field) =>
            field.name === key &&
            [
              'url',
              'number',
              'radio',
              'checkboxGroup',
              'multiSelect',
              'switch',
              'file',
              'date',
              'time',
            ].includes(field.type),
        ),
    )
    return getFirstNormalizedStringValue(
      values,
      mappedField ? [mappedField.name] : compatibleLegacyKeys,
    )
  }
  const email = getContactValue('email', ['submitterEmail', 'reviewerEmail', 'email'])
  const name = getContactValue('name', ['submitterName', 'reviewerName', 'fullName', 'name'])
  const phone = getContactValue('phone', [
    'submitterPhone',
    'phone',
    'phoneNumber',
    'telephone',
    'mobile',
  ])

  return {
    email,
    name,
    phone,
  }
}

const normalizeOptionalMetadataValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalizedValue = value.trim()

  return normalizedValue || undefined
}

export const normalizeFormSubmissionMetadata = (value: unknown): FormSubmissionMetadata => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const metadata = value as Record<string, unknown>

  return {
    campaign: normalizeOptionalMetadataValue(metadata.campaign),
    landingPage: normalizeOptionalMetadataValue(metadata.landingPage),
    source: normalizeOptionalMetadataValue(metadata.source),
  }
}

export const validateFormSubmissionMetadata = (
  value: unknown,
): {
  errors: FormSubmissionErrors
  normalizedMetadata: FormSubmissionMetadata
} => {
  const normalizedMetadata = normalizeFormSubmissionMetadata(value)
  const errors: FormSubmissionErrors = {}

  if (
    normalizedMetadata.campaign &&
    normalizedMetadata.campaign.length > FORM_MAX_SINGLE_LINE_LENGTH
  ) {
    errors.campaign = `Campaign must be ${formatCharacterLimit(FORM_MAX_SINGLE_LINE_LENGTH)} characters or fewer.`
  }

  if (normalizedMetadata.source && normalizedMetadata.source.length > FORM_MAX_SINGLE_LINE_LENGTH) {
    errors.source = `Source must be ${formatCharacterLimit(FORM_MAX_SINGLE_LINE_LENGTH)} characters or fewer.`
  }

  if (
    normalizedMetadata.landingPage &&
    normalizedMetadata.landingPage.length > FORM_MAX_METADATA_URL_LENGTH
  ) {
    errors.landingPage = `Landing page must be ${formatCharacterLimit(FORM_MAX_METADATA_URL_LENGTH)} characters or fewer.`
  }

  return {
    errors,
    normalizedMetadata,
  }
}
