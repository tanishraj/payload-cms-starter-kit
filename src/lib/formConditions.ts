import type { SimpleFormField } from '@/lib/forms'

export type FormConditionOperator = 'equals' | 'notEquals' | 'answered' | 'unanswered'

export type FormVisibilityCondition = {
  fieldID: string
  operator: FormConditionOperator
  value?: string
}

const isMeaningfulAnswer = (value: unknown): boolean =>
  typeof value === 'boolean'
    ? value
    : Array.isArray(value)
      ? value.length > 0
      : typeof value === 'string' && value.trim().length > 0

export function isFormFieldVisible(
  field: Pick<SimpleFormField, 'id' | 'visibilityConditions'>,
  fields: SimpleFormField[],
  values: Record<string, unknown>,
): boolean {
  const conditions = Array.isArray(field.visibilityConditions) ? field.visibilityConditions : []
  if (!conditions.length) return true

  return conditions.every((condition) => {
    const source = fields.find((candidate) => candidate.id === condition.fieldID)
    // Fail closed. Complete form definitions reject invalid references; a partial
    // or unexpectedly incomplete runtime schema must never reveal the dependent field.
    if (!source) return false
    const answer = values[source.name]
    const answered = isMeaningfulAnswer(answer)
    if (condition.operator === 'answered') return answered
    if (condition.operator === 'unanswered') return !answered
    const actual = Array.isArray(answer)
      ? answer.map(String)
      : [typeof answer === 'string' ? answer.trim() : String(answer ?? '')]
    const matches = actual.includes(condition.value ?? '')
    return condition.operator === 'equals' ? matches : !matches
  })
}

export function getVisibleFormFields(
  fields: SimpleFormField[],
  values: Record<string, unknown>,
): SimpleFormField[] {
  return fields.filter((field) => isFormFieldVisible(field, fields, values))
}

export function validateFormVisibilityConditions(fields: SimpleFormField[]): true | string {
  const ids = new Set(fields.flatMap((field) => (field.id ? [field.id] : [])))
  for (const field of fields) {
    if (field.visibilityConditions != null && !Array.isArray(field.visibilityConditions))
      return `Visibility rules for “${field.label}” must be a list of conditions.`
    const conditions = field.visibilityConditions ?? []
    if (conditions.length && !field.id)
      return `“${field.label}” needs a stable question identity before it can use visibility rules.`
    for (const condition of conditions) {
      if (
        !condition ||
        typeof condition.fieldID !== 'string' ||
        !ids.has(condition.fieldID) ||
        condition.fieldID === field.id ||
        (condition.operator !== 'equals' &&
          condition.operator !== 'notEquals' &&
          condition.operator !== 'answered' &&
          condition.operator !== 'unanswered') ||
        ((condition.operator === 'equals' || condition.operator === 'notEquals') &&
          (typeof condition.value !== 'string' || !condition.value.trim() || condition.value.length > 500))
      )
        return `Visibility rules for “${field.label}” are invalid. Choose another question and check the comparison value.`
      const sourceIndex = fields.findIndex((candidate) => candidate.id === condition.fieldID)
      const fieldIndex = fields.indexOf(field)
      if (sourceIndex >= fieldIndex)
        return `Visibility for “${field.label}” can only depend on an earlier question.`
      const source = fields[sourceIndex]
      if (
        source.type === 'file' &&
        condition.operator !== 'answered' &&
        condition.operator !== 'unanswered'
      )
        return `File questions only support “has an answer” or “has no answer” conditions.`
      if (
        ['checkbox', 'switch'].includes(source.type) &&
        ['equals', 'notEquals'].includes(condition.operator) &&
        !['true', 'false'].includes(condition.value ?? '')
      )
        return `Choose Yes or No for the rule based on “${source.label}”.`
      if (
        ['select', 'radio', 'checkboxGroup', 'multiSelect'].includes(source.type) &&
        ['equals', 'notEquals'].includes(condition.operator) &&
        !(source.options ?? []).some((option) => option.value === condition.value)
      )
        return `Choose an available option for the rule based on “${source.label}”.`
    }
  }
  return true
}
