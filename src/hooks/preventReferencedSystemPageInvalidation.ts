import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

import type { PageSetting, SystemPage } from '@/payload-types'
import type { SystemPageType } from '@/lib/systemPageTypes'

const getSystemPageID = (value: number | SystemPage | null | undefined): number | null => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    return value.id
  }

  return null
}

const getSystemBehaviorUsage = (pageSettings: PageSetting, pageID: number) => {
  const usage: Array<{
    fieldLabel: string
    requiredType: SystemPageType
  }> = []

  if (getSystemPageID(pageSettings.notFoundPage as number | SystemPage | null | undefined) === pageID) {
    usage.push({
      fieldLabel: 'Site Defaults -> System -> 404 Page',
      requiredType: '404',
    })
  }

  if (
    getSystemPageID(pageSettings.maintenancePage as number | SystemPage | null | undefined) === pageID
  ) {
    usage.push({
      fieldLabel: 'Site Defaults -> System -> Maintenance Page',
      requiredType: 'maintenance',
    })
  }

  if (
    getSystemPageID(pageSettings.comingSoonPage as number | SystemPage | null | undefined) === pageID
  ) {
    usage.push({
      fieldLabel: 'Site Defaults -> System -> Coming Soon Page',
      requiredType: 'comingSoon',
    })
  }

  return usage
}

export const preventReferencedSystemPageInvalidation: CollectionBeforeChangeHook<SystemPage> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) {
    return data
  }

  const pageID = typeof originalDoc.id === 'number' ? originalDoc.id : Number(originalDoc.id)
  const pageSettings = await req.payload.findGlobal({
    slug: 'page-settings',
    depth: 0,
    req,
  })

  const usage = getSystemBehaviorUsage(pageSettings, pageID)

  if (usage.length === 0) {
    return data
  }

  const nextStatus = data._status ?? originalDoc._status
  const nextType = (data.type ?? originalDoc.type) as SystemPageType

  if (nextStatus !== 'published') {
    throw new APIError(
      `This system page cannot be unpublished because it is still used by ${usage.map((entry) => entry.fieldLabel).join('; ')}. Remove these references first.`,
      400,
      null,
      true,
    )
  }

  const invalidUsage = usage.filter((entry) => entry.requiredType !== nextType)

  if (invalidUsage.length > 0) {
    throw new APIError(
      `This system page cannot change type because it is still used by ${invalidUsage.map((entry) => entry.fieldLabel).join('; ')}. Remove these references first.`,
      400,
      null,
      true,
    )
  }

  return data
}
