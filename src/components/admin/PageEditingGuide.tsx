'use client'

import {
  useAuth,
  useConfig,
  useDocumentDrawerContext,
  useDocumentInfo,
  useFormFields,
  useFormModified,
  useFormProcessing,
} from '@payloadcms/ui'
import { AccountGettingStartedGuide } from './AccountGettingStartedGuide'
import { getPageEditingTask, PAGE_EDITING_GUIDE_KEY } from '@/lib/pageEditingGuide'

export function PageEditingGuide({
  collapsed,
  preferenceUnavailable,
}: {
  collapsed: boolean
  preferenceUnavailable: boolean
}) {
  const { drawerSlug } = useDocumentDrawerContext()
  const { config } = useConfig()
  const { user } = useAuth()
  const { id, hasPublishedDoc, hasSavePermission, isTrashed, documentIsLocked, currentEditor } =
    useDocumentInfo()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const hasBlocks = useFormFields(([fields]) => Boolean(fields.layout?.rows?.length))
  const editorID =
    currentEditor && typeof currentEditor === 'object' ? currentEditor.id : currentEditor
  const lockedByAnother = documentIsLocked && (!editorID || String(editorID) !== String(user?.id))
  if (drawerSlug || hasSavePermission === false || isTrashed || lockedByAnother) return null
  const previewURL = id
    ? `${config.serverURL || ''}/preview/page/${encodeURIComponent(String(id))}`
    : null
  const task = getPageEditingTask({
    previewURL,
    hasBlocks,
    modified,
    processing,
    hasPublishedDoc,
    siteManager: user?.role === 'siteManager',
    collapsed,
    preferenceUnavailable,
  })
  return <AccountGettingStartedGuide task={task} preferenceKey={PAGE_EDITING_GUIDE_KEY} />
}
