import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import { isAdminUser } from '@/access/adminCapabilities'
import type { User } from '@/payload-types'

export const getCurrentCMSUser = cache(async (): Promise<User | null> => {
  const payload = await getPayload({
    config: configPromise,
  })
  const requestHeaders = new Headers(await getHeaders())
  const authResult = await payload.auth({
    canSetHeaders: false,
    headers: requestHeaders,
  })

  return (authResult.user as User | null | undefined) ?? null
})

export const isCurrentCMSAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentCMSUser()

  return isAdminUser(user)
})

export const formatCMSRoleLabel = (role?: string | null): string => {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'siteManager':
      return 'Site Manager'
    case 'contentManager':
      return 'Content Manager'
    default:
      return 'CMS User'
  }
}
