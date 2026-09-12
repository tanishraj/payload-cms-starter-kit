import { searchPublishedContent } from '@/lib/search'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  getTrustedClientIPAddress,
  InMemoryRateLimiter,
  type RateLimiter,
} from '@/domains/forms/rateLimiter'

const RATE_LIMIT = 20
const RATE_WINDOW_MS = 10_000
const searchRateLimiter: RateLimiter = new InMemoryRateLimiter({
  maxAttempts: RATE_LIMIT,
  maxKeys: 10_000,
  pruneIntervalMs: RATE_WINDOW_MS,
  windowMs: RATE_WINDOW_MS,
})

export type SearchResultItem = {
  id: string
  title: string
  excerpt: string
  href: string
  type: 'article' | 'news-event' | 'page' | 'review'
  label: string
}

export type SearchResponse = {
  results: SearchResultItem[]
  query: string
  total: number
}

const MIN_QUERY_LENGTH = 2
// Dialog shows 6 per type — enough for a compact list without overwhelming the UI.
// The SSR /search page uses 8 per type for the expanded view.
const PER_TYPE_LIMIT = 6

export async function GET(request: Request) {
  const ip = getTrustedClientIPAddress(request)
  const rateLimitDecision = searchRateLimiter.check(ip)

  if (rateLimitDecision.limited) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        headers: {
          'Retry-After': String(rateLimitDecision.retryAfterSeconds),
        },
        status: 429,
      },
    )
  }

  searchRateLimiter.record(ip)

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json<SearchResponse>({ results: [], query, total: 0 })
  }

  const payload = await getPayload({ config: configPromise })
  const results = await searchPublishedContent(payload, query, PER_TYPE_LIMIT)

  return NextResponse.json<SearchResponse>({ results, query, total: results.length })
}
