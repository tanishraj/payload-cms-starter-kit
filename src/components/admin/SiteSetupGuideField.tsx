import type { UIFieldServerProps } from 'payload'
import type { User } from '@/payload-types'
import { hasFeature } from '@/access/featureAccess'
import { loadAccountGuidePreference } from '@/lib/accountGuidePreference'
import { SITE_SETUP_GUIDE_KEY, type SiteSetupGlobal } from '@/lib/siteSetupGuide'
import { SiteSetupGuide } from './SiteSetupGuide'

export async function SiteSetupGuideField({
  req,
  globalSlug,
}: UIFieldServerProps & {
  globalSlug: SiteSetupGlobal
}) {
  if (
    !req.user ||
    !hasFeature(req.user, globalSlug === 'site-settings' ? 'siteIdentity' : 'appearance')
  )
    return null
  const preference = await loadAccountGuidePreference(
    req.payload,
    req.user as User,
    SITE_SETUP_GUIDE_KEY,
    req,
  )
  return (
    <SiteSetupGuide
      key={`${req.user.id}:${globalSlug}`}
      globalSlug={globalSlug}
      canOpenAppearance={hasFeature(req.user, 'appearance')}
      collapsed={preference.collapsed}
      preferenceUnavailable={preference.unavailable}
    />
  )
}
