import { SystemPageHero } from '@/components/system-page-hero'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import type { System404Block as System404BlockData } from '@/payload-types'

export function System404BlockComponent(props: System404BlockData) {
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
      kind="404"
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
