import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getPageBySlug } from '@/lib/pages'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function DynamicPage({ params }: Args) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <RenderBlocks blocks={page.layout} />
}
