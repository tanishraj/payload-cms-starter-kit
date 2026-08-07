import type { Metadata } from 'next'

import { getMediaAbsoluteUrl } from '@/lib/media'
import { resolveCanonicalURL, resolveRobotsMode, type RobotsFieldValue } from '@/lib/seo'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'
import type { PublicNewsEventDetail } from '@/lib/newsEventsShared'
import type { Category, NewsEventsSetting, Tag } from '@/payload-types'

const absoluteCanonical = (canonicalURL: string | null): string | undefined =>
  canonicalURL ? toAbsoluteSiteUrl(canonicalURL) : undefined

export function getNewsEventsArchiveMetadata(
  settings: NewsEventsSetting,
  inheritedRobots: RobotsFieldValue | null | undefined,
): Metadata {
  const title = settings.metaTitle?.trim() || settings.title
  const description = settings.metaDescription?.trim() || settings.description?.trim() || undefined
  const canonical = absoluteCanonical(
    resolveCanonicalURL({ canonicalURL: settings.canonicalURL, resolvedPath: '/news-events' }),
  )
  const image = getMediaAbsoluteUrl(settings.ogImage)

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: settings.ogTitle?.trim() || title,
      description: settings.ogDescription?.trim() || description,
      images: image ? [{ url: image }] : undefined,
      type: 'website',
      url: canonical,
    },
    robots: resolveRobotsMode({ inheritedRobots, robotsMode: settings.robotsMode }),
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: settings.ogTitle?.trim() || title,
      description: settings.ogDescription?.trim() || description,
      images: image ? [image] : undefined,
    },
  }
}

export function getNewsEventsTaxonomyMetadata({
  inheritedRobots,
  pathname,
  settings,
  term,
}: {
  inheritedRobots: RobotsFieldValue | null | undefined
  pathname: string
  settings: NewsEventsSetting
  term: Category | Tag
}): Metadata {
  const title = term.metaTitle?.trim() || `${term.title} | News & Events`
  const description =
    term.metaDescription?.trim() ||
    term.description?.trim() ||
    settings.metaDescription?.trim() ||
    settings.description?.trim() ||
    undefined
  const canonical = absoluteCanonical(
    resolveCanonicalURL({ canonicalURL: term.canonicalURL, resolvedPath: pathname }),
  )
  const image = getMediaAbsoluteUrl(term.ogImage) || getMediaAbsoluteUrl(settings.ogImage)
  const openGraphTitle = term.ogTitle?.trim() || title
  const openGraphDescription = term.ogDescription?.trim() || description

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      images: image ? [{ url: image }] : undefined,
      type: 'website',
      url: canonical,
    },
    robots: resolveRobotsMode({ inheritedRobots, robotsMode: term.robotsMode }),
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: openGraphTitle,
      description: openGraphDescription,
      images: image ? [image] : undefined,
    },
  }
}

export function getNewsEventDetailMetadata(
  entry: PublicNewsEventDetail,
  inheritedRobots: RobotsFieldValue | null | undefined,
): Metadata {
  const title = entry.metaTitle || entry.title
  const description = entry.metaDescription || entry.excerpt
  const canonical = absoluteCanonical(
    resolveCanonicalURL({ canonicalURL: entry.canonicalURL, resolvedPath: entry.href }),
  )
  const image = entry.ogImageURL || entry.image?.src

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: entry.ogTitle || title,
      description: entry.ogDescription || description,
      images: image ? [{ url: image }] : undefined,
      type: 'article',
      url: canonical,
    },
    robots: resolveRobotsMode({ inheritedRobots, robotsMode: entry.robotsMode }),
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: entry.ogTitle || title,
      description: entry.ogDescription || description,
      images: image ? [image] : undefined,
    },
  }
}

export function getNewsEventStructuredData(entry: PublicNewsEventDetail) {
  const url = toAbsoluteSiteUrl(entry.href)

  if (entry.contentType === 'event') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      description: entry.excerpt,
      endDate: entry.eventEnd,
      image: entry.image?.src,
      location: entry.eventLocation ? { '@type': 'Place', name: entry.eventLocation } : undefined,
      name: entry.title,
      startDate: entry.eventStart,
      url,
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    author: entry.authorName ? { '@type': 'Person', name: entry.authorName } : undefined,
    dateModified: entry.updatedAt,
    datePublished: entry.publishedAt,
    description: entry.excerpt,
    headline: entry.title,
    image: entry.image?.src,
    mainEntityOfPage: url,
    url,
  }
}
