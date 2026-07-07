import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { getPageHrefFromSourceWithResolver, getPageID } from '@/lib/pagePaths'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({
    config: configPromise,
  })

  const pageSettings = await payload.findGlobal({
    slug: 'page-settings',
    depth: 0,
  })

  const homepageID = getPageID(pageSettings.homepage)
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()
  const resolvePageParent = async (id: number) => {
    return payload.findByID({
      collection: 'pages',
      id,
      depth: 0,
    })
  }

  let currentPage = 1
  let totalPages = 1

  while (currentPage <= totalPages) {
    const pagesResult = await payload.find({
      collection: 'pages',
      where: {
        _status: {
          equals: 'published',
        },
      },
      depth: 1,
      limit: 100,
      page: currentPage,
      sort: 'createdAt',
    })

    totalPages = pagesResult.totalPages

    for (const page of pagesResult.docs) {
      const pagePath = await getPageHrefFromSourceWithResolver(page, resolvePageParent)

      if (!pagePath) {
        continue
      }

      const isHomepage = homepageID != null && page.id === homepageID
      const publicPath = isHomepage ? '/' : pagePath

      entries.set(publicPath, {
        url: toAbsoluteSiteUrl(publicPath),
        lastModified: page.updatedAt,
      })
    }

    currentPage += 1
  }

  return [...entries.values()]
}
