import { type AdminFeatureKey } from '@/access/adminFeatures'

export type FeatureUpdateAction = {
  path: string
  type: 'UPDATE'
  value: boolean
}

export { getFeatureAccessSummary } from '@/access/adminFeatures'

export const buildFeatureUpdateActions = (
  keys: readonly AdminFeatureKey[],
  value: boolean,
): FeatureUpdateAction[] =>
  keys.map((key) => ({
    path: `features.${key}`,
    type: 'UPDATE',
    value,
  }))
