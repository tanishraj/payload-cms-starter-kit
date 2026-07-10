import { resolveSystemPageAction, SystemPageHero } from '@/components/system-page-hero'
import type { System404Block as System404BlockData } from '@/payload-types'

export function System404BlockComponent(props: System404BlockData) {
  const primaryAction = resolveSystemPageAction(props.primaryAction)
  const secondaryAction = resolveSystemPageAction(props.secondaryAction)

  return (
    <SystemPageHero
      badge={props.badge}
      description={props.description}
      heading={props.heading}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      statusDisplay={props.badge || '404'}
      supportingNote={props.supportingNote}
    />
  )
}
