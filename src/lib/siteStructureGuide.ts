import { hasFeature } from '@/access/featureAccess'
import type { OnboardingAction, OnboardingTask } from './adminOnboardingShared'

/** Personal help only; native settings and feature grants remain authoritative. */
export const SITE_STRUCTURE_GUIDE_KEY = 'forma-site-structure-guide-v1'

export function getSiteStructureDestination(user: unknown): OnboardingAction | null {
  return hasFeature(user, 'layoutDefaults')
    ? { label: 'Review homepage and navigation', href: '/admin/globals/page-settings' }
    : null
}

export function getMenuEditingDestination(user: unknown): OnboardingAction | null {
  if (hasFeature(user, 'headers'))
    return { label: 'Open Headers', href: '/admin/collections/headers' }
  if (hasFeature(user, 'footers'))
    return { label: 'Open Footers', href: '/admin/collections/footers' }
  return null
}

export function getSiteStructureTask(input: {
  menuAction: OnboardingAction | null
  hasHomepageSelection: boolean
  modified: boolean
  processing: boolean
  hasPublishedDoc: boolean
  collapsed: boolean
  preferenceUnavailable?: boolean
}): OnboardingTask {
  const action = input.hasHomepageSelection
    ? (input.menuAction ?? { label: 'Review homepage selection', href: '#field-homepage' })
    : { label: 'Choose a homepage', href: '#field-homepage' }
  const base = {
    guideLabel: 'Homepage and navigation',
    collapsed: input.collapsed,
    dismissible: true,
    preferenceUnavailable: input.preferenceUnavailable,
  }
  if (input.processing)
    return {
      ...base,
      title: 'Layout update in progress',
      description:
        'Wait for Payload to confirm the save. If it fails, correct the reported fields and try again. Your selection is not confirmation of a public change.',
      action: { ...action, disabled: true },
    }
  if (input.modified)
    return {
      ...base,
      title: 'Save your layout settings before continuing',
      description:
        'Use Save Draft to stage this homepage, header or footer selection. Publish applies these site-wide defaults. Wait for confirmation before opening another screen.',
      action: { ...action, disabled: true },
    }
  return {
    ...base,
    title: input.hasHomepageSelection
      ? 'Review how visitors find your pages'
      : 'Choose what visitors see at the homepage',
    description:
      'Homepage chooses a published page for /. Publishing a page does not make it the homepage or add a menu item. Header and Footer are defaults; pages may override them. ' +
      (input.menuAction
        ? 'Add menu items in the selected Header or Footer and publish that record. '
        : 'Ask an Admin to edit menus if you lack Header or Footer access. ') +
      (input.hasPublishedDoc
        ? 'Save Draft keeps public settings unchanged; Publish applies these site-wide choices.'
        : 'Save Draft stages these site-wide choices. Publish, then check / on the website.'),
    action,
  }
}
