/** A personal display preference, never permission or readiness authority. */
export const ONBOARDING_PREFERENCE_KEY = 'forma-getting-started-v1'
export type OnboardingTask = {
  title: string
  description: string
  action: { label: string; href: string }
  collapsed: boolean
  dismissible: boolean
  preferenceUnavailable?: boolean
}
