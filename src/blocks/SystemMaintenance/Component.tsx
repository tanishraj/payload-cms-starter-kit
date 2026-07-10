import { resolveSystemPageAction, SystemPageHero } from '@/components/system-page-hero'
import type { SystemMaintenanceBlock as SystemMaintenanceBlockData } from '@/payload-types'

export function SystemMaintenanceBlockComponent(props: SystemMaintenanceBlockData) {
  const primaryAction = resolveSystemPageAction(props.primaryAction)
  const secondaryAction = resolveSystemPageAction(props.secondaryAction)

  return (
    <SystemPageHero
      badge={props.badge}
      description={props.description}
      heading={props.heading}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      statusDisplay={props.badge || 'Maintenance'}
      supportingNote={props.supportingNote}
    />
  )
}
