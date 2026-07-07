import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Metadata } from 'next'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { getRobotsMetadata } from '@/lib/seo'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'
import type { Media, Page, SeoSetting, SystemPage } from '@/payload-types'
import { getPageHref, getPageSlugSegments } from '@/lib/pagePaths'
import type { SystemPageType } from '@/lib/systemPageTypes'

const extractRelationshipID = (
  value: number | Page | SystemPage | null | undefined,
): number | null => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    return value.id
  }

  return null
}

const getPageSettings = cache(async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.findGlobal({
    slug: 'page-settings',
    depth: 0,
  })
})

const getSeoSettings = cache(async (): Promise<SeoSetting> => {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.findGlobal({
    slug: 'seo-settings',
    depth: 1,
  })
})

const canCurrentRequestBypassSystemModes = cache(async (): Promise<boolean> => {
  const pageSettings = await getPageSettings()

  if (!pageSettings.bypassForLoggedInAdmins) {
    return false
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const authResult = await payload.auth({
    canSetHeaders: false,
    headers: new Headers(await headers()),
  })

  return Boolean(authResult.user)
})

const getPublishedPageByID = cache(
  async ({
    depth = 2,
    id,
  }: {
    depth?: number
    id: number
  }): Promise<Page | null> => {
    const payload = await getPayload({
      config: configPromise,
    })

    const andConditions: Where[] = [
      {
        id: {
          equals: id,
        },
      },
      {
        _status: {
          equals: 'published',
        },
      },
    ]

    const result = await payload.find({
      collection: 'pages',
      where: {
        and: andConditions,
      },
      depth,
      limit: 1,
    })

    return result.docs[0] ?? null
  },
)

export const getPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'pages',
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

const getPageByPathname = cache(async (pathname: string): Promise<Page | null> => {
  const segments = pathname.split('/').filter(Boolean)

  if (!segments.length) {
    return null
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const leafSlug = segments[segments.length - 1]
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          slug: {
            equals: leafSlug,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: Math.max(segments.length, 2),
    limit: 1,
  })

  const page = result.docs[0] ?? null

  if (!page) {
    return null
  }

  const resolvedSegments = getPageSlugSegments(page)

  return resolvedSegments.join('/') === pathname ? page : null
})

export async function getPageByPath(segments: string[]): Promise<Page | null> {
  return getPageByPathname(segments.join('/'))
}

export const getHomepagePage = cache(async (): Promise<Page | null> => {
  const homepageID = extractRelationshipID((await getPageSettings()).homepage)

  if (homepageID == null) {
    return null
  }

  return getPublishedPageByID({
    depth: 2,
    id: homepageID,
  })
})

export async function getHomepagePath(): Promise<string | null> {
  const homepage = await getHomepagePage()
  const href = getPageHref(homepage)

  if (!href || href === '/') {
    return null
  }

  return href
}

const toBaseMetadata = (
  page: Pick<Page, 'metaDescription' | 'metaTitle'> | Pick<SystemPage, 'metaDescription' | 'metaTitle'> | null,
): Metadata => {
  if (!page) {
    return {}
  }

  return {
    title: page.metaTitle,
    description: page.metaDescription,
  }
}

const toManagedPageMetadata = async (page: Page): Promise<Metadata> => {
  const [pageSettings, seoSettings] = await Promise.all([getPageSettings(), getSeoSettings()])

  const homepageID = extractRelationshipID(pageSettings.homepage)
  const isHomepage = homepageID != null && page.id === homepageID
  const resolvedCanonicalPath = isHomepage ? '/' : getPageHref(page)
  const canonicalValue = page.canonicalURL?.trim() || resolvedCanonicalPath
  const canonicalUrl = canonicalValue ? toAbsoluteSiteUrl(canonicalValue) : undefined
  const defaultImageUrl = getMediaAbsoluteUrl(seoSettings.defaultImage)
  const pageImageUrl = getMediaAbsoluteUrl(page.ogImage) ?? defaultImageUrl
  const openGraphTitle = page.ogTitle || page.metaTitle || seoSettings.defaultTitle || undefined
  const openGraphDescription =
    page.ogDescription || page.metaDescription || seoSettings.defaultDescription || undefined

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: canonicalUrl,
      type: 'website',
      images: pageImageUrl
        ? [
            {
              url: pageImageUrl,
            },
          ]
        : undefined,
    },
    robots: getRobotsMetadata(page.robots || seoSettings.robots),
    twitter: {
      card: pageImageUrl ? 'summary_large_image' : 'summary',
      title: openGraphTitle,
      description: openGraphDescription,
      images: pageImageUrl ? [pageImageUrl] : undefined,
    },
  }
}

const getPublishedSystemPageByID = cache(
  async ({
    depth = 1,
    expectedType,
    id,
  }: {
    depth?: number
    expectedType?: SystemPageType
    id: number
  }): Promise<SystemPage | null> => {
    const payload = await getPayload({
      config: configPromise,
    })

    const andConditions: Where[] = [
      {
        id: {
          equals: id,
        },
      },
      {
        _status: {
          equals: 'published',
        },
      },
    ]

    if (expectedType) {
      andConditions.push({
        type: {
          equals: expectedType,
        },
      })
    }

    const result = await payload.find({
      collection: 'system-pages',
      where: {
        and: andConditions,
      },
      depth,
      limit: 1,
    })

    return result.docs[0] ?? null
  },
)

const getSystemBehaviorPages = cache(async () => {
  const pageSettings = await getPageSettings()
  const [notFoundPage, maintenancePage, comingSoonPage] = await Promise.all([
    extractRelationshipID(pageSettings.notFoundPage)
      ? getPublishedSystemPageByID({
          depth: 10,
          expectedType: '404',
          id: extractRelationshipID(pageSettings.notFoundPage)!,
        })
      : Promise.resolve(null),
    extractRelationshipID(pageSettings.maintenancePage)
      ? getPublishedSystemPageByID({
          depth: 10,
          expectedType: 'maintenance',
          id: extractRelationshipID(pageSettings.maintenancePage)!,
        })
      : Promise.resolve(null),
    extractRelationshipID(pageSettings.comingSoonPage)
      ? getPublishedSystemPageByID({
          depth: 10,
          expectedType: 'comingSoon',
          id: extractRelationshipID(pageSettings.comingSoonPage)!,
        })
      : Promise.resolve(null),
  ])

  return {
    bypassForLoggedInAdmins: Boolean(pageSettings.bypassForLoggedInAdmins),
    comingSoonPage,
    maintenancePage,
    notFoundPage,
    siteMode: pageSettings.siteMode ?? 'off',
  }
})

export async function getSystemPageRenderState(_pathname: string): Promise<{
  mode: 'comingSoon' | 'maintenance' | null
  page: SystemPage | null
}> {
  const systemBehavior = await getSystemBehaviorPages()

  if (systemBehavior.bypassForLoggedInAdmins && (await canCurrentRequestBypassSystemModes())) {
    return {
      mode: null,
      page: null,
    }
  }

  if (systemBehavior.siteMode === 'maintenance') {
    return {
      mode: 'maintenance',
      page: systemBehavior.maintenancePage,
    }
  }

  if (systemBehavior.siteMode === 'comingSoon') {
    return {
      mode: 'comingSoon',
      page: systemBehavior.comingSoonPage,
    }
  }

  return {
    mode: null,
    page: null,
  }
}

export async function getManagedNotFoundPage(): Promise<SystemPage | null> {
  return (await getSystemBehaviorPages()).notFoundPage
}

export async function getPageMetadataBySlug(slug: string): Promise<Metadata> {
  const page = await getPageBySlug(slug)

  if (!page) {
    return {}
  }

  return toManagedPageMetadata(page)
}

export async function getPageMetadataByPath(segments: string[]): Promise<Metadata> {
  const pathname = `/${segments.join('/')}`
  const systemPageState = await getSystemPageRenderState(pathname)

  if (systemPageState.page) {
    return toBaseMetadata(systemPageState.page)
  }

  if (systemPageState.mode === 'maintenance') {
    return {
      title: 'Maintenance',
    }
  }

  if (systemPageState.mode === 'comingSoon') {
    return {
      title: 'Coming Soon',
    }
  }

  const page = await getPageByPath(segments)

  if (page) {
    return toManagedPageMetadata(page)
  }

  return toBaseMetadata(await getManagedNotFoundPage())
}

export async function getHomepageMetadata(): Promise<Metadata> {
  const systemPageState = await getSystemPageRenderState('/')

  if (systemPageState.page) {
    return toBaseMetadata(systemPageState.page)
  }

  if (systemPageState.mode === 'maintenance') {
    return {
      title: 'Maintenance',
    }
  }

  if (systemPageState.mode === 'comingSoon') {
    return {
      title: 'Coming Soon',
    }
  }

  const homepage = await getHomepagePage()

  if (homepage) {
    return toManagedPageMetadata(homepage)
  }

  return toBaseMetadata(await getManagedNotFoundPage())
}
