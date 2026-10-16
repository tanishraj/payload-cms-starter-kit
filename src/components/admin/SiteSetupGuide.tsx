'use client'

import {
  useAuth,
  useDocumentDrawerContext,
  useDocumentInfo,
  useFormModified,
  useFormProcessing,
} from '@payloadcms/ui'
import { getSiteSetupTask, SITE_SETUP_GUIDE_KEY, type SiteSetupGlobal } from '@/lib/siteSetupGuide'
import { AccountGettingStartedGuide } from './AccountGettingStartedGuide'

export function SiteSetupGuide(props: {
  globalSlug: SiteSetupGlobal
  canOpenAppearance: boolean
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
  const editorID =
    currentEditor && typeof currentEditor === 'object' ? currentEditor.id : currentEditor
  const lockedByAnother = documentIsLocked && (!editorID || String(editorID) !== String(user?.id))
  if (
    globalSlug !== props.globalSlug ||
    drawerSlug ||
    hasSavePermission === false ||
    isTrashed ||
    lockedByAnother
  )
    return null
  const task = getSiteSetupTask({ ...props, modified, processing, hasPublishedDoc })
  return <AccountGettingStartedGuide task={task} preferenceKey={SITE_SETUP_GUIDE_KEY} />
}
