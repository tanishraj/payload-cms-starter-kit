import type { Metadata } from 'next'

import { getMediaAbsoluteUrl } from '@/lib/media'
import { resolveCanonicalURL, resolveRobotsMode } from '@/lib/seo'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'
import type { PublicNewsEventDetail } from '@/lib/newsEventsShared'
import type { NewsEventsSetting } from '@/payload-types'

const absoluteCanonical = (canonicalURL: string | null): string | undefined =>
  canonicalURL ? toAbsoluteSiteUrl(canonicalURL) : undefined

export function getNewsEventsArchiveMetadata(settings: NewsEventsSetting): Metadata {
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
    robots: resolveRobotsMode({ robotsMode: settings.robotsMode }),
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: settings.ogTitle?.trim() || title,
      description: settings.ogDescription?.trim() || description,
      images: image ? [image] : undefined,
    },
  }
}

export function getNewsEventDetailMetadata(entry: PublicNewsEventDetail): Metadata {
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
    robots: resolveRobotsMode({ robotsMode: entry.robotsMode }),
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
