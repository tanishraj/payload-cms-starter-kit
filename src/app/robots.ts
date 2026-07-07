import type { MetadataRoute } from 'next'

import { toAbsoluteSiteUrl } from '@/lib/siteUrl'

export const revalidate = 300

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin'],
      },
    ],
    sitemap: toAbsoluteSiteUrl('/sitemap.xml'),
  }
}
