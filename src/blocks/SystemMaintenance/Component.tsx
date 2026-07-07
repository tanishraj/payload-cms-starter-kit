import { SystemPageHero } from '@/components/system-page-hero'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import type { SystemMaintenanceBlock as SystemMaintenanceBlockData } from '@/payload-types'

export function SystemMaintenanceBlockComponent(props: SystemMaintenanceBlockData) {
  const image = getMediaImageProps({
    media: props.image,
    preset: 'system',
  })
  const primaryAction =
    props.primaryAction?.label != null
      ? {
          label: props.primaryAction.label,
          url: resolveCmsLink(props.primaryAction).href ?? null,
          openInNewTab: resolveCmsLink(props.primaryAction).openInNewTab ?? null,
        }
      : null
  const secondaryAction =
    props.secondaryAction?.label != null
      ? {
          label: props.secondaryAction.label,
          url: resolveCmsLink(props.secondaryAction).href ?? null,
          openInNewTab: resolveCmsLink(props.secondaryAction).openInNewTab ?? null,
        }
      : null

  return (
    <SystemPageHero
      kind="maintenance"
      badge={props.badge}
      heading={props.heading}
      description={props.description}
      supportingNote={props.supportingNote}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      image={image}
    />
  )
}
