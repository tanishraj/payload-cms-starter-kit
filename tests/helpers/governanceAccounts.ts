import type { AdminFeatureGrants } from '@/access/adminFeatures'

export type GovernanceAccount = {
  email: string
  password: string
  role: 'admin' | 'siteManager'
  features?: AdminFeatureGrants
}

export const governanceAdmin: GovernanceAccount = {
  email: 'governance-admin@example.test',
  password: 'governance-admin-password',
  role: 'admin',
}

export const governanceSecondAdmin: GovernanceAccount = {
  email: 'governance-second-admin@example.test',
  password: 'governance-second-admin-password',
  role: 'admin',
}

export const accessManager: GovernanceAccount = {
  email: 'governance-access-manager@example.test',
  password: 'governance-access-manager-password',
  role: 'siteManager',
}

export const reviewManager: GovernanceAccount = {
  email: 'governance-review-manager@example.test',
  password: 'governance-review-manager-password',
  role: 'siteManager',
  features: { reviews: true },
}
