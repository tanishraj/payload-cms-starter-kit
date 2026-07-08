import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import type { ContentSpotlightBlock as ContentSpotlightBlockData } from '@/payload-types'

export function ContentSpotlightBlockComponent(props: ContentSpotlightBlockData) {
  const image = getMediaImageProps({
    media: props.image,
    preset: 'generic',
    fallbackAlt: props.heading,
  })
  const { href, openInNewTab } = resolveCmsLink(props)

  return (
    <section className="grid gap-6 rounded-3xl border bg-accent/30 p-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
      <div className="space-y-4">
        {props.eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {props.eyebrow}
          </p>
        ) : null}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{props.heading}</h2>
          {props.description ? (
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {props.description}
            </p>
          ) : null}
        </div>
        {href ? (
          <a
            className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={href}
            rel={openInNewTab ? 'noreferrer noopener' : undefined}
            target={openInNewTab ? '_blank' : undefined}
          >
            Learn more
          </a>
        ) : null}
      </div>
      {image ? (
        <img alt={image.alt} className="w-full rounded-2xl border object-cover" src={image.src} />
      ) : null}
    </section>
  )
}
