import { resolveSystemPageAction, SystemPageHero } from '@/components/system-page-hero'
import type { SystemComingSoonBlock as SystemComingSoonBlockData } from '@/payload-types'

export function SystemComingSoonBlockComponent(props: SystemComingSoonBlockData) {
  const primaryAction = resolveSystemPageAction(props.primaryAction)
  const secondaryAction = resolveSystemPageAction(props.secondaryAction)

  return (
    <SystemPageHero
      badge={props.badge}
      description={props.description}
      heading={props.heading}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      statusDisplay={props.badge || 'Coming Soon'}
      supportingNote={props.supportingNote}
    />
  )
}
