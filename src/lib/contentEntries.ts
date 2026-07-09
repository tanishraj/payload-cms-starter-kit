import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Metadata } from 'next'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { getRobotsMetadata } from '@/lib/seo'
import { getTaxonomyRelationshipIDs, getTaxonomyTerm } from '@/lib/taxonomy'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'
import type { Article, Review, SeoSetting } from '@/payload-types'

type TaxonomyArchiveTerm = {
  description?: string | null
  id: number | string
  slug: string
  title: string
}

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

const getCategoryBySlug = cache(async (slug: string): Promise<TaxonomyArchiveTerm | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 1,
    limit: 1,
  })

  return getTaxonomyTerm(result.docs[0] ?? null)
})

const getTagBySlug = cache(async (slug: string): Promise<TaxonomyArchiveTerm | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'tags',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 0,
    limit: 1,
  })

  return getTaxonomyTerm(result.docs[0] ?? null)
})

const toTaxonomyArchiveMetadata = async ({
  collectionLabel,
  fallbackTitle,
  path,
  term,
}: {
  collectionLabel: string
  fallbackTitle: string
  path: string
  term: TaxonomyArchiveTerm | null
}): Promise<Metadata> => {
  const seoSettings = await getSeoSettings()
  const title = term ? `${term.title} ${collectionLabel}` : fallbackTitle
  const description =
    term?.description?.trim() ||
    `Browse published ${collectionLabel.toLowerCase()} content for ${term?.title ?? fallbackTitle}.`
  const canonicalUrl = toAbsoluteSiteUrl(path)
  const defaultImageUrl = getMediaAbsoluteUrl(seoSettings.defaultImage)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: defaultImageUrl
        ? [
            {
              url: defaultImageUrl,
            },
          ]
        : undefined,
    },
    robots: getRobotsMetadata(seoSettings.robots),
    twitter: {
      card: defaultImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: defaultImageUrl ? [defaultImageUrl] : undefined,
    },
  }
}

const getPublishedArticles = cache(async (): Promise<Article[]> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'articles',
    where: {
      _status: {
        equals: 'published',
      },
    },
    depth: 2,
    limit: 100,
  })

  return result.docs
})

const getPublishedReviews = cache(async (): Promise<Review[]> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'reviews',
    where: {
      _status: {
        equals: 'published',
      },
    },
    depth: 2,
    limit: 100,
  })

  return result.docs
})

const toUniqueEntries = <T extends { id: number | string }>(entries: T[]): T[] => {
  const seenIDs = new Set<number | string>()

  return entries.filter((entry) => {
    if (seenIDs.has(entry.id)) {
      return false
    }

    seenIDs.add(entry.id)
    return true
  })
}

export const getArticleCategoryArchiveBySlug = cache(
  async (
    slug: string,
  ): Promise<{
    articles: Article[]
    category: TaxonomyArchiveTerm | null
  }> => {
    const [articles, category] = await Promise.all([getPublishedArticles(), getCategoryBySlug(slug)])
    const categoryID = category?.id

    return {
      articles:
        categoryID == null
          ? []
          : articles.filter((article) => getTaxonomyTerm(article.primaryCategory)?.id === categoryID),
      category,
    }
  },
)

export async function getArticleCategoryArchiveMetadataBySlug(slug: string): Promise<Metadata> {
  const category = await getCategoryBySlug(slug)

  return toTaxonomyArchiveMetadata({
    collectionLabel: 'Articles',
    fallbackTitle: 'Article Archive',
    path: `/articles/category/${slug}`,
    term: category,
  })
}

export const getArticleTagArchiveBySlug = cache(
  async (
    slug: string,
  ): Promise<{
    articles: Article[]
    tag: TaxonomyArchiveTerm | null
  }> => {
    const [articles, tag] = await Promise.all([getPublishedArticles(), getTagBySlug(slug)])
    const tagID = tag?.id

    return {
      articles:
        tagID == null
          ? []
          : articles.filter((article) => getTaxonomyRelationshipIDs(article.tags).includes(tagID)),
      tag,
    }
  },
)

export async function getArticleTagArchiveMetadataBySlug(slug: string): Promise<Metadata> {
  const tag = await getTagBySlug(slug)

  return toTaxonomyArchiveMetadata({
    collectionLabel: 'Articles',
    fallbackTitle: 'Tagged Articles',
    path: `/articles/tag/${slug}`,
    term: tag,
  })
}

export const getRelatedArticles = cache(
  async (article: Article, limit = 3): Promise<Article[]> => {
    const publishedArticles = await getPublishedArticles()
    const primaryCategoryID = getTaxonomyTerm(article.primaryCategory)?.id
    const tagIDs = new Set(getTaxonomyRelationshipIDs(article.tags))

    const samePrimaryCategory = publishedArticles.filter(
      (candidate) =>
        candidate.id !== article.id &&
        primaryCategoryID != null &&
        getTaxonomyTerm(candidate.primaryCategory)?.id === primaryCategoryID,
    )

    const sharedTags = publishedArticles.filter((candidate) => {
      if (candidate.id === article.id || !tagIDs.size) {
        return false
      }

      return getTaxonomyRelationshipIDs(candidate.tags).some((candidateTagID) =>
        tagIDs.has(candidateTagID),
      )
    })

    return toUniqueEntries([...samePrimaryCategory, ...sharedTags]).slice(0, limit)
  },
)

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

export const getReviewCategoryArchiveBySlug = cache(
  async (
    slug: string,
  ): Promise<{
    category: TaxonomyArchiveTerm | null
    reviews: Review[]
  }> => {
    const [reviews, category] = await Promise.all([getPublishedReviews(), getCategoryBySlug(slug)])
    const categoryID = category?.id

    return {
      category,
      reviews:
        categoryID == null
          ? []
          : reviews.filter((review) => getTaxonomyTerm(review.primaryCategory)?.id === categoryID),
    }
  },
)

export async function getReviewCategoryArchiveMetadataBySlug(slug: string): Promise<Metadata> {
  const category = await getCategoryBySlug(slug)

  return toTaxonomyArchiveMetadata({
    collectionLabel: 'Reviews',
    fallbackTitle: 'Review Archive',
    path: `/reviews/category/${slug}`,
    term: category,
  })
}

export const getRelatedReviews = cache(
  async (review: Review, limit = 3): Promise<Review[]> => {
    const publishedReviews = await getPublishedReviews()
    const primaryCategoryID = getTaxonomyTerm(review.primaryCategory)?.id
    const tagIDs = new Set(getTaxonomyRelationshipIDs(review.tags))

    const samePrimaryCategory = publishedReviews.filter(
      (candidate) =>
        candidate.id !== review.id &&
        primaryCategoryID != null &&
        getTaxonomyTerm(candidate.primaryCategory)?.id === primaryCategoryID,
    )

    const sharedTags = publishedReviews.filter((candidate) => {
      if (candidate.id === review.id || !tagIDs.size) {
        return false
      }

      return getTaxonomyRelationshipIDs(candidate.tags).some((candidateTagID) =>
        tagIDs.has(candidateTagID),
      )
    })

    return toUniqueEntries([...samePrimaryCategory, ...sharedTags]).slice(0, limit)
  },
)
