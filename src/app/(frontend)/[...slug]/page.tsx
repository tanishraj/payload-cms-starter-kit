import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { PageContent } from '../PageContent'
import { SystemModeFallbackPage } from '../SystemFallbackPage'
import {
  getHomepagePath,
  getPageByPath,
  getPageMetadataByPath,
  getSystemPageRenderState,
} from '../pageData'
import { getRedirectByPath } from '@/lib/redirects'
import {
  resolvePageBreadcrumbsForLayout,
  toBreadcrumbListStructuredData,
} from '@/lib/pageBreadcrumbs'
import { toAbsoluteSiteUrl } from '@/lib/siteUrl'

type PageProps = {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return getPageMetadataByPath(slug)
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params
  const pathname = `/${slug.join('/')}`
  const systemPageState = await getSystemPageRenderState(pathname)

  if (systemPageState.page) {
    return <PageContent page={systemPageState.page} />
  }

  if (systemPageState.mode) {
    return <SystemModeFallbackPage mode={systemPageState.mode} />
  }

  const homepagePath = await getHomepagePath()

  if (homepagePath && pathname === homepagePath) {
    permanentRedirect('/')
  }

  const matchedRedirect = await getRedirectByPath(pathname)

  if (matchedRedirect) {
    if (matchedRedirect.permanent) {
      permanentRedirect(matchedRedirect.destination)
    }

    redirect(matchedRedirect.destination)
  }

  const page = await getPageByPath(slug)

  if (!page) {
    notFound()
  }

  const pageUrl = toAbsoluteSiteUrl(`/${slug.join('/')}`)
  const breadcrumbStructuredData = toBreadcrumbListStructuredData(
    resolvePageBreadcrumbsForLayout(page),
    toAbsoluteSiteUrl,
  )

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      url: pageUrl,
    },
    ...(breadcrumbStructuredData ? [breadcrumbStructuredData] : []),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <PageContent page={page} />
    </>
  )
}
