import type { ReactNode } from 'react'

import type { BlockAppearance, BlockBackground } from '@/blocks/shared/blockAppearance'
import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import { resolveCardSurface } from '@/blocks/shared/cardSurface'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import {
  contentIntroClasses,
  contentItemDescriptionClasses,
  contentItemMetadataClasses,
  contentItemTitleClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

export type ContentHighlightsAlignment = 'center' | 'left' | 'right'
export type ContentHighlightsHeaderLayout = 'split' | 'stacked'
export type ContentHighlightsLayout = 'editorialRow' | 'highlightsGrid' | 'simpleGrid'
export type ContentHighlightsSize = 'none' | 'comfortable' | 'compact' | 'default'
export type ContentHighlightsSplitAlignment = 'bottom' | 'center' | 'top'

export type ContentHighlightItem = {
  cardAction?: ResolvedCmsAction
  cardBackground?: string | null
  description?: string
  markerLabel?: string
  markerMode: 'custom' | 'hidden' | 'numbered'
  title: string
}

export type ContentHighlightsProps = {
  accentTitle?: string | null
  actions?: ReactNode
  appearance?: BlockAppearance | null
  contentAlignment?: ContentHighlightsAlignment
  description?: string | null
  eyebrow?: string | null
  headerLayout?: ContentHighlightsHeaderLayout
  items: ContentHighlightItem[]
  layout?: ContentHighlightsLayout
  size?: ContentHighlightsSize
  splitContentAlignment?: ContentHighlightsSplitAlignment
  title?: string | null
}

const fullWidthItemGridClasses = {
  editorialRow: 'grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3',
  highlightsGrid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
  simpleGrid: 'grid gap-x-12 gap-y-10 md:grid-cols-2',
} as const satisfies Record<ContentHighlightsLayout, string>

const splitItemGridClasses = {
  editorialRow: 'grid gap-x-8 gap-y-10 md:grid-cols-2',
  highlightsGrid: 'grid gap-6 md:grid-cols-2',
  simpleGrid: 'grid gap-x-8 gap-y-10 md:grid-cols-2',
} as const satisfies Record<ContentHighlightsLayout, string>

const horizontalAlignmentClasses = {
  center: 'mx-auto items-center text-center',
  left: 'items-start text-left',
  right: 'ml-auto items-end text-right',
} as const satisfies Record<ContentHighlightsAlignment, string>

const splitAlignmentClasses = {
  bottom: 'lg:self-end',
  center: 'lg:self-center',
  top: 'lg:self-start',
} as const satisfies Record<ContentHighlightsSplitAlignment, string>

const sectionGapClasses = {
  none: 'gap-10',
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<ContentHighlightsSize, string>

function ContentHighlightsIntro({
  accentTitle,
  actions,
  className,
  description,
  eyebrow,
  surface,
  title,
}: Pick<ContentHighlightsProps, 'accentTitle' | 'actions' | 'description' | 'eyebrow' | 'title'> & {
  className?: string
  surface: BlockBackground
}) {
  const resolvedAccentTitle = accentTitle?.trim() || undefined

  return (
    <div className={cn(contentIntroClasses, className)}>
      {eyebrow ? <SectionEyebrow surface={surface}>{eyebrow}</SectionEyebrow> : null}
      <h2 className={contentSectionHeadingClasses}>
        {resolvedAccentTitle ? (
          <>
            <span className="block font-[inherit]">{title}</span>
            <em className="block font-[inherit]">{resolvedAccentTitle}</em>
          </>
        ) : (
          title
        )}
      </h2>
      {description ? <p className={contentSectionDescriptionClasses}>{description}</p> : null}
      {actions}
    </div>
  )
}

function resolveMarker(item: ContentHighlightItem, index: number) {
  if (item.markerMode === 'hidden') return undefined
  if (item.markerMode === 'custom') {
    return item.markerLabel?.trim() || String(index + 1).padStart(2, '0')
  }
  return String(index + 1).padStart(2, '0')
}

function HighlightBody({
  hasAction,
  item,
  marker,
  markerSurface,
  secondaryClassName,
}: {
  hasAction: boolean
  item: ContentHighlightItem
  marker?: string
  markerSurface: string
  secondaryClassName: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-2', hasAction && 'pb-6')}>
      {marker ? (
        <p
          className={cn(
            contentItemMetadataClasses,
            'font-semibold text-current/70 uppercase tracking-[0.18em]',
          )}
          data-content-highlight-marker={marker}
          data-section-eyebrow-surface={markerSurface}
        >
          {marker}
        </p>
      ) : null}
      <h3 className={contentItemTitleClasses}>{item.title}</h3>
      {item.description ? (
        <p
          className={cn(
            contentItemDescriptionClasses,
            'max-w-[65ch] leading-6',
            secondaryClassName,
          )}
        >
          {item.description}
        </p>
      ) : null}
    </div>
  )
}

function ContentHighlightItemComponent({
  index,
  item,
  layout,
  sectionBackground,
}: {
  index: number
  item: ContentHighlightItem
  layout: ContentHighlightsLayout
  sectionBackground: BlockBackground
}) {
  const surface = resolveCardSurface(item.cardBackground, sectionBackground)
  const marker = resolveMarker(item, index)
  const markerSurface = surface.value === 'default' ? sectionBackground : surface.value
  const hasExplicitSurface = surface.value !== 'default'
  const hasAction = Boolean(item.cardAction)
  const body = (
    <HighlightBody
      hasAction={hasAction}
      item={item}
      marker={marker}
      markerSurface={markerSurface}
      secondaryClassName={surface.secondary}
    />
  )
  const actionFooter = item.cardAction ? (
    <div
      className={cn('mt-auto border-t pt-4', surface.divider)}
      data-content-highlight-action-footer="true"
    >
      <ContentActions
        actions={[item.cardAction]}
        alignment="left"
        buttonClassNames={surface.button}
        className="w-auto"
        linkClassName={surface.link}
      />
    </div>
  ) : null
  const containedClasses = cn(
    'rounded-[var(--radius)] border p-6 md:p-7',
    surface.className,
    surface.divider,
  )

  if (layout === 'editorialRow') {
    return (
      <article
        className={cn(
          'flex min-w-0 flex-col border-t pt-5',
          surface.divider,
          hasExplicitSurface && containedClasses,
        )}
        data-card-background={surface.value}
        data-content-highlight-item="true"
        data-content-highlight-presentation="editorial"
      >
        {body}
        {actionFooter}
      </article>
    )
  }

  if (layout === 'simpleGrid') {
    return (
      <article
        className={cn(
          'flex min-w-0 flex-col',
          hasExplicitSurface ? containedClasses : surface.className,
        )}
        data-card-background={surface.value}
        data-content-highlight-item="true"
        data-content-highlight-presentation="simple"
      >
        <div className={cn('grid flex-1 gap-4', marker && 'grid-cols-[3.5rem_minmax(0,1fr)]')}>
          {marker ? (
            <p
              className={cn(
                contentItemMetadataClasses,
                'pt-1 font-semibold text-current/70 uppercase tracking-[0.18em]',
              )}
              data-content-highlight-marker={marker}
              data-section-eyebrow-surface={markerSurface}
            >
              {marker}
            </p>
          ) : null}
          <div className={cn('flex min-w-0 flex-col gap-2', hasAction && 'pb-6')}>
            <h3 className={contentItemTitleClasses}>{item.title}</h3>
            {item.description ? (
              <p
                className={cn(
                  contentItemDescriptionClasses,
                  'max-w-[65ch] leading-6',
                  surface.secondary,
                )}
              >
                {item.description}
              </p>
            ) : null}
          </div>
        </div>
        {actionFooter}
      </article>
    )
  }

  return (
    <article
      className={cn('flex min-w-0 flex-col', containedClasses)}
      data-card-background={surface.value}
      data-content-highlight-item="true"
      data-content-highlight-presentation="calm"
    >
      {body}
      {actionFooter}
    </article>
  )
}

function ContentHighlightsItems({
  items,
  layout,
  sectionBackground,
  split,
}: {
  items: ContentHighlightItem[]
  layout: ContentHighlightsLayout
  sectionBackground: BlockBackground
  split: boolean
}) {
  return (
    <div
      className={(split ? splitItemGridClasses : fullWidthItemGridClasses)[layout]}
      data-content-highlights-items="true"
    >
      {items.map((item, index) => (
        <ContentHighlightItemComponent
          index={index}
          item={item}
          key={`${item.title}-${index}`}
          layout={layout}
          sectionBackground={sectionBackground}
        />
      ))}
    </div>
  )
}

export function ContentHighlights({
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  eyebrow,
  headerLayout = 'stacked',
  items,
  layout = 'highlightsGrid',
  size = 'default',
  splitContentAlignment = 'top',
  title,
}: ContentHighlightsProps) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedAlignment =
    contentAlignment === 'center' || contentAlignment === 'right' ? contentAlignment : 'left'
  const resolvedHeaderLayout = headerLayout === 'split' ? 'split' : 'stacked'
  const resolvedLayout: ContentHighlightsLayout =
    layout === 'editorialRow' || layout === 'simpleGrid' ? layout : 'highlightsGrid'
  const resolvedSize: ContentHighlightsSize =
    size === 'none' || size === 'compact' || size === 'comfortable' ? size : 'default'
  const resolvedSplitAlignment: ContentHighlightsSplitAlignment =
    splitContentAlignment === 'bottom' || splitContentAlignment === 'center'
      ? splitContentAlignment
      : 'top'
  const isSplit = resolvedHeaderLayout === 'split'
  const sectionBackground: BlockBackground = appearance?.background ?? 'none'

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClasses.className)}
      data-content-highlights="true"
      data-content-highlights-alignment={resolvedAlignment}
      data-content-highlights-background={appearance?.background ?? 'none'}
      data-content-highlights-header-layout={resolvedHeaderLayout}
      data-content-highlights-layout={resolvedLayout}
      data-content-highlights-size={resolvedSize}
      data-content-highlights-split-alignment={resolvedSplitAlignment}
    >
      <div className={regularBlockContainerClasses}>
        {isSplit ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
            <ContentHighlightsIntro
              accentTitle={accentTitle}
              actions={actions}
              className={splitAlignmentClasses[resolvedSplitAlignment]}
              description={description}
              eyebrow={eyebrow}
              surface={sectionBackground}
              title={title}
            />
            <ContentHighlightsItems
              items={items}
              layout={resolvedLayout}
              sectionBackground={sectionBackground}
              split
            />
          </div>
        ) : (
          <div className={cn('flex flex-col', sectionGapClasses[resolvedSize])}>
            <ContentHighlightsIntro
              accentTitle={accentTitle}
              actions={actions}
              className={horizontalAlignmentClasses[resolvedAlignment]}
              description={description}
              eyebrow={eyebrow}
              surface={sectionBackground}
              title={title}
            />
            <ContentHighlightsItems
              items={items}
              layout={resolvedLayout}
              sectionBackground={sectionBackground}
              split={false}
            />
          </div>
        )}
      </div>
    </section>
  )
}
