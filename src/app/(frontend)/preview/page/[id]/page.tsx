import { PageLivePreview } from '@/components/live-preview/PageLivePreview'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminPreviewPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({
    config: configPromise,
  })
  const requestHeaders = new Headers(await getHeaders())
  const { user } = await payload.auth({
    canSetHeaders: false,
    headers: requestHeaders,
  })

  if (!user) {
    notFound()
  }

  const pageID = Number(id)

  if (!Number.isInteger(pageID) || pageID <= 0) {
    notFound()
  }

  const page = await payload.findByID({
    collection: 'pages',
    id: pageID,
    depth: 2,
    draft: true,
  })

  if (!page) {
    notFound()
  }

  return <PageLivePreview initialData={page} />
}
