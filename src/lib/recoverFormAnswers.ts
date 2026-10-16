import {
  isCompatibleFormFile,
  getFormFilePolicy,
  type UploadedFormFile,
} from '@/lib/formAttachments'
import type { FormAnswers } from '@/lib/forms'
import {
  isMultipleChoiceFormFieldType,
  isBooleanFormFieldType,
  validateFormSubmission,
  type SimpleFormField,
} from '@/lib/forms'

/** Preserve meaning by stable identity, never by a matching label or machine name. */
export function recoverFormAnswers(
  previous: SimpleFormField[],
  next: SimpleFormField[],
  answers: FormAnswers,
  files: ReadonlyMap<string, UploadedFormFile> = new Map(),
) {
  const values: FormAnswers = Object.fromEntries(
    next.map((field) => [
      field.name,
      field.type === 'file'
        ? []
        : isBooleanFormFieldType(field.type)
          ? false
          : isMultipleChoiceFormFieldType(field.type)
            ? []
            : '',
    ]),
  )
  const partiallyClearedLabels = new Set<string>()
  const clearedLabels = new Set<string>()
  const unique = (fields: SimpleFormField[], id: string) =>
    fields.filter((field) => field.id === id).length === 1
  for (const old of previous) {
    const value = answers[old.name]
    if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) continue
    const id = old.id
    const field =
      typeof id === 'string' && id && unique(previous, id) && unique(next, id)
        ? next.find((candidate) => candidate.id === id && candidate.type === old.type)
        : undefined
    if (field) {
      const compatible =
        field.type === 'file' && Array.isArray(value)
          ? value.filter((token) => {
              const file = files.get(token)
              return Boolean(file && isCompatibleFormFile(file, field))
            })
          : isMultipleChoiceFormFieldType(field.type) && Array.isArray(value)
            ? value.filter((item) => field.options?.some((option) => option.value === item))
            : value
      if (
        field.type === 'file' &&
        Array.isArray(compatible) &&
        compatible.length > getFormFilePolicy(field).maxFiles
      ) {
        clearedLabels.add(old.label)
        continue
      }
      if (Array.isArray(value) && Array.isArray(compatible) && compatible.length !== value.length)
        partiallyClearedLabels.add(old.label)
      const { errors, normalizedData } = validateFormSubmission({
        fields: [{ ...field, visibilityConditions: [], requiredWhenVisible: false }],
        values: { [field.name]: compatible },
      })
      if (!Object.keys(errors).length) {
        values[field.name] = normalizedData[field.name]
        continue
      }
    }
    partiallyClearedLabels.delete(old.label)
    clearedLabels.add(old.label)
  }
  return {
    values,
    clearedLabels: [...clearedLabels],
    partiallyClearedLabels: [...partiallyClearedLabels],
  }
}
