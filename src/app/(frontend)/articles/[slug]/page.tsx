import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticlePage } from '@/components/articles/ArticlePage'
import { getArticleBySlug, getArticleMetadataBySlug, getArticleStructuredData, getRelatedArticles } from '@/lib/contentEntries'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  return getArticleMetadataBySlug(slug)
}

export default async function ArticleEntryPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const [relatedArticles, structuredData] = await Promise.all([
    getRelatedArticles(article),
    Promise.resolve(getArticleStructuredData(article)),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <ArticlePage article={article} relatedArticles={relatedArticles} />
    </>
  )
}
