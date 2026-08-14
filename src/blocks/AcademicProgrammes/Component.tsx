import Image from 'next/image'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { resolveCardSurface } from '@/blocks/shared/cardSurface'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import {
  contentIntroClasses,
  contentItemDescriptionClasses,
  contentItemTitleClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import { ActionArrow } from '@/components/ActionArrow'
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

type ProgrammeValue = Omit<CmsLinkValue, 'linkType'> & {
  cardBackground?: string | null
  ctaLabel?: string | null
  description?: string | null
  eyebrow?: string | null
  id?: string | null
  image?: unknown
  linkType?: 'custom' | 'none' | 'page' | null
  title?: string | null
}

type AcademicProgrammesBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  columns?: '2' | '3' | '4' | null
  contentAlignment?: 'center' | 'left' | 'right' | null
  description?: string | null
  descriptionPosition?: 'side' | 'underTitle' | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  headerLayout?: 'split' | 'stacked' | null
  programmes?: ProgrammeValue[] | null
  sideContentAlignment?: 'bottom' | 'top' | null
  size?: RegularBlockSize | null
  title?: string | null
}

const gridClasses = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 xl:grid-cols-4',
} as const

const validColumns = new Set<NonNullable<AcademicProgrammesBlockLike['columns']>>(['2', '3', '4'])

const contentAlignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const validContentAlignments = new Set<
  NonNullable<AcademicProgrammesBlockLike['contentAlignment']>
>(['left', 'center', 'right'])

const sectionGapClasses = {
  none: 'gap-10',
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<RegularBlockSize, string>

export function AcademicProgrammesBlockComponent({
  accentTitle,
  actions,
  appearance,
  columns = '3',
  contentAlignment = 'left',
  description,
  descriptionPosition = 'side',
  eyebrow,
  footerActions,
  headerLayout = 'split',
  programmes,
  sideContentAlignment = 'bottom',
  size = 'default',
  title,
}: AcademicProgrammesBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedProgrammes = (programmes ?? []).flatMap((programme, index) => {
    const programmeTitle = programme.title?.trim()
    const image = getMediaImageProps({
      media: programme.image as Media | string | number | null | undefined,
      fallbackAlt: programmeTitle,
    })

    if (!programmeTitle || !image) return []

    const destination = resolveCmsLink({
      linkType: programme.linkType === 'none' ? null : programme.linkType,
      openInNewTab: programme.openInNewTab,
      page: programme.page,
      url: programme.url,
    })

    return [
      {
        cardBackground: programme.cardBackground,
        ctaLabel: programme.ctaLabel?.trim() || 'Explore programme',
        description: programme.description?.trim() || undefined,
        eyebrow: programme.eyebrow?.trim() || undefined,
        href: destination.href,
        id: programme.id ?? index,
        image,
        openInNewTab: destination.openInNewTab ?? false,
        title: programmeTitle,
      },
    ]
  })

  if (!resolvedProgrammes.length) return null

  const { background, className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAccentTitle = accentTitle?.trim()
  const resolvedColumns = validColumns.has(columns ?? '3') ? (columns ?? '3') : '3'
  const resolvedContentAlignment = validContentAlignments.has(contentAlignment ?? 'left')
    ? (contentAlignment ?? 'left')
    : 'left'
  const resolvedDescription = description?.trim()
  const resolvedDescriptionPosition = descriptionPosition === 'underTitle' ? 'underTitle' : 'side'
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedHeaderLayout = headerLayout === 'stacked' ? 'stacked' : 'split'
  const resolvedSideContentAlignment = sideContentAlignment === 'top' ? 'top' : 'bottom'
  const resolvedSize = size ?? 'default'

  return (
    <>
      <section
        className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}
        data-academic-programmes="true"
      >
        <div className={regularBlockContainerClasses}>
          <div className={cn('flex flex-col', sectionGapClasses[resolvedSize])}>
            <header
              className={cn(
                'grid gap-6',
                resolvedHeaderLayout === 'split'
                  ? 'lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:items-end lg:gap-16'
                  : 'max-w-3xl',
              )}
              data-academic-programmes-header={resolvedHeaderLayout}
            >
              <div
                className={cn(
                  contentIntroClasses,
                  contentAlignmentClasses[resolvedContentAlignment],
                )}
                data-content-alignment={resolvedContentAlignment}
              >
                {resolvedEyebrow ? (
                  <SectionEyebrow surface={background}>{resolvedEyebrow}</SectionEyebrow>
                ) : null}
                <h2 className={contentSectionHeadingClasses}>
                  <span className="block font-[inherit]">{resolvedTitle}</span>
                  {resolvedAccentTitle ? (
                    <em className="block font-[inherit]">{resolvedAccentTitle}</em>
                  ) : null}
                </h2>
                {resolvedHeaderLayout === 'stacked' && resolvedDescription ? (
                  <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                ) : null}
                {resolvedHeaderLayout === 'split' &&
                resolvedDescriptionPosition === 'underTitle' &&
                resolvedDescription ? (
                  <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                ) : null}
                {resolvedHeaderLayout === 'stacked' ? (
                  <ContentActions actions={resolvedActions} alignment={resolvedContentAlignment} />
                ) : null}
              </div>

              {resolvedHeaderLayout === 'split' &&
              ((resolvedDescriptionPosition === 'side' && resolvedDescription) ||
                resolvedActions.length) ? (
                <div
                  className={cn(
                    contentIntroClasses,
                    'max-w-xl',
                    resolvedDescriptionPosition === 'underTitle'
                      ? 'ml-auto w-full items-end text-right'
                      : contentAlignmentClasses[resolvedContentAlignment],
                    resolvedSideContentAlignment === 'top'
                      ? 'lg:self-start'
                      : 'lg:self-end lg:pb-1',
                  )}
                  data-academic-programmes-side-alignment={resolvedSideContentAlignment}
                >
                  {resolvedDescriptionPosition === 'side' && resolvedDescription ? (
                    <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                  ) : null}
                  <ContentActions
                    actions={resolvedActions}
                    alignment={
                      resolvedDescriptionPosition === 'underTitle'
                        ? 'right'
                        : resolvedContentAlignment
                    }
                  />
                </div>
              ) : null}
            </header>

            <div className={cn('grid grid-cols-1 gap-6', gridClasses[resolvedColumns])}>
              {resolvedProgrammes.map((programme) => {
                const surface = resolveCardSurface(programme.cardBackground, background)
                const usesDefaultSurface = surface.value === 'default'
                const card = (
                  <article
                    className={cn(
                      'group/programme flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius)] border',
                      usesDefaultSurface
                        ? 'border-border bg-card text-card-foreground'
                        : [surface.className, surface.divider],
                    )}
                    data-academic-programme="true"
                  >
                    <div className="relative h-64 overflow-hidden bg-muted sm:h-72">
                      <Image
                        alt={programme.image.alt}
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out [@media(hover:hover)]:group-hover/programme:scale-[1.025] group-focus-within/programme:scale-[1.025]"
                        fill
                        sizes={
                          resolvedColumns === '4'
                            ? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw'
                            : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        }
                        src={programme.image.src}
                      />
                    </div>

                    <div className="flex flex-1 flex-col px-7 py-7 sm:px-8 sm:py-8">
                      {programme.eyebrow ? (
                        <SectionEyebrow surface={surface.value === 'primary' ? 'brand' : 'none'}>
                          {programme.eyebrow}
                        </SectionEyebrow>
                      ) : null}
                      <h3 className={cn(contentItemTitleClasses, 'mt-4')}>{programme.title}</h3>
                      {programme.description ? (
                        <p
                          className={cn(
                            contentItemDescriptionClasses,
                            'mt-3',
                            !usesDefaultSurface && surface.secondary,
                          )}
                        >
                          {programme.description}
                        </p>
                      ) : null}

                      {programme.href ? (
                        <div
                          className={cn(
                            'mt-auto border-t pt-5',
                            programme.description ? 'mt-8' : 'mt-6',
                            usesDefaultSurface ? 'border-border' : surface.divider,
                          )}
                        >
                          <span
                            className={cn(
                              'flex items-center text-sm font-semibold',
                              'w-full justify-between',
                              !usesDefaultSurface && surface.link,
                            )}
                          >
                            <span className="underline decoration-current decoration-2 underline-offset-4">
                              {programme.ctaLabel}
                            </span>
                            <ActionArrow />
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </article>
                )

                return programme.href ? (
                  <a
                    className="group/button block h-full rounded-[var(--radius)] outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    data-academic-programme-link="true"
                    href={programme.href}
                    key={programme.id}
                    rel={programme.openInNewTab ? 'noopener noreferrer' : undefined}
                    target={programme.openInNewTab ? '_blank' : undefined}
                  >
                    {card}
                  </a>
                ) : (
                  <div className="h-full" key={programme.id}>
                    {card}
                  </div>
                )
              })}
            </div>
          </div>
          <div data-academic-programmes-footer-actions="true">
            <BlockFooterActions actions={footerActions} alignment="center" />
          </div>
        </div>
      </section>
    </>
  )
}
