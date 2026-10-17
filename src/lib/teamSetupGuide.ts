import {
  ADMIN_FEATURES,
  getFeatureAccessSummary,
  type AdminFeatureGrants,
  type AdminFeatureKey,
} from '@/access/adminFeatures'
import { scopedSourceFeatures } from '@/access/sectionScope'
import type { OnboardingTask } from './adminOnboardingShared'

export const TEAM_SETUP_GUIDE_KEY = 'forma-team-setup-guide-v1'
const scoped = new Set<AdminFeatureKey>(scopedSourceFeatures)
const labels = (keys: AdminFeatureKey[]) =>
  keys
    .slice(0, 3)
    .map((key) => ADMIN_FEATURES[key].label)
    .join(', ') + (keys.length > 3 ? ` and ${keys.length - 3} more` : '')

/** A preview of native selections, never an authorization decision or a root-validity claim. */
export function getTeamSetupTask(input: {
  role: unknown
  features: AdminFeatureGrants
  sectionCount: number
  modified: boolean
  processing: boolean
  existingAccount: boolean
  collapsed: boolean
  preferenceUnavailable?: boolean
}): OnboardingTask {
  const base = {
    guideLabel: 'Team setup',
    collapsed: input.collapsed,
    dismissible: true,
    preferenceUnavailable: input.preferenceUnavailable,
  }
  const roleAction = { label: 'Review account role', href: '#field-role' }
  const featuresAction = { label: 'Choose feature access', href: '#field-features' }
  if (input.processing)
    return {
      ...base,
      title: 'Account update in progress',
      description:
        'Wait for Payload to confirm the save. If it fails, correct the reported fields and try again. Pending selections do not confirm changed access.',
      action: { ...roleAction, disabled: true },
    }
  if (input.role === 'admin')
    return {
      ...base,
      title: 'Admin gives full access to the website',
      description:
        'This account can manage all content, settings and other users. Section and feature checkboxes do not limit an Admin. Choose Site Manager for limited responsibilities. Use the native Save action when the account details and role are correct; changed access ends active sessions.',
      action: roleAction,
    }
  if (input.role !== 'siteManager')
    return {
      ...base,
      title: 'Choose an account role',
      description:
        'Admin has full access. Site Manager receives only the features and website sections you assign. Select a role, complete the account details and use the native Save action.',
      action: roleAction,
    }
  const { directKeys, dependencyKeys } = getFeatureAccessSummary(input.features)
  const scopedKeys = directKeys.filter((key) => scoped.has(key))
  const operational = directKeys.filter((key) =>
    ['queue', 'audit'].includes(ADMIN_FEATURES[key].policyKind),
  )
  const siteWide = directKeys.filter((key) => !scoped.has(key) && !operational.includes(key))
  const roots =
    Number.isSafeInteger(input.sectionCount) && input.sectionCount > 0 ? input.sectionCount : 0
  if (!directKeys.length)
    return {
      ...base,
      title: 'Choose what this Site Manager can manage',
      description:
        'No editable features are selected. Website sections alone do not grant access. Choose only the destinations this person needs; supporting records receive read-only access. Complete account details and use Save to apply the selection.',
      action: featuresAction,
    }
  if (scopedKeys.length && !roots)
    return {
      ...base,
      title: 'Assign website sections for scoped work',
      description: `${labels(scopedKeys)} require active root Pages under Manageable website sections; descendants are included. No section selection means no scoped authoring or inbox access. ${siteWide.length ? `${siteWide.length} other selected ${siteWide.length === 1 ? 'destination remains' : 'destinations remain'} site-wide. ` : ''}Feature grants are also required. Save validates the section selection; changed access ends active sessions.`,
      action: { label: 'Choose website sections', href: '#field-sectionRoots' },
    }
  if (operational.length === directKeys.length)
    return {
      ...base,
      title: 'Operational access needs source features',
      description: `${labels(operational)} show only records for otherwise authorized features. Selecting these destinations alone does not unlock source content or submissions. Choose the relevant source features and any required sections before saving.`,
      action: featuresAction,
    }
  const preview = [
    scopedKeys.length
      ? `Section-scoped: ${labels(scopedKeys)} across ${roots} selected ${roots === 1 ? 'section' : 'sections'}, including descendants.`
      : '',
    siteWide.length ? `Site-wide: ${labels(siteWide)}.` : '',
    operational.length ? `${labels(operational)} stay filtered by source access.` : '',
    dependencyKeys.length
      ? `Supporting read-only: ${labels(dependencyKeys)}; these do not become editable grants.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')
  return {
    ...base,
    title:
      input.modified || !input.existingAccount
        ? 'Review selected access before saving'
        : 'Review this account’s access selections',
    description: `${preview} ${input.modified || !input.existingAccount ? 'These selections are not confirmed until Save succeeds. ' : ''}Save validates active root sections and applies access. Changed access ends active sessions.`,
    action: { label: 'Review feature access', href: '#field-features' },
  }
}
