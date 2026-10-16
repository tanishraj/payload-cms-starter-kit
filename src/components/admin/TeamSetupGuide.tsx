'use client'

import {
  useAuth,
  useDocumentDrawerContext,
  useDocumentInfo,
  useFormFields,
  useFormModified,
  useFormProcessing,
} from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { ADMIN_FEATURE_KEYS, type AdminFeatureGrants } from '@/access/adminFeatures'
import { isAdmin } from '@/access/featureAccess'
import { normalizeSectionRoots } from '@/access/sectionScope'
import { getTeamSetupTask, TEAM_SETUP_GUIDE_KEY } from '@/lib/teamSetupGuide'
import { AccountGettingStartedGuide } from './AccountGettingStartedGuide'

export function TeamSetupGuide(props: { collapsed: boolean; preferenceUnavailable: boolean }) {
  const { user } = useAuth()
  const { drawerSlug } = useDocumentDrawerContext()
  const { id, collectionSlug, hasSavePermission, isTrashed, documentIsLocked, currentEditor } =
    useDocumentInfo()
  const pathname = usePathname()
  const role = useFormFields(([fields]) => fields.role?.value)
  const sectionCount = useFormFields(
    ([fields]) => normalizeSectionRoots(fields.sectionRoots?.value).length,
  )
  const signature = useFormFields(([fields]) =>
    ADMIN_FEATURE_KEYS.map((key) => (fields[`features.${key}`]?.value === true ? '1' : '0')).join(
      '',
    ),
  )
  const features = useMemo(
    () =>
      ADMIN_FEATURE_KEYS.reduce<AdminFeatureGrants>((result, key, index) => {
        result[key] = signature[index] === '1'
        return result
      }, {}),
    [signature],
  )
  const modified = useFormModified()
  const processing = useFormProcessing()
  const editorID =
    currentEditor && typeof currentEditor === 'object' ? currentEditor.id : currentEditor
  const lockedByAnother =
    Boolean(id) && documentIsLocked && (!editorID || String(editorID) !== String(user?.id))
  if (
    !isAdmin(user) ||
    !pathname?.startsWith('/admin/collections/users/') ||
    collectionSlug !== 'users' ||
    drawerSlug ||
    hasSavePermission === false ||
    isTrashed ||
    lockedByAnother
  )
    return null
  const task = getTeamSetupTask({
    ...props,
    role,
    features,
    sectionCount,
    modified,
    processing,
    existingAccount: Boolean(id),
  })
  return <AccountGettingStartedGuide task={task} preferenceKey={TEAM_SETUP_GUIDE_KEY} />
}
