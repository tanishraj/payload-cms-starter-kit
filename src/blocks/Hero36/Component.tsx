import { Hero36 } from '@/components/hero36'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Hero36Block as Hero36BlockData } from '@/payload-types'

export function Hero36BlockComponent(props: Hero36BlockData) {
  const cards = props.cards.map((card) => {
    const image =
      card.visualType === 'image' && isMediaDoc(card.image)
        ? getMediaImageProps({
            media: card.image,
            preset: 'hero',
          })
        : undefined
    const { href, openInNewTab } = resolveCmsLink(card)

    return {
      title: card.title,
      description: card.description,
      href,
      openInNewTab,
      icon: card.visualType === 'icon' ? card.icon ?? undefined : undefined,
      image,
    }
  })

  return (
    <Hero36
      badge={props.badge?.text ? { text: props.badge.text } : undefined}
      heading={props.heading}
      description={props.description ?? undefined}
      cards={cards}
    />
  )
}
