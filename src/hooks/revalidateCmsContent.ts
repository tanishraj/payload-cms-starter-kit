import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

/**
 * Cache tag constants.
 * These match the tags used in unstable_cache wrappers in pageData.ts and layout.tsx.
 */
export const CMS_CACHE_TAGS = {
  pages: 'cms-pages',
  globals: 'cms-globals',
  articles: 'cms-articles',
  reviews: 'cms-reviews',
  newsEvents: 'cms-news-events',
  sitemap: 'cms-sitemap',
  redirects: 'cms-redirects',
} as const

// In Next.js 16+, revalidateTag requires a second `profile` argument.
// Passing 'max' instructs Next.js to revalidate cache entries of any lifetime.
const REVALIDATE_PROFILE = 'max'

/**
 * Revalidates the pages cache when a page is created, updated, or deleted.
 * Also busts the sitemap so the next request regenerates it.
 */
export const revalidatePagesCache: CollectionAfterChangeHook = ({ doc }) => {
  const isPublished = doc._status === 'published'
  const wasPublished = doc._status !== 'draft'

  if (isPublished || wasPublished) {
    revalidateTag(CMS_CACHE_TAGS.pages, REVALIDATE_PROFILE)
    revalidateTag(CMS_CACHE_TAGS.sitemap, REVALIDATE_PROFILE)
  }

  return doc
}

/**
 * Revalidates the articles cache when an article changes.
 */
export const revalidateArticlesCache: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status === 'published') {
    revalidateTag(CMS_CACHE_TAGS.articles, REVALIDATE_PROFILE)
    revalidateTag(CMS_CACHE_TAGS.sitemap, REVALIDATE_PROFILE)
  }

  return doc
}

/**
 * Revalidates the reviews cache when a review changes.
 */
export const revalidateReviewsCache: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status === 'published') {
    revalidateTag(CMS_CACHE_TAGS.reviews, REVALIDATE_PROFILE)
    revalidateTag(CMS_CACHE_TAGS.sitemap, REVALIDATE_PROFILE)
  }

  return doc
}

/**
 * Revalidates the news-events cache when a news/event entry changes.
 */
export const revalidateNewsEventsCache: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status === 'published') {
    revalidateTag(CMS_CACHE_TAGS.newsEvents, REVALIDATE_PROFILE)
    revalidateTag(CMS_CACHE_TAGS.sitemap, REVALIDATE_PROFILE)
  }

  return doc
}

/**
 * Revalidates the globals cache (header, footer, theme, settings).
 * Busts pages too since header/footer/theme changes affect all pages.
 * Used by both collections (Headers, Footers, ReusableSections) and globals.
 */
export const revalidateGlobalsCache: CollectionAfterChangeHook = ({ doc }) => {
  revalidateTag(CMS_CACHE_TAGS.globals, REVALIDATE_PROFILE)
  revalidateTag(CMS_CACHE_TAGS.pages, REVALIDATE_PROFILE)
  return doc
}

/**
 * Same as revalidateGlobalsCache but typed for Payload global afterChange hooks.
 */
export const revalidateGlobalsCacheForGlobal: GlobalAfterChangeHook = ({ doc }) => {
  revalidateTag(CMS_CACHE_TAGS.globals, REVALIDATE_PROFILE)
  revalidateTag(CMS_CACHE_TAGS.pages, REVALIDATE_PROFILE)
  return doc
}

/**
 * Revalidates the redirects API cache when a redirect is created, updated, or deleted.
 */
export const revalidateRedirectsCache: CollectionAfterChangeHook = ({ doc }) => {
  const isPublished = doc._status === 'published'
  const wasPublished = doc._status !== 'draft'
  if (isPublished || wasPublished) {
    revalidateTag(CMS_CACHE_TAGS.redirects, REVALIDATE_PROFILE)
  }
  return doc
}
