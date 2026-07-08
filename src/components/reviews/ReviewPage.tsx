import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getMediaImageProps } from '@/lib/media'
import { getReviewDisplayName } from '@/lib/reviews'
import type { Review } from '@/payload-types'

export function ReviewPage({ review }: { review: Review }) {
  const featuredImage = getMediaImageProps({
    media: review.featuredImage,
    preset: 'generic',
    fallbackAlt: review.reviewTitle,
  })

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {review.subjectLabel ? (
            <span className="font-medium uppercase tracking-[0.2em]">{review.subjectLabel}</span>
          ) : null}
          <span className="font-medium text-foreground">{review.rating}/5</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {review.reviewTitle}
          </h1>
          <p className="text-base text-muted-foreground">
            Reviewed by {getReviewDisplayName(review)}
          </p>
        </div>
        {featuredImage ? (
          <img
            alt={featuredImage.alt}
            className="w-full rounded-3xl border object-cover"
            src={featuredImage.src}
          />
        ) : null}
      </header>
      <div className="rounded-3xl border bg-background p-6">
        <p className="text-base leading-8 text-foreground">{review.reviewBody}</p>
      </div>
      <RenderBlocks blocks={review.layout ?? null} />
    </article>
  )
}
