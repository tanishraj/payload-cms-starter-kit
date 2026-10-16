import type { UIFieldServerProps } from 'payload'
import type { User } from '@/payload-types'
import { hasFeature } from '@/access/featureAccess'
import { loadAccountGuidePreference } from '@/lib/accountGuidePreference'
import { getMenuEditingDestination, SITE_STRUCTURE_GUIDE_KEY } from '@/lib/siteStructureGuide'
import { SiteStructureGuide } from './SiteStructureGuide'

export async function SiteStructureGuideField({ req }: UIFieldServerProps) {
  if (!req.user || !hasFeature(req.user, 'layoutDefaults')) return null
  const preference = await loadAccountGuidePreference(
    req.payload,
    req.user as User,
    SITE_STRUCTURE_GUIDE_KEY,
    req,
  )
  return (
    <SiteStructureGuide
      key={String(req.user.id)}
      menuAction={getMenuEditingDestination(req.user)}
      collapsed={preference.collapsed}
      preferenceUnavailable={preference.unavailable}
    />
  )
}
