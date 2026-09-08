import type { DashboardViewServerProps } from '@payloadcms/next/views'
import { Gutter } from '@payloadcms/ui'

import type { User } from '@/payload-types'

import { DashboardOverview } from './DashboardOverview'

export function DashboardView({ payload, user }: DashboardViewServerProps) {
  return (
    <Gutter className="dashboard">
      <DashboardOverview payload={payload} user={(user as User | null) ?? null} />
    </Gutter>
  )
}
