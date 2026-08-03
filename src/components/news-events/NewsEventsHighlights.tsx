import type { ReactNode } from 'react'
import Image from 'next/image'

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

export type NewsEventsHighlightsAlignment = 'center' | 'left' | 'right'

type NewsEventsHighlightsProps = {
  actions?: ReactNode
  alignment?: NewsEventsHighlightsAlignment
  appearance?: BlockAppearance | null
  description?: string
  emptyStateMessage?: string
  eyebrow?: string
  items: PublicNewsEventCard[]
  size?: RegularBlockSize
  title?: string | null
}

const sectionGapClasses = {
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<RegularBlockSize, string>

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const satisfies Record<NewsEventsHighlightsAlignment, string>

function NewsEventHighlightCard({ item }: { item: PublicNewsEventCard }) {
  return (
    <Card
      className="group/card h-full gap-0 rounded-md bg-card py-0 text-card-foreground shadow-none ring-1 ring-border"
      data-news-event-highlight-card="true"
    >
      {item.image ? (
        <div className="relative h-44 sm:h-48 overflow-hidden rounded-t-md bg-muted">
          <Image
            fill
            alt={item.image.alt}
            className={cn(
              'object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.025]',
              newsEventObjectPositionClasses[item.image.position],
            )}
            src={item.image.src}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>
      </CardContent>
      <CardFooter className="px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
        <ContentLink href={item.href} label="Read more" />
      </CardFooter>
    </Card>
  )
}

export function NewsEventsHighlights({
  actions,
  alignment = 'left',
  appearance,
  description,
  emptyStateMessage,
  eyebrow,
  items,
  size = 'default',
  title,
}: NewsEventsHighlightsProps) {
  const resolvedAlignment = alignment ?? 'left'
  const resolvedSize = size ?? 'default'
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClasses.className)}
      data-news-events-highlights="true"
      data-news-events-highlights-alignment={resolvedAlignment}
      data-news-events-highlights-size={resolvedSize}
    >
      <div className={regularBlockContainerClasses}>
        <div className={cn('flex flex-col', sectionGapClasses[resolvedSize])}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
            <div
              className={cn('flex max-w-3xl flex-col gap-4', alignmentClasses[resolvedAlignment])}
            >
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
            {actions ? (
              <div className="flex w-full justify-end lg:w-auto lg:pb-1">{actions}</div>
            ) : null}
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
