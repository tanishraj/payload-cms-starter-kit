import Image from 'next/image'
import Link from 'next/link'

import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentLink } from '@/components/ContentLink'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  newsEventObjectPositionClasses,
  type NewsEventsArchiveQuery,
  type PublicNewsEventCard,
  type PublicNewsEventsPage,
} from '@/lib/newsEventsShared'
import {
  buildNewsEventsArchiveHref,
  type NewsEventsTaxonomyContext,
} from '@/lib/newsEventsPaths'
import { cn } from '@/lib/utils'
import type { NewsEventsSetting } from '@/payload-types'

type ArchiveTaxonomyTerm = { id: number | string; slug: string; title: string }

type NewsEventsFeedProps = {
  archiveData: PublicNewsEventsPage
  categories: ArchiveTaxonomyTerm[]
  pastEvents?: PublicNewsEventsPage
  query: NewsEventsArchiveQuery
  settings: NewsEventsSetting
  tags: ArchiveTaxonomyTerm[]
  taxonomyContext?: NewsEventsTaxonomyContext
  upcomingEvents?: PublicNewsEventsPage
}

const sectionGapClasses = {
  none: 'gap-10',
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<RegularBlockSize, string>

function FeedRow({
  item,
  query,
  readMoreLabel,
  taxonomyContext,
}: {
  item: PublicNewsEventCard
  query: NewsEventsArchiveQuery
  readMoreLabel: string
  taxonomyContext?: NewsEventsTaxonomyContext
}) {
  return (
    <article
      className="grid gap-6 border-b border-border pb-8 md:grid-cols-[minmax(14rem,26rem)_minmax(0,1fr)] md:gap-8"
      data-news-event-feed-row="true"
    >
      {item.image ? (
        <div className="relative h-44 w-full self-start overflow-hidden rounded-md border border-border bg-muted md:h-48">
          <Image
            fill
            alt={item.image.alt}
            className={cn('object-cover', newsEventObjectPositionClasses[item.image.position])}
            src={item.image.src}
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      ) : null}
      <div
        className={cn(
          'flex min-w-0 flex-col items-start gap-4 py-1 md:py-2',
          !item.image && 'md:col-span-2',
        )}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-current/70">
          <Badge variant="secondary">{item.contentType === 'event' ? 'Event' : 'News'}</Badge>
          {item.category ? (
            <Link
              className="underline-offset-4 hover:underline"
              href={buildNewsEventsArchiveHref(
                query,
                {
                  category: item.category.slug,
                  page: 1,
                  pastPage: 1,
                  upcomingPage: 1,
                },
                taxonomyContext,
              )}
            >
              {item.category.title}
            </Link>
          ) : null}
          {item.isPastEvent ? <Badge variant="outline">Past</Badge> : null}
          <span aria-hidden="true">·</span>
          <time dateTime={item.dateISO}>{item.dateLabel}</time>
        </div>
        <h2 className="text-xl leading-tight font-semibold text-current sm:text-2xl">
          <Link className="underline-offset-4 hover:underline" href={item.href}>
            {item.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-base leading-7 text-current/70">{item.excerpt}</p>
        <ContentLink className="mt-auto" href={item.href} label={readMoreLabel} />
      </div>
    </article>
  )
}

function FeedPagination({
  page,
  pageKey,
  query,
  totalPages,
  taxonomyContext,
}: {
  page: number
  pageKey: 'page' | 'pastPage' | 'upcomingPage'
  query: NewsEventsArchiveQuery
  totalPages: number
  taxonomyContext?: NewsEventsTaxonomyContext
}) {
  if (totalPages <= 1) return null

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index)

  return (
    <Pagination className="justify-start">
      <PaginationContent>
        {page > 1 ? (
          <PaginationItem>
            <PaginationPrevious
              href={buildNewsEventsArchiveHref(query, { [pageKey]: page - 1 }, taxonomyContext)}
            />
          </PaginationItem>
        ) : null}
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              href={buildNewsEventsArchiveHref(query, { [pageKey]: pageNumber }, taxonomyContext)}
              isActive={pageNumber === page}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < totalPages ? (
          <PaginationItem>
            <PaginationNext
              href={buildNewsEventsArchiveHref(query, { [pageKey]: page + 1 }, taxonomyContext)}
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  )
}

function FeedSection({
  label,
  page,
  pageKey,
  query,
  readMoreLabel,
  taxonomyContext,
}: {
  label?: string
  page: PublicNewsEventsPage
  pageKey: 'page' | 'pastPage' | 'upcomingPage'
  query: NewsEventsArchiveQuery
  readMoreLabel: string
  taxonomyContext?: NewsEventsTaxonomyContext
}) {
  if (!page.docs.length) return null

  return (
    <section className="flex flex-col gap-6">
      {label ? (
        <h2 className="text-2xl font-semibold tracking-tight text-current sm:text-3xl">{label}</h2>
      ) : null}
      <div className="grid gap-6">
        {page.docs.map((item) => (
          <FeedRow
            item={item}
            key={item.id}
            query={query}
            readMoreLabel={readMoreLabel}
            taxonomyContext={taxonomyContext}
          />
        ))}
      </div>
      <FeedPagination
        page={page.page}
        pageKey={pageKey}
        query={query}
        taxonomyContext={taxonomyContext}
        totalPages={page.totalPages}
      />
    </section>
  )
}

export function NewsEventsFeed({
  archiveData,
  categories,
  pastEvents,
  query,
  settings,
  tags,
  taxonomyContext,
  upcomingEvents,
}: NewsEventsFeedProps) {
  const size = (settings.size ?? 'default') as RegularBlockSize
  const appearance = settings.appearance as BlockAppearance
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const isEmpty =
    query.type === 'event'
      ? !(upcomingEvents?.docs.length || pastEvents?.docs.length)
      : !archiveData.docs.length
  const typeFilters = [
    { label: settings.allLabel, value: 'all' as const },
    { label: settings.newsLabel, value: 'news' as const },
    { label: settings.eventsLabel, value: 'event' as const },
  ]

  return (
    <main className={cn(regularBlockMobilePaddingClasses[size], appearanceClasses.className)}>
      <div className={cn(regularBlockContainerClasses, 'flex flex-col', sectionGapClasses[size])}>
        <header className="flex max-w-3xl flex-col gap-4">
          {settings.eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {settings.eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-current sm:text-5xl">
            {settings.title}
          </h1>
          {settings.description ? (
            <p className="text-base leading-7 text-balance text-current/70">
              {settings.description}
            </p>
          ) : null}
        </header>

        <nav
          aria-label="Filter News and Events"
          className="flex flex-col gap-4 border-y border-border py-4"
        >
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <Link
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  query.type === filter.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-muted',
                )}
                href={buildNewsEventsArchiveHref(
                  query,
                  {
                    page: 1,
                    pastPage: 1,
                    type: filter.value,
                    upcomingPage: 1,
                  },
                  taxonomyContext,
                )}
                key={filter.value}
              >
                {filter.label}
              </Link>
            ))}
          </div>
          {categories.length ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Link
                className={cn(
                  'shrink-0 text-sm underline-offset-4 hover:underline',
                  !query.category && 'font-semibold',
                )}
                href={buildNewsEventsArchiveHref(
                  query,
                  {
                    category: undefined,
                    page: 1,
                    pastPage: 1,
                    upcomingPage: 1,
                  },
                  taxonomyContext,
                )}
              >
                All categories
              </Link>
              {categories.map((category) => (
                <Link
                  className={cn(
                    'shrink-0 text-sm underline-offset-4 hover:underline',
                    query.category === category.slug && 'font-semibold',
                  )}
                  href={buildNewsEventsArchiveHref(
                    query,
                    {
                      category: category.slug,
                      page: 1,
                      pastPage: 1,
                      upcomingPage: 1,
                    },
                    taxonomyContext,
                  )}
                  key={category.id}
                >
                  {category.title}
                </Link>
              ))}
            </div>
          ) : null}
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {query.tag ? (
                <Link
                  className="shrink-0 rounded-full border border-border px-3 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
                  href={buildNewsEventsArchiveHref(
                    query,
                    {
                      page: 1,
                      pastPage: 1,
                      tag: undefined,
                      upcomingPage: 1,
                    },
                    taxonomyContext,
                  )}
                >
                  Clear tag
                </Link>
              ) : null}
              {tags.map((tag) => (
                <Link
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium transition-colors hover:bg-muted',
                    query.tag === tag.slug
                      ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-border',
                  )}
                  href={buildNewsEventsArchiveHref(
                    query,
                    {
                      page: 1,
                      pastPage: 1,
                      tag: tag.slug,
                      upcomingPage: 1,
                    },
                    taxonomyContext,
                  )}
                  key={tag.id}
                >
                  {tag.title}
                </Link>
              ))}
            </div>
          ) : null}
        </nav>

        {isEmpty ? (
          <Empty className="border border-border">
            <EmptyHeader>
              <EmptyTitle>{settings.emptyStateTitle}</EmptyTitle>
              {settings.emptyStateDescription ? (
                <EmptyDescription>{settings.emptyStateDescription}</EmptyDescription>
              ) : null}
            </EmptyHeader>
          </Empty>
        ) : query.type === 'event' ? (
          <div className="flex flex-col gap-12">
            {upcomingEvents ? (
              <FeedSection
                label={settings.upcomingEventsLabel}
                page={upcomingEvents}
                pageKey="upcomingPage"
                query={query}
                readMoreLabel={settings.readMoreLabel}
                taxonomyContext={taxonomyContext}
              />
            ) : null}
            {pastEvents ? (
              <FeedSection
                label={settings.pastEventsLabel}
                page={pastEvents}
                pageKey="pastPage"
                query={query}
                readMoreLabel={settings.readMoreLabel}
                taxonomyContext={taxonomyContext}
              />
            ) : null}
          </div>
        ) : (
          <FeedSection
            page={archiveData}
            pageKey="page"
            query={query}
            readMoreLabel={settings.readMoreLabel}
            taxonomyContext={taxonomyContext}
          />
        )}
      </div>
    </main>
  )
}
