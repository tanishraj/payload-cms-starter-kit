import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import {
  normalizeSiteOfficeLocations,
  type SiteOfficeLocation,
} from '@/lib/siteOfficesShared'

const loadSiteOfficeLocations = cache(async (draft: boolean): Promise<SiteOfficeLocation[]> => {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({
    depth: 0,
    draft,
    slug: 'site-settings',
  })

  return normalizeSiteOfficeLocations(settings.officeLocations)
})

export const getPublishedSiteOfficeLocations = () => loadSiteOfficeLocations(false)
export const getDraftSiteOfficeLocations = () => loadSiteOfficeLocations(true)
