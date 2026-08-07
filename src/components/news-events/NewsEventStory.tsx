import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { CalendarDays, MapPin } from 'lucide-react'

import { regularBlockContainerClasses } from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { Badge } from '@/components/ui/badge'
import {
  formatNewsEventDateTime,
  newsEventObjectPositionClasses,
  type PublicNewsEventDetail,
} from '@/lib/newsEventsShared'
import { getNewsEventsCategoryPath, getNewsEventsTagPath } from '@/lib/newsEventsPaths'
import { cn } from '@/lib/utils'

export function NewsEventStory({ entry }: { entry: PublicNewsEventDetail }) {
  return (
    <article className="py-12 text-current md:py-16" data-news-event-story="true">
      <div className={cn(regularBlockContainerClasses, 'flex flex-col gap-8')}>
        <header className="flex w-full flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-current/70">
            <Badge variant="secondary">{entry.contentType === 'event' ? 'Event' : 'News'}</Badge>
            {entry.category ? (
              <Link
                className="transition-colors underline-offset-4 hover:text-current hover:underline"
                href={getNewsEventsCategoryPath(entry.category.slug)}
              >
                {entry.category.title}
              </Link>
            ) : null}
            <span aria-hidden="true">·</span>
            <time dateTime={entry.dateISO}>{entry.dateLabel}</time>
            {entry.authorName ? <span>By {entry.authorName}</span> : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {entry.title}
          </h1>
          <p className="text-base leading-7 text-current/70">{entry.excerpt}</p>
          {entry.contentType === 'event' ? (
            <div className="flex flex-col gap-3 border-y border-border py-5 text-sm text-current/80 sm:flex-row sm:flex-wrap sm:gap-x-8">
              {entry.eventStart ? (
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  <span>{formatNewsEventDateTime(entry.eventStart)}</span>
                  {entry.eventEnd ? <span>– {formatNewsEventDateTime(entry.eventEnd)}</span> : null}
                </p>
              ) : null}
              {entry.eventLocation ? (
                <p className="flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden="true" />
                  {entry.eventLocation}
                </p>
              ) : null}
              {entry.eventRegistrationAction ? (
                <ContentActions
                  actions={[entry.eventRegistrationAction]}
                  className="sm:ml-auto sm:w-auto"
                  mode={entry.eventRegistrationMode ?? 'link'}
                />
              ) : null}
            </div>
          ) : null}
        </header>

        {entry.image ? (
          <div className="relative aspect-16/8 overflow-hidden rounded-md border border-border bg-muted">
            <Image
              fill
              alt={entry.image.alt}
              className={cn('object-cover', newsEventObjectPositionClasses[entry.image.position])}
              src={entry.image.src}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        ) : null}

        <div className="prose w-full max-w-none text-current prose-headings:text-current prose-p:text-current/80 prose-a:text-current prose-a:underline-offset-4 prose-strong:text-current prose-blockquote:border-border prose-blockquote:text-current/80 prose-hr:border-border prose-li:text-current/80">
          <RichText data={entry.body} />
        </div>

        {entry.categories.length || entry.tags.length ? (
          <footer className="flex w-full flex-wrap gap-2 border-t border-border pt-6">
            {entry.categories.map((term) => (
              <Link
                className="rounded-md border border-border px-3 py-1 text-sm text-current/70 transition-colors hover:bg-muted hover:text-current"
                href={getNewsEventsCategoryPath(term.slug)}
                key={`category-${term.id}`}
              >
                {term.title}
              </Link>
            ))}
            {entry.tags.map((tag) => (
              <Link
                className="rounded-md border border-border px-3 py-1 text-sm text-current/70 transition-colors hover:bg-muted hover:text-current"
                href={getNewsEventsTagPath(tag.slug)}
                key={`tag-${tag.id}`}
              >
                {tag.title}
              </Link>
            ))}
          </footer>
        ) : null}
      </div>
    </article>
  )
}
