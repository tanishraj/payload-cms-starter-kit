import 'server-only'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { ADMIN_FEATURES, type AdminFeatureKey } from '@/access/adminFeatures'
import { getGrantedFeatureKeys, hasFeature, isAdmin } from '@/access/featureAccess'
import { normalizeSectionRoots, rootPageFilter, scopedSourceFeatures } from '@/access/sectionAccess'
import { loadAccountGuidePreference } from './accountGuidePreference'
import { ONBOARDING_PREFERENCE_KEY, type OnboardingTask } from './adminOnboardingShared'

export type DashboardSections = {
  status: 'ready' | 'missing' | 'unavailable' | 'not-needed'
  roots: { id: string; title: string }[]
}

/** Read names only through the account's real Page policy, including current ancestry and limits. */
export async function loadDashboardSections(
  payload: Payload,
  user: User,
): Promise<DashboardSections> {
  if (isAdmin(user)) return { status: 'ready', roots: [] }
  if (!scopedSourceFeatures.some((key) => hasFeature(user, key)))
    return { status: 'not-needed', roots: [] }
  const ids = normalizeSectionRoots(user.sectionRoots)
  if (!ids.length) return { status: 'missing', roots: [] }
  try {
    const result = await payload.find({
      collection: 'pages',
      user,
      overrideAccess: false,
      draft: true,
      depth: 0,
      limit: 50,
      pagination: false,
      select: { title: true },
      where: { and: [{ id: { in: ids } }, rootPageFilter] },
    })
    return {
      status: result.docs.length ? 'ready' : 'missing',
      roots: result.docs.map((doc) => ({ id: String(doc.id), title: doc.title })),
    }
  } catch {
    return { status: 'unavailable', roots: [] }
  }
}
export const canOpenDashboardFeature = (
  user: User,
  sections: DashboardSections,
  feature: AdminFeatureKey,
): boolean => {
  if (!hasFeature(user, feature)) return false
  if (isAdmin(user)) return true
  if (feature === 'actionQueue' || feature === 'auditLog')
    return getGrantedFeatureKeys(user).some(
      (source) =>
        source !== 'actionQueue' &&
        source !== 'auditLog' &&
        canOpenDashboardFeature(user, sections, source),
    )
  return !scopedSourceFeatures.some((key) => key === feature) || sections.status === 'ready'
}

const draftCollections = {
  pages: 'pages',
  articles: 'articles',
  newsEvents: 'news-events',
  reusableSections: 'reusable-sections',
  forms: 'forms',
} as const
const creationLabels: Partial<Record<AdminFeatureKey, string>> = {
  pages: 'Create a page',
  articles: 'Create an article',
  newsEvents: 'Create news or an event',
  reusableSections: 'Create a reusable section',
  forms: 'Create a form',
  media: 'Upload media',
}
const creationOrder: AdminFeatureKey[] = [
  'pages',
  'articles',
  'newsEvents',
  'reusableSections',
  'forms',
  'media',
]

export async function loadDashboardOnboarding(
  payload: Payload,
  user: User,
  sections: DashboardSections,
): Promise<OnboardingTask> {
  const keys = getGrantedFeatureKeys(user)
  const available = keys.filter((key) => canOpenDashboardFeature(user, sections, key))
  if (!available.length) {
    const noFeatures = keys.length === 0
    const unavailable = sections.status === 'unavailable'
    const missingSections = sections.status === 'missing'
    return {
      title: noFeatures
        ? 'No features assigned yet'
        : unavailable
          ? 'Website sections unavailable'
          : missingSections
            ? 'No website sections assigned'
            : 'No content features assigned',
      description: noFeatures
        ? 'Your account is active. Ask the Admin who created it to assign website features, then check access again.'
        : unavailable
          ? 'We could not verify your assigned website sections. Check access again, or ask an Admin for help. No access has been changed.'
          : missingSections
            ? 'Your account is active, but its features need a website section. Ask the Admin who created it to assign a root Page, then check access again.'
            : 'Action Queue and Audit Log need access to source features. Ask the Admin who created your account to assign content or settings features, then check access again.',
      action: { label: 'Check access again', href: '/admin' },
      collapsed: false,
      dismissible: false,
    }
  }
  const feature = creationOrder.find((key) => available.includes(key)) ?? available[0]
  const definition = ADMIN_FEATURES[feature]
  const listHref =
    definition.resource.kind === 'collection'
      ? `/admin/collections/${definition.resource.slug}`
      : `/admin/globals/${definition.resource.slug}`
  const preferencePromise = loadAccountGuidePreference(payload, user, ONBOARDING_PREFERENCE_KEY)
  const collection =
    feature in draftCollections ? draftCollections[feature as keyof typeof draftCollections] : null
  const draftPromise = collection
    ? payload
        .find({
          collection,
          user,
          overrideAccess: false,
          draft: true,
          depth: 0,
          limit: 1,
          sort: '-updatedAt',
          select: { title: true, _status: true },
          where: { _status: { equals: 'draft' } },
        })
        .then((result) => ({ doc: result.docs[0], unavailable: false }))
        .catch(() => ({ doc: undefined, unavailable: true }))
    : Promise.resolve({ doc: undefined, unavailable: false })
  const [preference, draft] = await Promise.all([preferencePromise, draftPromise])
  const context = isAdmin(user)
    ? ''
    : sections.roots.length
      ? ` Assigned sections: ${sections.roots
          .slice(0, 3)
          .map((root) => root.title)
          .join(', ')}${sections.roots.length > 3 ? ` and ${sections.roots.length - 3} more` : ''}.`
      : ''
  const missingScope =
    !isAdmin(user) && sections.status === 'missing'
      ? ' Pages, Forms, Reusable Sections, Media and submissions need an assigned website section; ask an Admin for that access.'
      : ''
  const base = {
    collapsed: preference.collapsed,
    dismissible: true,
    preferenceUnavailable: preference.unavailable,
  }
  if (draft.unavailable)
    return {
      ...base,
      title: 'Your next task is unavailable',
      description: `We could not load your drafts. Open ${definition.label} to keep working, or refresh the dashboard to try again.${context}`,
      action: { label: `Open ${definition.label}`, href: listHref },
    }
  if (draft.doc)
    return {
      ...base,
      title: 'Continue your draft',
      description: `${draft.doc.title || 'Untitled'} is saved as a draft. ${feature === 'pages' ? 'Add blocks, save your changes and check Live Preview before publishing.' : 'Open it to continue editing and preview your changes before publishing.'}${context}${missingScope}`,
      action: { label: 'Continue draft', href: `${listHref}/${draft.doc.id}` },
    }
  const create = creationOrder.includes(feature)
  let description: string
  if (feature === 'pages') {
    description = isAdmin(user)
      ? 'You have full Admin access. Start with a blank page or a recipe.'
      : 'Choose a parent in your assigned section.'
    description +=
      ' Add blocks, save a draft and check Live Preview. Publish only when you are ready.'
  } else {
    const assigned = isAdmin(user)
      ? ''
      : `${available.length} ${available.length === 1 ? 'feature' : 'features'} assigned. `
    description = `${assigned}Open ${definition.label} to start working.`
    description += scopedSourceFeatures.some((key) => key === feature)
      ? ' Shared published resources remain Admin-managed.'
      : ' This destination uses site-wide feature permissions.'
  }
  return {
    ...base,
    title:
      feature === 'pages'
        ? 'Create a page'
        : create
          ? `Start with ${definition.label}`
          : 'Your assigned workspace',
    description: description + context + missingScope,
    action: {
      label: creationLabels[feature] ?? `Open ${definition.label}`,
      href: create ? `${listHref}/create` : listHref,
    },
  }
}
