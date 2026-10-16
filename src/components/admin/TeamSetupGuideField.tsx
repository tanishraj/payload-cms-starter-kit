import type { UIFieldServerProps } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin } from '@/access/featureAccess'
import { loadAccountGuidePreference } from '@/lib/accountGuidePreference'
import { TEAM_SETUP_GUIDE_KEY } from '@/lib/teamSetupGuide'
import { TeamSetupGuide } from './TeamSetupGuide'

export async function TeamSetupGuideField({ req }: UIFieldServerProps) {
  if (!isAdmin(req.user)) return null
  const preference = await loadAccountGuidePreference(
    req.payload,
    req.user as unknown as User,
    TEAM_SETUP_GUIDE_KEY,
    req,
  )
  return (
    <TeamSetupGuide
      key={String(req.user.id)}
      collapsed={preference.collapsed}
      preferenceUnavailable={preference.unavailable}
    />
  )
}
