/**
 * Website theme registry.
 *
 * To add a new website theme:
 * 1. Create `src/styles/themes/theme-<name>.css`
 * 2. Import that file in `src/styles/globals.css`
 * 3. Add one entry here with a stable `value` and admin-facing `label`
 *
 * Payload Theme Settings and frontend runtime validation both read from this file.
 */
export const websiteThemes = [
  { label: 'Default', value: 'default' },
  { label: 'Blue', value: 'blue' },
  { label: 'Sera', value: 'sera' },
] as const

export type WebsiteThemeValue = (typeof websiteThemes)[number]['value']

export const defaultWebsiteTheme: WebsiteThemeValue = 'default'

export const websiteThemeValues = websiteThemes.map(({ value }) => value) as readonly WebsiteThemeValue[]

export const websiteThemeOptions = websiteThemes.map(({ label, value }) => ({
  label,
  value,
}))

export function isWebsiteTheme(value: string): value is WebsiteThemeValue {
  return websiteThemeValues.includes(value as WebsiteThemeValue)
}
