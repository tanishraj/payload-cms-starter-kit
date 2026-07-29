import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

const MIN_QUERY_LENGTH = 2
const PER_TYPE_LIMIT = 8

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false },
}

type SearchItem = {
  id: string
  title: string
  excerpt: string
  href: string
  label: string
  accent: string
}

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

async function runSearch(query: string): Promise<SearchItem[]> {
  const payload = await getPayload({ config: configPromise })
  const textLike = { like: query }

  const [pagesResult, articlesResult, newsEventsResult] = await Promise.allSettled([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: PER_TYPE_LIMIT,
      where: { and: [{ _status: { equals: 'published' } }, { title: textLike }] },
    }),
    payload.find({
      collection: 'articles',
      depth: 0,
      limit: PER_TYPE_LIMIT,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { or: [{ title: textLike }, { excerpt: textLike }, { authorName: textLike }] },
        ],
      },
    }),
    payload.find({
      collection: 'news-events',
      depth: 0,
      limit: PER_TYPE_LIMIT,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { workflowState: { equals: 'published' } },
          { or: [{ title: textLike }, { excerpt: textLike }] },
        ],
      },
    }),
  ])

  const items: SearchItem[] = []

  if (pagesResult.status === 'fulfilled') {
    for (const page of pagesResult.value.docs) {
      items.push({
        id: String(page.id),
        title: page.title,
        excerpt: page.metaDescription ?? '',
        href: `/${page.slug}`,
        label: 'Page',
        accent: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
      })
    }
  }

  if (articlesResult.status === 'fulfilled') {
    for (const article of articlesResult.value.docs) {
      items.push({
        id: String(article.id),
        title: article.title,
        excerpt: article.excerpt,
        href: `/articles/${article.slug}`,
        label: 'Article',
        accent: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
      })
    }
  }

  if (newsEventsResult.status === 'fulfilled') {
    for (const entry of newsEventsResult.value.docs) {
      items.push({
        id: String(entry.id),
        title: entry.title,
        excerpt: entry.excerpt,
        href: `/news-events/${entry.slug}`,
        label: entry.contentType === 'event' ? 'Event' : 'News',
        accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      })
    }
  }

  return items
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const hasQuery = query.length >= MIN_QUERY_LENGTH
  const results = hasQuery ? await runSearch(query) : []

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      {/* Heading */}
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Search</h1>

      {/* Search form */}
      <form method="GET" action="/search" className="mb-10" role="search" aria-label="Site search">
        <div className="flex gap-3">
          <input
            type="search"
            name="q"
            id="search-input"
            defaultValue={query}
            placeholder="Search pages, articles, news & events…"
            aria-label="Search query"
            autoFocus
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="h-11 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div aria-live="polite" aria-atomic="true">
      {!hasQuery ? (
        <p className="text-sm text-muted-foreground">
          Enter at least {MIN_QUERY_LENGTH} characters to search.
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No results found for <strong>&ldquo;{query}&rdquo;</strong>. Try a different term.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="mb-2 text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
            <strong>&ldquo;{query}&rdquo;</strong>
          </p>
          <ul className="flex flex-col gap-px" role="list">
            {results.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-4 rounded-xl p-4 transition hover:bg-muted"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${item.accent}`}
                  >
                    {item.label}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground group-hover:underline group-hover:underline-offset-2">
                      {item.title}
                    </p>
                    {item.excerpt ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {item.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  )
}
