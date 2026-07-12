import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { getPageHrefFromSourceWithResolver, getPageID } from '@/lib/pagePaths'
import { resolveRobotsMode, resolveSitemapInclusion, type RobotsFieldValue } from '@/lib/seo'
import { getTaxonomyRelationshipIDs, getTaxonomyTerm } from '@/lib/taxonomy'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'

export const revalidate = 300

type SitemapEntryLike = {
  includeInSitemap?: string | null
  robotsMode?: string | null
  slug?: string | null
  updatedAt?: string | null
}

const isRouteEligibleForSitemap = ({
  entry,
  inheritedRobots,
  isPublicRoute = true,
  isPublished = true,
}: {
  entry: SitemapEntryLike
  inheritedRobots: RobotsFieldValue | null | undefined
  isPublicRoute?: boolean
  isPublished?: boolean
}) => {
  const resolvedRobots = resolveRobotsMode({
    inheritedRobots,
    robotsMode:
      typeof entry.robotsMode === 'string' ? (entry.robotsMode as 'default' | 'index' | 'noindex') : null,
  })

  const isIndexable =
    typeof resolvedRobots === 'object' && resolvedRobots !== null
      ? resolvedRobots.index !== false
      : resolvedRobots !== 'noindex'

  return resolveSitemapInclusion({
    includeInSitemap:
      typeof entry.includeInSitemap === 'string'
        ? (entry.includeInSitemap as 'default' | 'include' | 'exclude')
        : 'default',
    isIndexable,
    isPublicRoute,
    isPublished,
  })
}

const addEntry = ({
  entries,
  lastModified,
  pathname,
}: {
  entries: Map<string, MetadataRoute.Sitemap[number]>
  lastModified?: string | null
  pathname: string
}) => {
  entries.set(pathname, {
    lastModified: lastModified ?? undefined,
    url: toAbsoluteSiteUrl(pathname),
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({
    config: configPromise,
  })

  const [pageSettings, seoSettings] = await Promise.all([
    payload.findGlobal({
      slug: 'page-settings',
      depth: 0,
    }),
    payload.findGlobal({
      slug: 'seo-settings',
      depth: 0,
    }),
  ])

  const inheritedRobots = seoSettings.robots
  const homepageID = getPageID(pageSettings.homepage)
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()
  const resolvePageParent = async (id: string | number) => {
    return payload.findByID({
      collection: 'pages',
      id,
      depth: 0,
    })
  }

  const pagesResult = await payload.find({
    collection: 'pages',
    where: {
      _status: {
        equals: 'published',
      },
    },
    depth: 1,
    limit: 100,
    sort: 'createdAt',
  })

  for (const page of pagesResult.docs) {
    const pagePath = await getPageHrefFromSourceWithResolver(page, resolvePageParent)

    if (!pagePath || !isRouteEligibleForSitemap({ entry: page, inheritedRobots })) {
      continue
    }

    const isHomepage = homepageID != null && page.id === homepageID
    addEntry({
      entries,
      lastModified: page.updatedAt,
      pathname: isHomepage ? '/' : pagePath,
    })
  }

  const articlesResult = await payload.find({
    collection: 'articles',
    where: {
      _status: {
        equals: 'published',
      },
    },
    depth: 1,
    limit: 100,
    sort: 'createdAt',
  })

  for (const article of articlesResult.docs) {
    if (!article.slug || !isRouteEligibleForSitemap({ entry: article, inheritedRobots })) {
      continue
    }

    addEntry({
      entries,
      lastModified: article.updatedAt,
      pathname: `/articles/${article.slug}`,
    })
  }

  const reviewsResult = await payload.find({
    collection: 'reviews',
    where: {
      _status: {
        equals: 'published',
      },
    },
    depth: 1,
    limit: 100,
    sort: 'createdAt',
  })

  for (const review of reviewsResult.docs) {
    if (!review.slug || !isRouteEligibleForSitemap({ entry: review, inheritedRobots })) {
      continue
    }

    addEntry({
      entries,
      lastModified: review.updatedAt,
      pathname: `/reviews/${review.slug}`,
    })
  }

  const usedCategoryIDs = new Set<number | string>()
  const usedTagIDs = new Set<number | string>()

  for (const article of articlesResult.docs) {
    const primaryCategory = getTaxonomyTerm(article.primaryCategory)

    if (primaryCategory) {
      usedCategoryIDs.add(primaryCategory.id)
    }

    for (const tagID of getTaxonomyRelationshipIDs(article.tags)) {
      usedTagIDs.add(tagID)
    }
  }

  for (const review of reviewsResult.docs) {
    const primaryCategory = getTaxonomyTerm(review.primaryCategory)

    if (primaryCategory) {
      usedCategoryIDs.add(primaryCategory.id)
    }
  }

  const [categoriesResult, tagsResult] = await Promise.all([
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      sort: 'createdAt',
    }),
    payload.find({
      collection: 'tags',
      depth: 0,
      limit: 100,
      sort: 'createdAt',
    }),
  ])

  for (const category of categoriesResult.docs) {
    if (
      !usedCategoryIDs.has(category.id) ||
      !category.slug ||
      !isRouteEligibleForSitemap({ entry: category, inheritedRobots })
    ) {
      continue
    }

    addEntry({
      entries,
      lastModified: category.updatedAt,
      pathname: `/articles/category/${category.slug}`,
    })
    addEntry({
      entries,
      lastModified: category.updatedAt,
      pathname: `/reviews/category/${category.slug}`,
    })
  }

  for (const tag of tagsResult.docs) {
    if (!usedTagIDs.has(tag.id) || !tag.slug || !isRouteEligibleForSitemap({ entry: tag, inheritedRobots })) {
      continue
    }

    addEntry({
      entries,
      lastModified: tag.updatedAt,
      pathname: `/articles/tag/${tag.slug}`,
    })
  }

  return [...entries.values()]
}
