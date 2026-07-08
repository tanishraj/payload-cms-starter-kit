import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Metadata } from 'next'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { getRobotsMetadata } from '@/lib/seo'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'
import type { Article, Review, SeoSetting } from '@/payload-types'

type ManagedEntryMetadataSource = {
  canonicalURL?: string | null
  metaDescription?: string | null
  metaTitle?: string | null
  ogDescription?: string | null
  ogImage?: Article['ogImage']
  ogTitle?: string | null
  robots?: string | null
}

const getSeoSettings = cache(async (): Promise<SeoSetting> => {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.findGlobal({
    slug: 'seo-settings',
    depth: 1,
  })
})

const toManagedEntryMetadata = async ({
  entry,
  resolvedCanonicalPath,
}: {
  entry: ManagedEntryMetadataSource
  resolvedCanonicalPath: string
}): Promise<Metadata> => {
  const seoSettings = await getSeoSettings()
  const canonicalValue = entry.canonicalURL?.trim() || resolvedCanonicalPath
  const canonicalUrl = canonicalValue ? toAbsoluteSiteUrl(canonicalValue) : undefined
  const defaultImageUrl = getMediaAbsoluteUrl(seoSettings.defaultImage)
  const entryImageUrl = getMediaAbsoluteUrl(entry.ogImage) ?? defaultImageUrl
  const openGraphTitle = entry.ogTitle || entry.metaTitle || seoSettings.defaultTitle || undefined
  const openGraphDescription =
    entry.ogDescription || entry.metaDescription || seoSettings.defaultDescription || undefined

  return {
    title: entry.metaTitle ?? undefined,
    description: entry.metaDescription ?? undefined,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: canonicalUrl,
      type: 'article',
      images: entryImageUrl
        ? [
            {
              url: entryImageUrl,
            },
          ]
        : undefined,
    },
    robots: getRobotsMetadata(entry.robots || seoSettings.robots),
    twitter: {
      card: entryImageUrl ? 'summary_large_image' : 'summary',
      title: openGraphTitle,
      description: openGraphDescription,
      images: entryImageUrl ? [entryImageUrl] : undefined,
    },
  }
}

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'articles',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] ?? null
})

export async function getArticleMetadataBySlug(slug: string): Promise<Metadata> {
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {}
  }

  return toManagedEntryMetadata({
    entry: article,
    resolvedCanonicalPath: `/articles/${article.slug}`,
  })
}

export const getReviewBySlug = cache(async (slug: string): Promise<Review | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] ?? null
})

export async function getReviewMetadataBySlug(slug: string): Promise<Metadata> {
  const review = await getReviewBySlug(slug)

  if (!review) {
    return {}
  }

  return toManagedEntryMetadata({
    entry: review,
    resolvedCanonicalPath: `/reviews/${review.slug}`,
  })
}
