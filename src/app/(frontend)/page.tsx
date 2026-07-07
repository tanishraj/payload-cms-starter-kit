import '../../styles/globals.css'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageContent } from './PageContent'
import { SystemModeFallbackPage } from './SystemFallbackPage'
import { getHomepageMetadata, getHomepagePage, getSystemPageRenderState } from './pageData'

export async function generateMetadata(): Promise<Metadata> {
  return getHomepageMetadata()
}

export default async function HomePage() {
  const systemPageState = await getSystemPageRenderState('/')

  if (systemPageState.page) {
    return <PageContent page={systemPageState.page} />
  }

  if (systemPageState.mode) {
    return <SystemModeFallbackPage mode={systemPageState.mode} />
  }

  const page = await getHomepagePage()

  if (!page) {
    notFound()
  }

  return <PageContent page={page} />
}
