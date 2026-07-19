import type { ReactNode } from 'react'

import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentLink } from '@/components/ContentLink'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { newsEventObjectPositionClasses, type PublicNewsEventCard } from '@/lib/newsEventsShared'
import { cn } from '@/lib/utils'

type NewsEventsHighlightsProps = {
  actions?: ReactNode
  appearance?: BlockAppearance | null
  description?: string
  emptyStateMessage?: string
  eyebrow?: string
  items: PublicNewsEventCard[]
  size?: RegularBlockSize
  title: string
}

const sectionGapClasses = {
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<RegularBlockSize, string>

function NewsEventHighlightCard({ item }: { item: PublicNewsEventCard }) {
  return (
    <Card
      className="h-full gap-0 rounded-md bg-card py-0 text-card-foreground shadow-none ring-1 ring-border"
      data-news-event-highlight-card="true"
    >
      {item.image ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-md bg-muted">
          {/* CMS image URLs are runtime-managed and may be absolute. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={item.image.alt}
            className={cn(
              'size-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.025]',
              newsEventObjectPositionClasses[item.image.position],
            )}
            height={item.image.height}
            loading="lazy"
            src={item.image.src}
            width={item.image.width}
          />
        </div>
      ) : null}
      <CardHeader className="gap-3 rounded-none px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{item.contentType === 'event' ? 'Event' : 'News'}</Badge>
          {item.category ? <span>{item.category.title}</span> : null}
          <span aria-hidden="true">·</span>
          <time dateTime={item.dateISO}>{item.dateLabel}</time>
        </div>
        <CardTitle className="text-lg leading-tight font-semibold sm:text-xl">
          <a
            className="rounded-sm underline-offset-4 transition-opacity hover:opacity-70 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            href={item.href}
          >
            {item.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-5 pt-3 sm:px-6">
        <p className="text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
      </CardContent>
      <CardFooter className="px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
        <ContentLink href={item.href} label="Read more" />
      </CardFooter>
    </Card>
  )
}

export function NewsEventsHighlights({
  actions,
  appearance,
  description,
  emptyStateMessage,
  eyebrow,
  items,
  size = 'default',
  title,
}: NewsEventsHighlightsProps) {
  const resolvedSize = size ?? 'default'
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClasses.className)}
      data-news-events-highlights="true"
      data-news-events-highlights-size={resolvedSize}
    >
      <div className={regularBlockContainerClasses}>
        <div className={cn('flex flex-col', sectionGapClasses[resolvedSize])}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-4">
              {eyebrow ? (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                  {eyebrow}
                </p>
              ) : null}
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {title}
              </h2>
              {description ? (
                <p className="text-base leading-7 text-balance text-current/70">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="lg:shrink-0 lg:pb-1">{actions}</div> : null}
          </div>
          {items.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <NewsEventHighlightCard item={item} key={item.id} />
              ))}
            </div>
          ) : emptyStateMessage ? (
            <p className="border-t border-border pt-6 text-sm leading-6 text-current/70">
              {emptyStateMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
