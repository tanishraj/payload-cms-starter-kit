/** A personal display preference, never permission or readiness authority. */
export const ONBOARDING_PREFERENCE_KEY = 'forma-getting-started-v1'
export type OnboardingAction = {
  label: string
  href: string
  target?: '_blank'
  disabled?: boolean
}
export type OnboardingTask = {
  title: string
  description: string
  action: OnboardingAction
  collapsed: boolean
  dismissible: boolean
  preferenceUnavailable?: boolean
}
