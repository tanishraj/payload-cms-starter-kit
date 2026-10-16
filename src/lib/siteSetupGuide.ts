import { hasFeature } from '@/access/featureAccess'
import type { OnboardingAction, OnboardingTask } from './adminOnboardingShared'

/** Personal visibility only; native globals retain all settings and permission authority. */
export const SITE_SETUP_GUIDE_KEY = 'forma-site-setup-guide-v1'
export type SiteSetupGlobal = 'site-settings' | 'theme-settings'

export function getSiteSetupDestination(user: unknown): OnboardingAction | null {
  if (hasFeature(user, 'siteIdentity'))
    return { label: 'Review site settings', href: '/admin/globals/site-settings' }
  if (hasFeature(user, 'appearance'))
    return { label: 'Review website appearance', href: '/admin/globals/theme-settings' }
  return null
}

export function getSiteSetupTask(input: {
  globalSlug: SiteSetupGlobal
  canOpenAppearance: boolean
  modified: boolean
  processing: boolean
  hasPublishedDoc: boolean
  collapsed: boolean
  preferenceUnavailable?: boolean
}): OnboardingTask {
  const identity = input.globalSlug === 'site-settings'
  const action =
    identity && input.canOpenAppearance
      ? { label: 'Review website appearance', href: '/admin/globals/theme-settings' }
      : { label: 'Return to Dashboard', href: '/admin' }
  const base = {
    guideLabel: 'Site setup',
    collapsed: input.collapsed,
    dismissible: true,
    preferenceUnavailable: input.preferenceUnavailable,
  }
  if (input.processing)
    return {
      ...base,
      title: 'Settings update in progress',
      description:
        'Wait for Payload to confirm the result. If saving fails, correct the reported fields and try again. A pending request is not a saved change.',
      action: { ...action, disabled: true },
    }
  if (input.modified)
    return {
      ...base,
      title: 'Save your settings before continuing',
      description:
        'Your edits are not saved yet. Use Save Draft above to stage them, or Publish when they are ready for the public website. Wait for confirmation before opening the next screen.',
      action: { ...action, disabled: true },
    }
  return {
    ...base,
    title: identity ? 'Review your site identity' : 'Review your website appearance',
    description:
      (identity
        ? 'Set your site name and logo in Brand. In Regional, review Site Timezone for event dates and calendar boundaries. Existing values stay in place.'
        : 'Choose a preset and System, Light or Dark for the website. Keep the current defaults if they suit your site.') +
      ' Save Draft stages changes; Publish applies them to the website.' +
      (input.hasPublishedDoc
        ? ' An existing public version stays active until Publish.'
        : ' Until Publish, the website uses its published settings or existing fallbacks.'),
    action,
  }
}
