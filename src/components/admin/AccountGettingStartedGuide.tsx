'use client'

import { useConfig } from '@payloadcms/ui'
import { useRef, useState, useSyncExternalStore } from 'react'
import { OnboardingPanel } from '@/components/revamp/onboarding-panel'
import { ONBOARDING_PREFERENCE_KEY, type OnboardingTask } from '@/lib/adminOnboardingShared'

const subscribeToHydration = () => () => {}
const clientReady = () => true
const serverReady = () => false

/** Only stores optional guide visibility. Current native/server facts select the task and destination. */
export function AccountGettingStartedGuide({
  task,
  preferenceKey = ONBOARDING_PREFERENCE_KEY,
}: {
  task: OnboardingTask
  preferenceKey?: string
}) {
  const { config } = useConfig()
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady)
  const [collapsed, setCollapsed] = useState(task.collapsed)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(
    task.preferenceUnavailable
      ? 'Your saved guide preference is unavailable. You can keep working and try hiding it again.'
      : '',
  )
  const saving = useRef(false)
  async function toggle(next: boolean) {
    if (saving.current || !task.dismissible) return
    saving.current = true
    setPending(true)
    setError('')
    try {
      const response = await fetch(`${config.routes.api}/payload-preferences/${preferenceKey}`, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: { dismissed: next } }),
      })
      if (!response.ok) throw new Error('Preference save failed')
      const result = await response.json()
      if (result?.doc?.value?.dismissed !== next) throw new Error('Preference not confirmed')
      setCollapsed(next)
    } catch {
      setError('Your guide preference could not be saved. Try again; your content is unchanged.')
    } finally {
      saving.current = false
      setPending(false)
    }
  }
  return (
    <OnboardingPanel
      {...task}
      ready={ready}
      collapsed={collapsed}
      onToggle={toggle}
      pending={pending}
      error={error}
    />
  )
}
