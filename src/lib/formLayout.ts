import { validateFormFieldDefinitionsForIntent, type SimpleFormField } from '@/lib/forms'

/** Public presentation only. Questions remain independent typed answer definitions. */
export type FormLayoutEntry =
  | { kind: 'question'; name: string }
  | { kind: 'heading' | 'description'; text: string }
  | { kind: 'separator' }
  | { kind: 'group'; label: string; description?: string; questions: string[] }

export const FORM_MAX_LAYOUT_ENTRIES = 200
export function validateFormLayout(value: unknown, fields: SimpleFormField[]): true | string {
  if (value == null) return true
  if (!Array.isArray(value) || !value.length || value.length > FORM_MAX_LAYOUT_ENTRIES)
    return 'Add 1–200 layout entries.'
  const names: string[] = []
  const text = (v: unknown, max: number) =>
    typeof v === 'string' && Boolean(v.trim()) && v.length <= max
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return 'Invalid layout entry.'
    switch (entry.kind) {
      case 'question':
        if (typeof entry.name !== 'string') return 'Invalid question reference.'
        names.push(entry.name)
        break
      case 'heading':
        if (!text(entry.text, 200)) return 'Headings need 1–200 characters.'
        break
      case 'description':
        if (!text(entry.text, 2000)) return 'Descriptions need 1–2,000 characters.'
        break
      case 'separator':
        break
      case 'group':
        if (!text(entry.label, 200)) return 'Groups need a label of 1–200 characters.'
        if (
          entry.description != null &&
          (typeof entry.description !== 'string' || entry.description.length > 2000)
        )
          return 'Group descriptions allow up to 2,000 characters.'
        if (
          !Array.isArray(entry.questions) ||
          !entry.questions.length ||
          entry.questions.length > 100 ||
          entry.questions.some((name: unknown) => typeof name !== 'string')
        )
          return 'Groups need 1–100 question references.'
        names.push(...entry.questions)
        break
      default:
        return 'Unsupported layout entry.'
    }
  }
  if (names.length !== fields.length || names.some((name, i) => name !== fields[i].name))
    return 'Layout must include every question exactly once in its defined order.'
  return true
}

export type FormEntry = { [K in keyof SimpleFormField]?: SimpleFormField[K] | null } & {
  entryType?: 'question' | 'heading' | 'description' | 'separator' | 'group' | null
  displayText?: string | null
  groupDescription?: string | null
  questions?: Partial<SimpleFormField>[] | null
}

/** Call definition validation before trusting these projected questions. Never recurse. */
export function getFormQuestions(entries: FormEntry[] = []): SimpleFormField[] {
  return entries.flatMap<FormEntry>((entry) =>
    entry.entryType === 'group'
      ? (entry.questions ?? [])
      : entry.entryType == null || entry.entryType === 'question'
        ? [entry]
        : [],
  ) as SimpleFormField[]
}

export function projectFormLayout(entries: FormEntry[]): FormLayoutEntry[] | undefined {
  if (entries.every((entry) => entry.entryType == null || entry.entryType === 'question'))
    return undefined
  return entries.map((entry) => {
    switch (entry.entryType) {
      case 'heading':
      case 'description':
        return { kind: entry.entryType, text: entry.displayText!.trim() }
      case 'separator':
        return { kind: 'separator' }
      case 'group':
        return {
          kind: 'group',
          label: entry.displayText!.trim(),
          ...(entry.groupDescription?.trim() ? { description: entry.groupDescription.trim() } : {}),
          questions: (entry.questions ?? []).map((question) => question.name!),
        }
      default:
        return { kind: 'question', name: entry.name! }
    }
  })
}

export function validateFormEntries(value: unknown, submissionIntent?: unknown): true | string {
  if (!Array.isArray(value) || !value.length || value.length > FORM_MAX_LAYOUT_ENTRIES)
    return 'Add 1–200 form entries, including at least one question.'
  const ids = new Set<string>()
  const identity = (entry: Record<string, unknown>) => {
    if (entry.id == null) return true // Legacy rows may not have Payload IDs yet.
    if (typeof entry.id !== 'string' || !entry.id.trim() || ids.has(entry.id)) return false
    ids.add(entry.id)
    return true
  }
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry))
      return 'Each entry must be a valid object.'
    if (!identity(entry))
      return 'Every entry and question must have a unique, non-empty row identity.'
    if (
      entry.entryType != null &&
      !['question', 'heading', 'description', 'separator', 'group'].includes(entry.entryType)
    )
      return 'Unsupported form entry type.'
    if (entry.entryType === 'group') {
      if (
        !Array.isArray(entry.questions) ||
        !entry.questions.length ||
        entry.questions.length > 100
      )
        return 'Each group needs 1–100 questions.'
      for (const question of entry.questions) {
        if (
          !question ||
          typeof question !== 'object' ||
          Array.isArray(question) ||
          (question.entryType != null && question.entryType !== 'question') ||
          question.questions != null
        )
          return 'Groups can contain questions only; nested groups are not supported.'
        if (!identity(question))
          return 'Every entry and question must have a unique, non-empty row identity.'
      }
    }
  }
  const questions = getFormQuestions(value)
  const validation = validateFormFieldDefinitionsForIntent({ fields: questions, submissionIntent })
  if (validation !== true) return validation
  if (
    submissionIntent === 'review' &&
    value.some((entry) => entry.entryType != null && entry.entryType !== 'question')
  )
    return 'Review Submission has fixed questions and cannot use layout entries. Choose General or Lead for a dynamic form.'
  // Validate text before projection: never coerce malformed authoring configuration.
  for (const entry of value) {
    if (['heading', 'description', 'group'].includes(entry.entryType)) {
      const max = entry.entryType === 'description' ? 2000 : 200
      if (
        typeof entry.displayText !== 'string' ||
        !entry.displayText.trim() ||
        entry.displayText.length > max
      )
        return `${entry.entryType === 'group' ? 'Group labels' : entry.entryType === 'heading' ? 'Headings' : 'Descriptions'} need 1–${max.toLocaleString('en-US')} characters.`
    }
    if (
      entry.entryType === 'group' &&
      entry.groupDescription != null &&
      (typeof entry.groupDescription !== 'string' || entry.groupDescription.length > 2000)
    )
      return 'Group descriptions allow up to 2,000 characters.'
  }
  return validateFormLayout(projectFormLayout(value), questions)
}
