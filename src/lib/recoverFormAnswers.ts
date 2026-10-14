import { validateFormSubmission, type SimpleFormField } from '@/lib/forms'

/** Preserve meaning by stable identity, never by a matching label or machine name. */
export function recoverFormAnswers(
  previous: SimpleFormField[],
  next: SimpleFormField[],
  answers: Record<string, boolean | string>,
) {
  const values: Record<string, boolean | string> = Object.fromEntries(
    next.map((field) => [field.name, field.type === 'checkbox' ? false : '']),
  )
  const clearedLabels = new Set<string>()
  const unique = (fields: SimpleFormField[], id: string) =>
    fields.filter((field) => field.id === id).length === 1
  for (const old of previous) {
    const value = answers[old.name]
    if (value === undefined || value === '') continue
    const id = old.id
    const field =
      typeof id === 'string' && id && unique(previous, id) && unique(next, id)
        ? next.find((candidate) => candidate.id === id && candidate.type === old.type)
        : undefined
    if (field) {
      const { errors, normalizedData } = validateFormSubmission({
        fields: [field],
        values: { [field.name]: value },
      })
      if (!Object.keys(errors).length) {
        values[field.name] = normalizedData[field.name]
        continue
      }
    }
    clearedLabels.add(old.label)
  }
  return { values, clearedLabels: [...clearedLabels] }
}
