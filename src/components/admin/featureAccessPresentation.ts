import {
  ADMIN_FEATURE_KEYS,
  ADMIN_FEATURES,
  type AdminFeatureGrants,
  type AdminFeatureKey,
} from '@/access/adminFeatures'

export type FeatureUpdateAction = {
  path: string
  type: 'UPDATE'
  value: boolean
}

export const getFeatureAccessSummary = (grants: AdminFeatureGrants) => {
  const directKeys = ADMIN_FEATURE_KEYS.filter((key) => grants[key] === true)
  const directKeySet = new Set(directKeys)
  const dependencyKeySet = new Set<AdminFeatureKey>()

  for (const key of directKeys) {
    for (const dependency of ADMIN_FEATURES[key].dependencyReads) {
      if (!directKeySet.has(dependency)) dependencyKeySet.add(dependency)
    }
  }

  return {
    dependencyKeys: ADMIN_FEATURE_KEYS.filter((key) => dependencyKeySet.has(key)),
    directKeys,
  }
}

export const buildFeatureUpdateActions = (
  keys: readonly AdminFeatureKey[],
  value: boolean,
): FeatureUpdateAction[] =>
  keys.map((key) => ({
    path: `features.${key}`,
    type: 'UPDATE',
    value,
  }))
