import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import type { Metadata } from 'next'
import { isCurrentCMSAdmin } from '@/lib/cmsSession'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { resolveCanonicalURL, resolveRobotsMode } from '@/lib/seo'
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

const getPageSettings = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.findGlobal({
    slug: 'page-settings',
    depth: 0,
  })
}

const getSystemModeSettings = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.findGlobal({
    slug: 'system-mode-settings',
    depth: 0,
  })
}

const getSeoSettings = async (): Promise<SeoSetting> => {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.findGlobal({
    slug: 'seo-settings',
    depth: 1,
  })
}

const canCurrentRequestBypassSystemModes = async (): Promise<boolean> => {
  const systemModeSettings = await getSystemModeSettings()

  if (!systemModeSettings.bypassForLoggedInAdmins) {
    return false
  }

  return isCurrentCMSAdmin()
}

const getPublishedPageByID = async ({
  depth = 2,
  id,
}: {
  depth?: number
  id: number
}): Promise<Page | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
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
      ],
    },
    depth,
    limit: 1,
  })

  return result.docs[0] ?? null
}

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
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
}

const getPageByPathname = async (pathname: string): Promise<Page | null> => {
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
}

export async function getPageByPath(segments: string[]): Promise<Page | null> {
  return getPageByPathname(segments.join('/'))
}

export const getHomepagePage = async (): Promise<Page | null> => {
  const homepageID = extractRelationshipID((await getPageSettings()).homepage)

  if (homepageID == null) {
    return null
  }

  return getPublishedPageByID({
    depth: 2,
    id: homepageID,
  })
}

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

type ManagedRouteMetadataSource = {
  canonicalURL?: string | null
  fallbackDescription?: string | null
  fallbackTitle?: string | null
  metaDescription?: string | null
  metaTitle?: string | null
  ogDescription?: string | null
  ogImage?: Media | number | null
  ogTitle?: string | null
  robotsMode?: string | null
}

const toManagedRouteMetadata = async ({
  entry,
  resolvedCanonicalPath,
}: {
  entry: ManagedRouteMetadataSource
  resolvedCanonicalPath: string
}): Promise<Metadata> => {
  const seoSettings = await getSeoSettings()
  const resolvedCanonical = resolveCanonicalURL({
    canonicalURL: entry.canonicalURL,
    resolvedPath: resolvedCanonicalPath,
  })
  const canonicalUrl = resolvedCanonical ? toAbsoluteSiteUrl(resolvedCanonical) : undefined
  const defaultImageUrl = getMediaAbsoluteUrl(seoSettings.defaultImage)
  const pageImageUrl = getMediaAbsoluteUrl(entry.ogImage) ?? defaultImageUrl
  const resolvedTitle = entry.metaTitle || entry.fallbackTitle || seoSettings.defaultTitle || undefined
  const resolvedDescription =
    entry.metaDescription ||
    entry.fallbackDescription ||
    seoSettings.defaultDescription ||
    undefined
  const openGraphTitle = entry.ogTitle || resolvedTitle
  const openGraphDescription =
    entry.ogDescription || resolvedDescription

  return {
    title: resolvedTitle,
    description: resolvedDescription,
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
    robots: resolveRobotsMode({
      inheritedRobots: seoSettings.robots,
      robotsMode:
        typeof entry.robotsMode === 'string' ? (entry.robotsMode as 'default' | 'index' | 'noindex') : null,
    }),
    twitter: {
      card: pageImageUrl ? 'summary_large_image' : 'summary',
      title: openGraphTitle,
      description: openGraphDescription,
      images: pageImageUrl ? [pageImageUrl] : undefined,
    },
  }
}

const toManagedPageMetadata = async (page: Page): Promise<Metadata> => {
  const pageSettings = await getPageSettings()
  const homepageID = extractRelationshipID(pageSettings.homepage)
  const isHomepage = homepageID != null && page.id === homepageID
  const resolvedCanonicalPath = isHomepage ? '/' : getPageHref(page)

  return toManagedRouteMetadata({
    entry: {
      ...(page as unknown as ManagedRouteMetadataSource),
      fallbackTitle: page.title,
    },
    resolvedCanonicalPath,
  })
}

const toManagedSystemPageMetadata = async (page: SystemPage): Promise<Metadata> => {
  return toManagedRouteMetadata({
    entry: {
      ...(page as unknown as ManagedRouteMetadataSource),
      fallbackTitle: page.title,
    },
    resolvedCanonicalPath: '/',
  })
}

const getPublishedSystemPageByID = async ({
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
}

const getSystemBehaviorPages = async () => {
  const systemModeSettings = await getSystemModeSettings()
  const [notFoundPage, maintenancePage, comingSoonPage] = await Promise.all([
    extractRelationshipID(systemModeSettings.notFoundPage)
      ? getPublishedSystemPageByID({
          depth: 10,
          expectedType: '404',
          id: extractRelationshipID(systemModeSettings.notFoundPage)!,
        })
      : Promise.resolve(null),
    extractRelationshipID(systemModeSettings.maintenancePage)
      ? getPublishedSystemPageByID({
          depth: 10,
          expectedType: 'maintenance',
          id: extractRelationshipID(systemModeSettings.maintenancePage)!,
        })
      : Promise.resolve(null),
    extractRelationshipID(systemModeSettings.comingSoonPage)
      ? getPublishedSystemPageByID({
          depth: 10,
          expectedType: 'comingSoon',
          id: extractRelationshipID(systemModeSettings.comingSoonPage)!,
        })
      : Promise.resolve(null),
  ])

  return {
    bypassForLoggedInAdmins: Boolean(systemModeSettings.bypassForLoggedInAdmins),
    comingSoonPage,
    maintenancePage,
    notFoundPage,
    siteMode: systemModeSettings.siteMode ?? 'off',
  }
}

const getResolvedSystemPageRenderState = async ({
  ignoreBypass = false,
}: {
  ignoreBypass?: boolean
} = {}): Promise<{
  mode: 'comingSoon' | 'maintenance' | null
  page: SystemPage | null
}> => {
  const systemBehavior = await getSystemBehaviorPages()

  if (
    !ignoreBypass &&
    systemBehavior.bypassForLoggedInAdmins &&
    (await canCurrentRequestBypassSystemModes())
  ) {
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

export async function getSystemPageRenderState(_pathname: string): Promise<{
  mode: 'comingSoon' | 'maintenance' | null
  page: SystemPage | null
}> {
  return getResolvedSystemPageRenderState()
}

export async function getHomepageRenderState(): Promise<{
  mode: 'comingSoon' | 'maintenance' | null
  page: SystemPage | null
}> {
  const renderState = await getResolvedSystemPageRenderState()

  if (renderState.page || renderState.mode) {
    return renderState
  }

  if (await getHomepagePage()) {
    return {
      mode: null,
      page: null,
    }
  }

  return getResolvedSystemPageRenderState({
    ignoreBypass: true,
  })
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
    return toManagedSystemPageMetadata(systemPageState.page)
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

  const notFoundPage = await getManagedNotFoundPage()

  return notFoundPage ? toManagedSystemPageMetadata(notFoundPage) : {}
}

export async function getHomepageMetadata(): Promise<Metadata> {
  const systemPageState = await getHomepageRenderState()

  if (systemPageState.page) {
    return toManagedSystemPageMetadata(systemPageState.page)
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

  const notFoundPage = await getManagedNotFoundPage()

  return notFoundPage ? toManagedSystemPageMetadata(notFoundPage) : {}
}
