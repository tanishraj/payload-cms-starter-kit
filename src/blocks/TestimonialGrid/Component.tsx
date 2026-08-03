import Image from 'next/image'
import { Quote } from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

type Testimonial = {
  quote?: string | null
  name?: string | null
  role?: string | null
  department?: string | null
  avatar?: string | number | Media | null
}

type TestimonialGridBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  columns?: '2' | '3' | '4' | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  heading?: string | null
  size?: RegularBlockSize | null
  testimonials?: Testimonial[] | null
  variant?: 'grid' | 'featured' | 'list' | null
}

function Avatar({ avatar, name }: { avatar?: ReturnType<typeof getMediaImageProps>; name?: string | null }) {
  if (avatar) {
    return (
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
        <Image src={avatar.src} alt={avatar.alt} fill className="object-cover" sizes="48px" />
      </div>
    )
  }
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {initials ?? '?'}
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const avatarProps = getMediaImageProps({ media: testimonial.avatar, preset: 'generic' })

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <Quote className="size-7 shrink-0 text-primary/25" aria-hidden="true" />
      <blockquote className="grow text-sm leading-relaxed text-foreground/80">
        &ldquo;{testimonial.quote?.trim()}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Avatar avatar={avatarProps ?? undefined} name={testimonial.name} />
        <div className="min-w-0 flex-1">
          {testimonial.name?.trim() ? (
            <p className="truncate text-sm font-semibold text-foreground">{testimonial.name.trim()}</p>
          ) : null}
          {testimonial.role?.trim() ? (
            <p className="truncate text-xs text-muted-foreground">{testimonial.role.trim()}</p>
          ) : null}
          {testimonial.department?.trim() ? (
            <p className="truncate text-xs text-muted-foreground/70">{testimonial.department.trim()}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const columnClasses = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const

export function TestimonialGridBlockComponent({
  actions,
  appearance,
  columns = '3',
  contentAlignment = 'center',
  description,
  eyebrow,
  heading,
  size = 'default',
  testimonials,
  variant = 'grid',
}: TestimonialGridBlockLike) {
  const items = (testimonials ?? []).filter((t) => t.quote?.trim() && t.name?.trim())
  if (!items.length) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'center') === 'center'
  const resolvedActions = resolveCmsActions(actions)

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {/* Header */}
        {(eyebrow?.trim() || heading?.trim() || description?.trim() || resolvedActions.length > 0) ? (
          <div
            className={cn(
              'mb-12 flex flex-col gap-4',
              isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
            )}
          >
            {eyebrow?.trim() ? (
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                {eyebrow.trim()}
              </p>
            ) : null}
            {heading?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {heading.trim()}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="text-base leading-7 text-current/70">{description.trim()}</p>
            ) : null}
            {resolvedActions.length > 0 ? (
              <div className="mt-2">
                <ContentActions actions={resolvedActions} />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Grid variant */}
        {variant === 'grid' || !variant ? (
          <div className={cn('grid gap-6', columnClasses[columns ?? '3'])}>
            {items.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        ) : null}

        {/* Featured variant: first card large, rest in a row below */}
        {variant === 'featured' ? (
          <div className="flex flex-col gap-6">
            {items[0] ? (
              <div className="rounded-xl border border-border bg-card p-8 shadow-sm md:p-12">
                <Quote className="mb-4 size-9 text-primary/25" aria-hidden="true" />
                <blockquote className="mb-6 text-xl font-medium leading-relaxed text-foreground md:text-2xl">
                  &ldquo;{items[0].quote?.trim()}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4 border-t border-border pt-6">
                  <Avatar
                    avatar={getMediaImageProps({ media: items[0].avatar, preset: 'generic' }) ?? undefined}
                    name={items[0].name}
                  />
                  <div>
                    <p className="font-semibold text-foreground">{items[0].name?.trim()}</p>
                    {items[0].role?.trim() ? (
                      <p className="text-sm text-muted-foreground">{items[0].role.trim()}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
            {items.length > 1 ? (
              <div className={cn('grid gap-6', columnClasses[columns ?? '3'])}>
                {items.slice(1).map((t, i) => (
                  <TestimonialCard key={i} testimonial={t} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* List variant */}
        {variant === 'list' ? (
          <div className="flex flex-col divide-y divide-border">
            {items.map((t, i) => {
              const avatarProps = getMediaImageProps({ media: t.avatar, preset: 'generic' })
              return (
                <div key={i} className="flex gap-5 py-6">
                  <Avatar avatar={avatarProps ?? undefined} name={t.name} />
                  <div className="flex flex-col gap-1">
                    <blockquote className="text-sm leading-relaxed text-foreground/80">
                      &ldquo;{t.quote?.trim()}&rdquo;
                    </blockquote>
                    <p className="mt-2 text-sm font-semibold text-foreground">{t.name?.trim()}</p>
                    {t.role?.trim() ? (
                      <p className="text-xs text-muted-foreground">{t.role.trim()}</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
