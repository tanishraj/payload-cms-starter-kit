import type { ReactNode } from 'react'

import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type ContentHighlightsLayout =
  'editorialRow' | 'highlightsGrid' | 'numberedSteps' | 'simpleGrid' | 'splitHighlights'
export type ContentHighlightsSize = 'comfortable' | 'compact' | 'default'

export type ContentHighlightItem = {
  description?: string
  href?: string
  metadata?: string
  openInNewTab?: boolean
  title: string
}

export type ContentHighlightsProps = {
  actions?: ReactNode
  appearance?: BlockAppearance | null
  description?: string | null
  eyebrow?: string | null
  items: ContentHighlightItem[]
  layout?: ContentHighlightsLayout
  size?: ContentHighlightsSize
  title: string
}

const itemGridClasses = {
  editorialRow: 'grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3',
  highlightsGrid: 'grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3',
  numberedSteps: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
  simpleGrid: 'grid gap-x-16 gap-y-10 md:grid-cols-2',
  splitHighlights: 'grid gap-x-8 gap-y-8 md:grid-cols-2',
} as const satisfies Record<ContentHighlightsLayout, string>

const sectionGapClasses = {
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<ContentHighlightsSize, string>

function ContentHighlightsIntro({
  actions,
  description,
  eyebrow,
  title,
}: Pick<ContentHighlightsProps, 'actions' | 'description' | 'eyebrow' | 'title'>) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {eyebrow ? (
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-7 text-balance text-current/70">{description}</p>
      ) : null}
      {actions}
    </div>
  )
}

function ContentHighlightItemComponent({
  index,
  item,
  layout,
}: {
  index: number
  item: ContentHighlightItem
  layout: ContentHighlightsLayout
}) {
  const isNumbered = layout === 'numberedSteps'
  const isSimple = layout === 'simpleGrid'
  const step = String(index + 1).padStart(2, '0')
  const titleClassName =
    'rounded-sm text-md leading-tight font-semibold text-current underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current sm:text-lg'

  const title = item.href ? (
    <a
      className={cn(titleClassName, 'transition-opacity hover:opacity-70 hover:underline')}
      href={item.href}
      rel={item.openInNewTab ? 'noreferrer' : undefined}
      target={item.openInNewTab ? '_blank' : undefined}
    >
      {item.title}
    </a>
  ) : (
    <p className={titleClassName}>{item.title}</p>
  )

  const content = (
    <div className="flex flex-col gap-2">
      {item.metadata ? (
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-current/65">
          {item.metadata}
        </p>
      ) : null}
      {title}
      {item.description ? (
        <p className="text-sm leading-6 text-current/70">{item.description}</p>
      ) : null}
    </div>
  )

  if (isNumbered) {
    return (
      <article
        className="flex min-w-0 flex-col gap-4 rounded-md border border-border p-6"
        data-content-highlight-item="true"
        data-content-highlight-presentation="numbered"
      >
        <p
          className="text-2xl leading-none font-semibold text-primary"
          data-content-highlight-step={step}
        >
          {step}
        </p>
        {content}
      </article>
    )
  }

  if (isSimple) {
    return (
      <article
        className="flex min-w-0 flex-col"
        data-content-highlight-item="true"
        data-content-highlight-presentation="simple"
      >
        {content}
      </article>
    )
  }

  return (
    <article className="flex min-w-0 flex-col gap-4" data-content-highlight-item="true">
      <Separator />
      {content}
    </article>
  )
}

function ContentHighlightsItems({
  items,
  layout,
}: {
  items: ContentHighlightItem[]
  layout: ContentHighlightsLayout
}) {
  return (
    <div className={itemGridClasses[layout]} data-content-highlights-items="true">
      {items.map((item, index) => (
        <ContentHighlightItemComponent
          index={index}
          item={item}
          key={`${item.title}-${index}`}
          layout={layout}
        />
      ))}
    </div>
  )
}

export function ContentHighlights({
  actions,
  appearance,
  description,
  eyebrow,
  items,
  layout = 'highlightsGrid',
  size = 'default',
  title,
}: ContentHighlightsProps) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedLayout = layout ?? 'highlightsGrid'
  const resolvedSize = size ?? 'default'

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClasses.className)}
      data-content-highlights="true"
      data-content-highlights-background={appearance?.background ?? 'none'}
      data-content-highlights-layout={resolvedLayout}
      data-content-highlights-size={resolvedSize}
    >
      <div className={regularBlockContainerClasses}>
        {resolvedLayout === 'splitHighlights' ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
            <ContentHighlightsIntro
              actions={actions}
              description={description}
              eyebrow={eyebrow}
              title={title}
            />
            <ContentHighlightsItems items={items} layout={resolvedLayout} />
          </div>
        ) : (
          <div className={cn('flex flex-col', sectionGapClasses[resolvedSize])}>
            {resolvedLayout === 'editorialRow' ? (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <ContentHighlightsIntro description={description} eyebrow={eyebrow} title={title} />
                {actions ? (
                  <div className="lg:shrink-0 lg:pb-1" data-content-highlights-action-slot="true">
                    {actions}
                  </div>
                ) : null}
              </div>
            ) : (
              <ContentHighlightsIntro
                actions={actions}
                description={description}
                eyebrow={eyebrow}
                title={title}
              />
            )}
            <ContentHighlightsItems items={items} layout={resolvedLayout} />
          </div>
        )}
      </div>
    </section>
  )
}
