import { RichText } from '@payloadcms/richtext-lexical/react'

import { getMediaImageProps } from '@/lib/media'
import type { Article } from '@/payload-types'

export function ArticlePage({ article }: { article: Article }) {
  const featuredImage = getMediaImageProps({
    media: article.featuredImage,
    preset: 'hero',
    fallbackAlt: article.title,
  })
  const publishedAt = article.publishedAtOverride ?? article.publishedAt

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
      </header>
      <div className="prose prose-neutral max-w-none">
        <RichText data={article.body} />
      </div>
    </article>
  )
}
