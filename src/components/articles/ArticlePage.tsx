import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getMediaImageProps } from '@/lib/media'
import { getTaxonomyTerm, getTaxonomyTerms } from '@/lib/taxonomy'
import type { Article } from '@/payload-types'

export function ArticlePage({
  article,
  relatedArticles,
}: {
  article: Article
  relatedArticles: Article[]
}) {
  const featuredImage = getMediaImageProps({
    media: article.featuredImage,
    preset: 'hero',
    fallbackAlt: article.title,
  })
  const publishedAt = article.publishedAtOverride ?? article.publishedAt
  const primaryCategory = getTaxonomyTerm(article.primaryCategory)
  const tags = getTaxonomyTerms(article.tags)

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {primaryCategory ? (
            <Link
              href={`/articles/category/${primaryCategory.slug}`}
              className="font-medium uppercase tracking-[0.2em]"
            >
              {primaryCategory.title}
            </Link>
          ) : null}
          <span className="font-medium text-foreground">{article.authorName}</span>
          {publishedAt ? (
            <time dateTime={publishedAt}>{new Date(publishedAt).toLocaleDateString()}</time>
          ) : null}
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {article.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
        </div>
        {featuredImage ? (
          <img
            alt={featuredImage.alt}
            className="w-full rounded-3xl border object-cover"
            src={featuredImage.src}
          />
        ) : null}
        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/articles/tag/${tag.slug}`}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {tag.title}
              </Link>
            ))}
          </div>
        ) : null}
      </header>
      <div className="prose prose-neutral max-w-none">
        <RichText data={article.body} />
      </div>
      {relatedArticles.length ? (
        <section className="space-y-4 rounded-3xl border bg-background p-6">
          <h2 className="text-2xl font-semibold text-foreground">Related articles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                href={`/articles/${relatedArticle.slug}`}
                className="rounded-2xl border p-4 transition-colors hover:border-foreground/30"
              >
                <h3 className="font-semibold text-foreground">{relatedArticle.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {relatedArticle.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
