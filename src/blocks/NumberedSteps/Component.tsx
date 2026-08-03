import Image from 'next/image'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

type Step = {
  badge?: string | null
  description?: string | null
  image?: string | number | Media | null
  title?: string | null
}

type NumberedStepsBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  numberStyle?: 'circle' | 'outlined' | 'serif' | null
  size?: RegularBlockSize | null
  steps?: Step[] | null
  title?: string | null
  variant?: 'vertical' | 'cards' | 'alternating' | null
}

function StepNumber({
  num,
  numberStyle,
}: {
  num: number
  numberStyle: 'circle' | 'outlined' | 'serif'
}) {
  const label = String(num).padStart(2, '0')

  if (numberStyle === 'serif') {
    return (
      <span className="shrink-0 font-serif text-7xl font-bold leading-none text-primary/20 select-none">
        {label}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold',
        numberStyle === 'circle' && 'bg-primary text-primary-foreground',
        numberStyle === 'outlined' && 'border-2 border-primary text-primary',
      )}
    >
      {num}
    </div>
  )
}

// ── VERTICAL ──────────────────────────────────────────────────────────────────
function VerticalSteps({
  steps,
  numberStyle,
}: {
  steps: Step[]
  numberStyle: 'circle' | 'outlined' | 'serif'
}) {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <div key={index} className="flex gap-5">
            <div className="flex flex-col items-center">
              <StepNumber num={index + 1} numberStyle={numberStyle} />
              {!isLast ? <div className="w-0.5 flex-1 bg-border my-1" /> : null}
            </div>
            <div className={cn('flex flex-col gap-1 pb-10', isLast && 'pb-0')}>
              {step.badge?.trim() ? (
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {step.badge.trim()}
                </span>
              ) : null}
              <h3 className="font-sans text-lg font-semibold leading-snug text-foreground">
                {step.title?.trim()}
              </h3>
              {step.description?.trim() ? (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {step.description.trim()}
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── CARDS ─────────────────────────────────────────────────────────────────────
function CardSteps({
  steps,
  numberStyle,
}: {
  steps: Step[]
  numberStyle: 'circle' | 'outlined' | 'serif'
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <div
          key={index}
          className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
        >
          <StepNumber num={index + 1} numberStyle={numberStyle} />
          <div className="flex flex-col gap-1">
            {step.badge?.trim() ? (
              <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {step.badge.trim()}
              </span>
            ) : null}
            <h3 className="font-sans text-base font-semibold leading-snug text-foreground">
              {step.title?.trim()}
            </h3>
            {step.description?.trim() ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description.trim()}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ALTERNATING ───────────────────────────────────────────────────────────────
function AlternatingSteps({
  steps,
  numberStyle,
}: {
  steps: Step[]
  numberStyle: 'circle' | 'outlined' | 'serif'
}) {
  return (
    <div className="flex flex-col gap-16">
      {steps.map((step, index) => {
        const isEven = index % 2 === 0
        const image = getMediaImageProps({ media: step.image, preset: 'generic' })

        return (
          <div
            key={index}
            className={cn(
              'flex flex-col gap-8 md:flex-row md:items-center md:gap-12',
              !isEven && 'md:flex-row-reverse',
            )}
          >
            {/* Media or styled fallback */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl md:flex-1">
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <span className="font-serif text-8xl font-bold text-border select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 md:flex-1">
              <StepNumber num={index + 1} numberStyle={numberStyle} />
              {step.badge?.trim() ? (
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {step.badge.trim()}
                </span>
              ) : null}
              <h3 className="font-sans text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {step.title?.trim()}
              </h3>
              {step.description?.trim() ? (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {step.description.trim()}
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function NumberedStepsBlockComponent({
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  numberStyle = 'circle',
  size = 'default',
  steps,
  title,
  variant = 'vertical',
}: NumberedStepsBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const validSteps = (steps ?? []).filter((s) => s.title?.trim())
  if (validSteps.length < 2) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'center') === 'center'
  const resolvedNumberStyle = numberStyle ?? 'circle'
  const resolvedVariant = variant ?? 'vertical'
  const resolvedActions = resolveCmsActions(actions)

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
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
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {resolvedTitle}
          </h2>
          {description?.trim() ? (
            <p className="text-base leading-7 text-current/70">{description.trim()}</p>
          ) : null}
          {resolvedActions.length > 0 ? (
            <div className="mt-2">
              <ContentActions actions={resolvedActions} />
            </div>
          ) : null}
        </div>

        {resolvedVariant === 'cards' ? (
          <CardSteps steps={validSteps} numberStyle={resolvedNumberStyle} />
        ) : resolvedVariant === 'alternating' ? (
          <AlternatingSteps steps={validSteps} numberStyle={resolvedNumberStyle} />
        ) : (
          <VerticalSteps steps={validSteps} numberStyle={resolvedNumberStyle} />
        )}
      </div>
    </section>
  )
}
