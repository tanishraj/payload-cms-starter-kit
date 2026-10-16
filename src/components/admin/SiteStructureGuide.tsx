'use client'

import {
  useAuth,
  useDocumentDrawerContext,
  useDocumentInfo,
  useFormFields,
  useFormModified,
  useFormProcessing,
} from '@payloadcms/ui'
import type { OnboardingAction } from '@/lib/adminOnboardingShared'
import { getSiteStructureTask, SITE_STRUCTURE_GUIDE_KEY } from '@/lib/siteStructureGuide'
import { AccountGettingStartedGuide } from './AccountGettingStartedGuide'

export function SiteStructureGuide(props: {
  menuAction: OnboardingAction | null
  collapsed: boolean
  preferenceUnavailable: boolean
}) {
  const { drawerSlug } = useDocumentDrawerContext()
  const { user } = useAuth()
  const {
    globalSlug,
    hasSavePermission,
    hasPublishedDoc,
    isTrashed,
    documentIsLocked,
    currentEditor,
  } = useDocumentInfo()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const hasHomepageSelection = useFormFields(([fields]) => Boolean(fields.homepage?.value))
  const editorID =
    currentEditor && typeof currentEditor === 'object' ? currentEditor.id : currentEditor
  const lockedByAnother = documentIsLocked && (!editorID || String(editorID) !== String(user?.id))
  if (
    globalSlug !== 'page-settings' ||
    drawerSlug ||
    hasSavePermission === false ||
    isTrashed ||
    lockedByAnother
  )
    return null
  const task = getSiteStructureTask({
    ...props,
    hasHomepageSelection,
    modified,
    processing,
    hasPublishedDoc,
  })
  return <AccountGettingStartedGuide task={task} preferenceKey={SITE_STRUCTURE_GUIDE_KEY} />
}
