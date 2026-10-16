import type { UIFieldServerProps } from 'payload'
import type { User } from '@/payload-types'
import { loadAccountGuidePreference } from '@/lib/accountGuidePreference'
import { PAGE_EDITING_GUIDE_KEY } from '@/lib/pageEditingGuide'
import { PageEditingGuide } from './PageEditingGuide'

export async function PageEditingGuideField({ req }: UIFieldServerProps) {
  if (!req.user) return null
  const preference = await loadAccountGuidePreference(
    req.payload,
    req.user as User,
    PAGE_EDITING_GUIDE_KEY,
    req,
  )
  return (
    <PageEditingGuide
      key={String(req.user.id)}
      collapsed={preference.collapsed}
      preferenceUnavailable={preference.unavailable}
    />
  )
}
