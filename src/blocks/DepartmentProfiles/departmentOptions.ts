import type { OptionObject } from 'payload'

export type DepartmentFormFieldState = {
  value?: unknown
}

export type DepartmentFormFields = Record<string, DepartmentFormFieldState | undefined>

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getBlockPrefix = (path: string): string | undefined => {
  const match = path.match(/^(.*)\.profiles\.\d+\.departmentId$/)
  return match?.[1]
}

export const getDepartmentOptionsFromFormFields = (
  fields: DepartmentFormFields,
  path: string,
  currentValue?: string | null,
): OptionObject[] => {
  const blockPrefix = getBlockPrefix(path)
  if (!blockPrefix)
    return currentValue ? [{ label: 'Unavailable department', value: currentValue }] : []

  const departmentNamePattern = new RegExp(
    `^${escapeRegExp(blockPrefix)}\\.departments\\.(\\d+)\\.name$`,
  )
  const rows = new Map<number, { id?: string; name?: string }>()

  for (const [fieldPath, fieldState] of Object.entries(fields)) {
    const match = fieldPath.match(departmentNamePattern)
    if (!match) continue

    const index = Number(match[1])
    const name = typeof fieldState?.value === 'string' ? fieldState.value.trim() : ''
    const idState = fields[`${blockPrefix}.departments.${index}.id`]
    const id = typeof idState?.value === 'string' ? idState.value : undefined
    rows.set(index, { id, name })
  }

  const options = [...rows.entries()]
    .sort(([left], [right]) => left - right)
    .flatMap(([, row]) => (row.id && row.name ? [{ label: row.name, value: row.id }] : []))

  if (currentValue && !options.some(({ value }) => value === currentValue)) {
    options.push({ label: 'Unavailable department', value: currentValue })
  }

  return options
}
