import Image from 'next/image'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import {
  contentIntroClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import {
  resolveMediaOverlay,
  type MediaOverlayCoverage,
  type MediaOverlayDirection,
  type MediaOverlayStrength,
  type MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import {
  resolveCmsActions,
  resolveCmsLink,
  type CmsActionValue,
  type CmsLinkValue,
} from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

type ContentAlignment = 'center' | 'left' | 'right'
type CardHeight = 'comfortable' | 'compact' | 'default'
type ImagePosition = 'bottom' | 'center' | 'left' | 'right' | 'top'
type CardSplit = '30-30-60' | '40-60' | '60-30-30' | '60-40' | 'equal'
type LegacyOverlayStrength = 'default' | 'soft' | 'strong'

type PathwayValue = Omit<CmsLinkValue, 'linkType'> & {
  description?: string | null
  id?: string | null
  image?: unknown
  imagePosition?: ImagePosition | null
  linkType?: 'custom' | 'none' | 'page' | null
  overlayCoverage?: MediaOverlayCoverage | null
  overlayDirection?: MediaOverlayDirection | null
  overlayStrength?: LegacyOverlayStrength | MediaOverlayStrength | null
  themeMode?: MediaOverlayTone | null
  title?: string | null
}

type StudyPathwaysBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  cardHeight?: CardHeight | null
  contentAlignment?: ContentAlignment | null
  description?: string | null
  eyebrow?: string | null
  cardSplit?: CardSplit | null
  footerActions?: CmsActionValue[] | null
  headerLayout?: 'split' | 'stacked' | null
  pathways?: PathwayValue[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const cardHeightClasses = {
  compact: 'min-h-[18rem] sm:min-h-[20rem]',
  default: 'min-h-[22rem] sm:min-h-[25rem]',
  comfortable: 'min-h-[24rem] sm:min-h-[28rem] xl:min-h-[30rem]',
} as const

const imagePositionClasses = {
  center: 'object-center',
  top: 'object-top',
  bottom: 'object-bottom',
  left: 'object-left',
  right: 'object-right',
} as const

const sectionGapClasses = {
  none: 'gap-10',
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<RegularBlockSize, string>

const validAlignments = new Set<ContentAlignment>(['left', 'center', 'right'])
const validCardHeights = new Set<CardHeight>(['compact', 'default', 'comfortable'])
const validImagePositions = new Set<ImagePosition>(['center', 'top', 'bottom', 'left', 'right'])
const validCardSplits = new Set<CardSplit>(['60-40', 'equal', '40-60', '30-30-60', '60-30-30'])

const twoCardSplitGridClasses: Record<Exclude<CardSplit, '30-30-60' | '60-30-30'>, string> = {
  '60-40': 'lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]',
  equal: 'lg:grid-cols-2',
  '40-60': 'lg:grid-cols-[minmax(0,2fr)_minmax(18rem,3fr)]',
}

const threeCardSplitGridClasses: Record<'30-30-60' | '60-30-30', string> = {
  '30-30-60': 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(18rem,2fr)]',
  '60-30-30': 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]',
}

const fourCardSplitGridClasses: Record<CardSplit, string> = {
  '60-40': 'lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]',
  equal: 'lg:grid-cols-2',
  '40-60': 'lg:grid-cols-[minmax(0,2fr)_minmax(18rem,3fr)]',
  '30-30-60': 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(18rem,2fr)]',
  '60-30-30': 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]',
}

const fourCardSplitSpanClasses: Record<CardSplit, Record<number, string>> = {
  '60-40': {
    0: '',
    1: '',
    2: '',
    3: '',
  },
  equal: {
    0: '',
    1: '',
    2: '',
    3: '',
  },
  '40-60': {
    0: '',
    1: '',
    2: '',
    3: '',
  },
  '30-30-60': {
    0: '',
    1: '',
    2: '',
    3: 'lg:col-span-2',
  },
  '60-30-30': {
    0: '',
    1: '',
    2: '',
    3: 'lg:col-span-2',
  },
}

const getCardGridClasses = (count: number, split: CardSplit) => {
  if (count === 2) {
    if (split === '30-30-60' || split === '60-30-30') {
      return twoCardSplitGridClasses.equal
    }

    return twoCardSplitGridClasses[split]
  }

  if (count === 3) {
    if (split === '30-30-60' || split === '60-30-30') {
      return threeCardSplitGridClasses[split]
    }

    return 'lg:grid-cols-3'
  }

  if (count === 4) {
    return fourCardSplitGridClasses[split]
  }

  return 'lg:grid-cols-2'
}

const getCardSpanClass = (count: number, split: CardSplit, index: number) =>
  count === 4 ? fourCardSplitSpanClasses[split][index] : ''

const getCardImageSizes = (index: number, count: number, split: CardSplit) => {
  if (index === 0) {
    if (count <= 2) {
      if (split === '60-40') {
        return '(max-width: 1024px) 100vw, 60vw'
      }
      if (split === '40-60') {
        return '(max-width: 1024px) 100vw, 40vw'
      }
      return '(max-width: 1024px) 100vw, 50vw'
    }

    if (count === 3) {
      return '(max-width: 1024px) 100vw, 33vw'
    }

    return '(max-width: 1024px) 100vw, 50vw'
  }

  if (count === 4) {
    if (split === '30-30-60' || split === '60-30-30') {
      return index === 3 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 33vw'
    }

    return '(max-width: 1024px) 100vw, 50vw'
  }

  if (count === 3) {
    return '(max-width: 1024px) 100vw, 33vw'
  }

  return '(max-width: 1024px) 100vw, 50vw'
}

export function StudyPathwaysBlockComponent({
  accentTitle,
  actions,
  appearance,
  cardHeight = 'default',
  contentAlignment = 'left',
  description,
  cardSplit,
  eyebrow,
  footerActions,
  headerLayout = 'split',
  pathways,
  size = 'default',
  title,
}: StudyPathwaysBlockLike) {
  const resolvedPathways = (pathways ?? []).flatMap((pathway, index) => {
    const resolvedTitle = pathway.title?.trim()
    const image = getMediaImageProps({
      media: pathway.image as Media | number | string | null | undefined,
      fallbackAlt: resolvedTitle,
    })

    if (!resolvedTitle || !image) return []

    const destination = resolveCmsLink({
      linkType: pathway.linkType === 'none' ? null : pathway.linkType,
      openInNewTab: pathway.openInNewTab,
      page: pathway.page,
      url: pathway.url,
    })

    return [
      {
        description: pathway.description?.trim(),
        href: destination.href,
        id: pathway.id ?? index,
        image,
        imagePosition: validImagePositions.has(pathway.imagePosition as ImagePosition)
          ? (pathway.imagePosition as ImagePosition)
          : 'center',
        openInNewTab: destination.openInNewTab ?? false,
        overlayCoverage: pathway.overlayCoverage,
        overlayDirection: pathway.overlayDirection,
        overlayStrength: pathway.overlayStrength,
        themeMode: pathway.themeMode,
        title: resolvedTitle,
      },
    ]
  })

  const visiblePathways = resolvedPathways.slice(0, 4)

  if (!visiblePathways.length) return null

  const { background, className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAlignment = validAlignments.has(contentAlignment as ContentAlignment)
    ? (contentAlignment as ContentAlignment)
    : 'left'
  const resolvedCardHeight = validCardHeights.has(cardHeight as CardHeight)
    ? (cardHeight as CardHeight)
    : 'default'
  const resolvedDescription = description?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedHeaderLayout = headerLayout === 'stacked' ? 'stacked' : 'split'
  const resolvedSize = size ?? 'default'
  const resolvedCardSplit = validCardSplits.has(cardSplit as CardSplit)
    ? (cardSplit as CardSplit)
    : '60-40'
  const resolvedTitle = title?.trim()
  const resolvedAccentTitle = accentTitle?.trim()
  const hasHeader = Boolean(
    resolvedEyebrow ||
      resolvedTitle ||
      resolvedAccentTitle ||
      resolvedDescription ||
      resolvedActions.length,
  )

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}
      data-study-pathways="true"
    >
      <div className={cn(regularBlockContainerClasses, 'px-6')}>
        <div
          className={cn(
            'flex flex-col border border-border rounded-[var(--radius)]',
            sectionGapClasses[resolvedSize],
            'p-8 sm:p-10',
          )}
        >
          {hasHeader ? (
            <header
              className={cn(
                'grid gap-6',
                resolvedHeaderLayout === 'split'
                  ? 'lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:items-end lg:gap-16'
                  : 'max-w-3xl',
              )}
            >
              <div className={cn(contentIntroClasses, alignmentClasses[resolvedAlignment])}>
                {resolvedEyebrow ? (
                  <SectionEyebrow surface={background}>{resolvedEyebrow}</SectionEyebrow>
                ) : null}
                {resolvedTitle || resolvedAccentTitle ? (
                  <h2 className={contentSectionHeadingClasses}>
                    {resolvedTitle ? (
                      <span className="block font-[inherit]">{resolvedTitle}</span>
                    ) : null}
                    {resolvedAccentTitle ? (
                      <em className="block font-[inherit]">{resolvedAccentTitle}</em>
                    ) : null}
                  </h2>
                ) : null}
                {resolvedHeaderLayout === 'stacked' && resolvedDescription ? (
                  <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                ) : null}
                {resolvedHeaderLayout === 'stacked' ? (
                  <ContentActions actions={resolvedActions} alignment={resolvedAlignment} />
                ) : null}
              </div>

              {resolvedHeaderLayout === 'split' &&
              (resolvedDescription || resolvedActions.length) ? (
                <div
                  className={cn(
                    contentIntroClasses,
                    'max-w-xl lg:pb-1',
                    alignmentClasses[resolvedAlignment],
                  )}
                >
                  {resolvedDescription ? (
                    <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                  ) : null}
                  <ContentActions actions={resolvedActions} alignment={resolvedAlignment} />
                </div>
              ) : null}
            </header>
          ) : null}

          <div
            className={cn(
              'grid grid-cols-1 gap-6',
              getCardGridClasses(visiblePathways.length, resolvedCardSplit),
            )}
          >
            {visiblePathways.map((pathway, index) => {
              const overlay = resolveMediaOverlay({
                coverage: pathway.overlayCoverage,
                direction: pathway.overlayDirection ?? 'bottomToTop',
                sectionBackground: background,
                strength: pathway.overlayStrength,
                tone: pathway.themeMode,
              })

              const card = (
                <>
                  <Image
                    alt={pathway.image.alt}
                    className={cn(
                      'object-cover transition-transform duration-500 ease-out motion-safe:group-hover/study-pathways:scale-[1.025] motion-safe:group-focus-within/study-pathways:scale-[1.025]',
                      imagePositionClasses[pathway.imagePosition],
                    )}
                    fill
                    sizes={getCardImageSizes(index, visiblePathways.length, resolvedCardSplit)}
                    src={pathway.image.src}
                  />
                  <div
                    className={cn(
                      'pointer-events-none absolute',
                      overlay.frameClassName,
                      overlay.className,
                    )}
                    data-study-pathways-overlay-coverage={overlay.coverage}
                    data-study-pathways-overlay-direction={overlay.direction}
                    data-study-pathways-overlay-strength={overlay.strength}
                    data-study-pathways-overlay-tone={overlay.tone}
                  />
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 px-6 py-5',
                      overlay.text.title,
                    )}
                  >
                    <h3 className="font-sans text-lg leading-tight font-semibold tracking-tight text-balance sm:text-xl">
                      {pathway.title}
                    </h3>
                    {pathway.description ? (
                      <p className={overlay.text.secondary}>{pathway.description}</p>
                    ) : null}
                  </div>
                </>
              )

              const cardClasses = cn(
                'group/study-pathways relative h-full overflow-hidden rounded-[var(--radius)] bg-muted',
                cardHeightClasses[resolvedCardHeight],
                getCardSpanClass(visiblePathways.length, resolvedCardSplit, index),
                pathway.href &&
                  'block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
              )

              return pathway.href ? (
                <a
                  aria-label={pathway.title}
                  className={cardClasses}
                  href={pathway.href}
                  key={pathway.id}
                  rel={pathway.openInNewTab ? 'noopener noreferrer' : undefined}
                  target={pathway.openInNewTab ? '_blank' : undefined}
                >
                  {card}
                </a>
              ) : (
                <article className={cardClasses} key={pathway.id}>
                  {card}
                </article>
              )
            })}
          </div>

          <BlockFooterActions actions={footerActions} className="mt-0" />
        </div>
      </div>
    </section>
  )
}
