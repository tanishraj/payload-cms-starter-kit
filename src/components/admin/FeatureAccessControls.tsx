'use client'

import { useFormFields } from '@payloadcms/ui'
import type { UIFieldClientProps } from 'payload'
import { useMemo } from 'react'

import {
  ADMIN_FEATURE_KEYS,
  ADMIN_FEATURES,
  type AdminFeatureGrants,
  type AdminFeatureKey,
} from '@/access/adminFeatures'

import { buildFeatureUpdateActions, getFeatureAccessSummary } from './featureAccessPresentation'
import './FeatureAccessControls.scss'

const selectedSignature = (
  fields: Record<string, { value?: unknown }> | undefined,
  keys: readonly AdminFeatureKey[],
) => keys.map((key) => (fields?.[`features.${key}`]?.value === true ? '1' : '0')).join('')

const grantsFromSignature = (
  signature: string,
  keys: readonly AdminFeatureKey[],
): AdminFeatureGrants =>
  keys.reduce<AdminFeatureGrants>((grants, key, index) => {
    grants[key] = signature[index] === '1'
    return grants
  }, {})

const useFeatureControls = (keys: readonly AdminFeatureKey[]) => {
  const signature = useFormFields(([fields]) => selectedSignature(fields, keys))
  const dispatch = useFormFields(([, dispatchFields]) => dispatchFields)
  const selectedCount = signature.split('').filter((value) => value === '1').length

  const setValue = (value: boolean) => {
    for (const action of buildFeatureUpdateActions(keys, value)) dispatch(action)
  }

  return { selectedCount, setValue, signature }
}

const BulkButtons = ({
  disabled,
  keys,
  selectedCount,
  setValue,
}: {
  disabled?: boolean
  keys: readonly AdminFeatureKey[]
  selectedCount: number
  setValue: (value: boolean) => void
}) => (
  <div className="feature-access-controls__actions">
    <button
      className="feature-access-controls__button"
      disabled={disabled || selectedCount === keys.length}
      onClick={() => setValue(true)}
      type="button"
    >
      Select all
    </button>
    <button
      className="feature-access-controls__button feature-access-controls__button--quiet"
      disabled={disabled || selectedCount === 0}
      onClick={() => setValue(false)}
      type="button"
    >
      Clear all
    </button>
  </div>
)

export function FeatureAccessOverview({ readOnly }: UIFieldClientProps) {
  const { selectedCount, setValue, signature } = useFeatureControls(ADMIN_FEATURE_KEYS)
  const summary = useMemo(
    () => getFeatureAccessSummary(grantsFromSignature(signature, ADMIN_FEATURE_KEYS)),
    [signature],
  )
  const dependencyLabels = summary.dependencyKeys.map((key) => ADMIN_FEATURES[key].label)

  return (
    <div className="feature-access-overview">
      <div className="feature-access-overview__heading">
        <div aria-live="polite">
          <strong>
            {selectedCount} of {ADMIN_FEATURE_KEYS.length} features selected
          </strong>
          <p>
            {dependencyLabels.length > 0
              ? `Also allows supporting read-only access to ${dependencyLabels.join(', ')} where required.`
              : 'No supporting read-only access is currently implied.'}
          </p>
        </div>
        <BulkButtons
          disabled={readOnly}
          keys={ADMIN_FEATURE_KEYS}
          selectedCount={selectedCount}
          setValue={setValue}
        />
      </div>
      <p className="feature-access-overview__note">
        Supporting destinations stay hidden and cannot be edited. Review the selection, then use the
        normal Save action. Changed access signs the Site Manager out of active sessions.
      </p>
    </div>
  )
}

type FeatureGroupControlsProps = UIFieldClientProps & {
  featureKeys: AdminFeatureKey[]
  groupLabel: string
}

export function FeatureGroupControls({
  featureKeys,
  groupLabel,
  readOnly,
}: FeatureGroupControlsProps) {
  const { selectedCount, setValue } = useFeatureControls(featureKeys)

  return (
    <div className="feature-access-controls__group">
      <span aria-live="polite">
        {selectedCount} of {featureKeys.length} {groupLabel} features selected
      </span>
      <BulkButtons
        disabled={readOnly}
        keys={featureKeys}
        selectedCount={selectedCount}
        setValue={setValue}
      />
    </div>
  )
}
