/** Source-supported presentation only; never answer validation or arbitrary CSS. */
export type FormAppearance = {
  width?: 'default' | 'narrow' | 'wide' | 'full' | null
  spacing?: 'default' | 'compact' | null
  columns?: 'default' | 'one' | 'two' | null
  buttonVariant?: 'default' | 'outline' | 'secondary' | null
  buttonSize?: 'default' | 'sm' | 'lg' | null
  buttonShape?: 'default' | 'pill' | null
  buttonWidth?: 'default' | 'content' | null
}

const choices = {
  width: ['default', 'narrow', 'wide', 'full'],
  spacing: ['default', 'compact'],
  columns: ['default', 'one', 'two'],
  buttonVariant: ['default', 'outline', 'secondary'],
  buttonSize: ['default', 'sm', 'lg'],
  buttonShape: ['default', 'pill'],
  buttonWidth: ['default', 'content'],
} as const

export function validateFormAppearance(value: unknown): true | string {
  if (value == null) return true
  if (
    typeof value !== 'object' ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
    return 'Choose supported form appearance settings.'
  for (const [key, option] of Object.entries(value)) {
    if (
      !Object.hasOwn(choices, key) ||
      (option != null &&
        !(choices[key as keyof typeof choices] as readonly unknown[]).includes(option))
    )
      return 'Choose supported form appearance settings.'
  }
  return true
}

export function validateFormAppearanceForIntent(value: unknown, intent?: unknown): true | string {
  const validation = validateFormAppearance(value)
  if (validation !== true) return validation
  if (intent === 'review' && projectFormAppearance(value as FormAppearance | null))
    return 'Review Submission has a fixed presentation. Restore default appearance or choose General or Lead for a dynamic form.'
  return true
}

/** Absence, null and explicit defaults are identical for legacy fingerprints. */
export function projectFormAppearance(value?: FormAppearance | null): FormAppearance | undefined {
  if (validateFormAppearance(value) !== true) return undefined
  const active = Object.fromEntries(
    Object.keys(choices).flatMap((key) => {
      const option = value?.[key as keyof FormAppearance]
      return option != null && option !== 'default' ? [[key, option]] : []
    }),
  ) as FormAppearance
  return Object.keys(active).length ? active : undefined
}
