import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { toAbsoluteSiteUrl } from '@/lib/siteUrl'

// Simple in-memory rate limiter: max 20 requests per IP per 10 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 10_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  if (entry.count > RATE_LIMIT) return true
  return false
}

export type SearchResultItem = {
  id: string
  title: string
  excerpt: string
  href: string
  type: 'page' | 'article' | 'news-event'
  label: string
}

export type SearchResponse = {
  results: SearchResultItem[]
  query: string
  total: number
}

const MIN_QUERY_LENGTH = 2
const PER_TYPE_LIMIT = 6

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json<SearchResponse>({ results: [], query, total: 0 })
  }

  const payload = await getPayload({ config: configPromise })
  const textLike = { like: query }

  const [pagesResult, articlesResult, newsEventsResult] = await Promise.allSettled([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: PER_TYPE_LIMIT,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { title: textLike },
        ],
      },
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
          { or: [{ title: textLike }, { excerpt: textLike }] },
        ],
      },
    }),
  ])

  const results: SearchResultItem[] = []

  if (pagesResult.status === 'fulfilled') {
    for (const page of pagesResult.value.docs) {
      results.push({
        id: String(page.id),
        title: page.title,
        excerpt: page.metaDescription ?? '',
        href: `/${page.slug}`,
        type: 'page',
        label: 'Page',
      })
    }
  }

  if (articlesResult.status === 'fulfilled') {
    for (const article of articlesResult.value.docs) {
      results.push({
        id: String(article.id),
        title: article.title,
        excerpt: article.excerpt,
        href: `/articles/${article.slug}`,
        type: 'article',
        label: 'Article',
      })
    }
  }

  if (newsEventsResult.status === 'fulfilled') {
    for (const entry of newsEventsResult.value.docs) {
      results.push({
        id: String(entry.id),
        title: entry.title,
        excerpt: entry.excerpt,
        href: `/news-events/${entry.slug}`,
        type: 'news-event',
        label: entry.contentType === 'event' ? 'Event' : 'News',
      })
    }
  }

  return NextResponse.json<SearchResponse>({
    results,
    query,
    total: results.length,
  })
}
