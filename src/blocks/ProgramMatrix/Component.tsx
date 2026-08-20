import type { LucideIcon } from 'lucide-react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { resolveCardSurface } from '@/blocks/shared/cardSurface'
import type { CardSurfaceValue } from '@/blocks/shared/cardThemeFields'
import { resolveLucideIcon } from '@/blocks/shared/resolveLucideIcon'
import { ActionButtonContent } from '@/components/ActionButtonContent'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { ContentLink } from '@/components/ContentLink'
import { Button } from '@/components/ui/button'
import {
  resolveCmsActions,
  type CmsActionValue,
  type CmsActionVariant,
  type ResolvedCmsAction,
} from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type ProgramMatrixItem = {
  cardBackground?: CardSurfaceValue | null
  cardAction?: CmsActionValue[] | null
  description?: string | null
  icon?: string | null
  id?: string | null
  linkType?: 'none' | 'page' | 'custom' | null
  metadata?: string | null
  openInNewTab?: boolean | null
  page?: string | number | Page | null
  title?: string | null
  url?: string | null
}

type ProgramMatrixBlockLike = {
  accentTitle?: string | null
  actionMode?: 'button' | 'link' | null
  actionVariant?: CmsActionVariant | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  headerLayout?: 'split' | 'stacked' | null
  headerPosition?: 'left' | 'right' | null
  itemActionLabel?: string | null
  items?: ProgramMatrixItem[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

type ResolvedProgramMatrixItem = {
  action?: ResolvedCmsAction
  cardBackground: CardSurfaceValue
  description?: string
  Icon?: LucideIcon
  id: string | number
  metadata?: string
  title: string
}

type ProgrammeActionProps = {
  action: ResolvedCmsAction
  buttonClassName?: string
  linkClassName?: string
}

function ProgrammeAction({ action, buttonClassName, linkClassName }: ProgrammeActionProps) {
  if (action.mode === 'button' && action.variant !== 'link') {
    return (
      <Button asChild className={buttonClassName} size="sm" variant={action.variant}>
        <a
          href={action.href}
          rel={action.openInNewTab ? 'noreferrer' : undefined}
          target={action.openInNewTab ? '_blank' : undefined}
        >
          <ActionButtonContent label={action.label} showArrow={action.showArrow} />
        </a>
      </Button>
    )
  }

  return (
    <ContentLink
      className={linkClassName}
      href={action.href}
      label={action.label}
      openInNewTab={action.openInNewTab}
    />
  )
}

const programmeActionVariants = new Set<CmsActionVariant>([
  'default',
  'outline',
  'primary',
  'secondary',
  'white',
  'whiteOutline',
])

const normalizeProgrammeAction = (action?: ResolvedCmsAction): ResolvedCmsAction | undefined =>
  action
    ? {
        ...action,
        mode: action.mode === 'button' ? 'button' : 'link',
        variant: programmeActionVariants.has(action.variant) ? action.variant : 'default',
      }
    : undefined

const resolveProgrammeAction = (
  item: ProgramMatrixItem,
  legacyMode: 'button' | 'link',
  legacyVariant: CmsActionVariant,
  legacyLabel: string,
): ResolvedCmsAction | undefined => {
  const authoredAction = normalizeProgrammeAction(resolveCmsActions(item.cardAction)[0])
  if (authoredAction) return authoredAction

  if (item.linkType !== 'page' && item.linkType !== 'custom') return undefined

  return normalizeProgrammeAction(
    resolveCmsActions([
      {
        label: legacyLabel,
        linkType: item.linkType,
        mode: legacyMode,
        openInNewTab: item.openInNewTab,
        page: item.page,
        url: item.url,
        variant: legacyVariant,
      },
    ])[0],
  )
}

export function ProgramMatrixBlockComponent({
  accentTitle,
  actionMode = 'link',
  actionVariant = 'default',
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  eyebrow,
  footerActions,
  headerLayout = 'stacked',
  headerPosition = 'left',
  itemActionLabel = 'Learn More',
  items,
  size = 'default',
  title,
}: ProgramMatrixBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const resolvedLegacyActionMode = actionMode === 'button' ? 'button' : 'link'
  const resolvedLegacyActionVariant = programmeActionVariants.has(actionVariant as CmsActionVariant)
    ? (actionVariant as CmsActionVariant)
    : 'default'
  const resolvedLegacyActionLabel = itemActionLabel?.trim() || 'Learn More'

  const resolvedItems = (items ?? []).flatMap((item, index): ResolvedProgramMatrixItem[] => {
    const itemTitle = item.title?.trim()
    if (!itemTitle) return []

    return [
      {
        action: resolveProgrammeAction(
          item,
          resolvedLegacyActionMode,
          resolvedLegacyActionVariant,
          resolvedLegacyActionLabel,
        ),
        cardBackground: resolveCardSurface(item.cardBackground).value,
        description: item.description?.trim() || undefined,
        Icon: resolveLucideIcon(item.icon),
        id: item.id ?? index,
        metadata: item.metadata?.trim() || undefined,
        title: itemTitle,
      },
    ]
  })

  if (resolvedItems.length === 0) return null

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const { className: appearanceClassName } = appearanceClasses
  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedSectionActions = resolveCmsActions(actions)
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedDescription = description?.trim()
  const resolvedSectionBackground = appearanceClasses.background
  const isBrandSurface = appearanceClasses.surface === 'brand'
  const sectionActionsUseSurfaceContrast = isBrandSurface
  const resolvedHeaderLayout = headerLayout === 'split' ? 'split' : 'stacked'
  const resolvedHeaderPosition = headerPosition === 'right' ? 'right' : 'left'
  const usesSplitHeader = resolvedHeaderLayout === 'split'

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}
      data-program-matrix-section="true"
    >
      <div className={cn(regularBlockContainerClasses, 'flex flex-col gap-10 md:gap-12')}>
        <div
          className={cn(
            'grid gap-10 md:gap-12',
            usesSplitHeader &&
              resolvedHeaderPosition === 'left' &&
              'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16',
            usesSplitHeader &&
              resolvedHeaderPosition === 'right' &&
              'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-16',
          )}
          data-program-matrix-header-position={resolvedHeaderPosition}
          data-program-matrix-layout={resolvedHeaderLayout}
        >
          <div
            className={cn(
              'flex max-w-3xl flex-col gap-4',
              resolvedAlignment === 'center'
                ? 'mx-auto items-center text-center'
                : 'items-start text-left',
              usesSplitHeader &&
                resolvedHeaderPosition === 'right' &&
                'lg:col-start-2 lg:row-start-1',
            )}
            data-content-alignment={resolvedAlignment}
            data-program-matrix-intro="true"
          >
            {resolvedEyebrow ? (
              <SectionEyebrow surface={resolvedSectionBackground}>{resolvedEyebrow}</SectionEyebrow>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
              {resolvedAccentTitle ? (
                <>
                  <span className="block font-[inherit]">{resolvedTitle}</span>
                  <em className="block font-[inherit]">{resolvedAccentTitle}</em>
                </>
              ) : (
                resolvedTitle
              )}
            </h2>
            {resolvedDescription ? (
              <p className="max-w-[70ch] text-base leading-7 text-current/70">
                {resolvedDescription}
              </p>
            ) : null}
            <ContentActions
              actions={resolvedSectionActions}
              alignment={resolvedAlignment}
              /* Button and link contrast on the brand surface is handled globally
                 in custom.css, so no per-variant overrides are needed here. */
              data-program-matrix-actions="true"
              data-surface-contrast={sectionActionsUseSurfaceContrast ? 'true' : undefined}
            />
          </div>

          <div
            className={cn(
              'grid overflow-hidden rounded-[var(--radius)] border bg-transparent text-current md:grid-cols-2',
              isBrandSurface ? 'border-current/15' : 'border-current/10',
              usesSplitHeader &&
                resolvedHeaderPosition === 'right' &&
                'lg:col-start-1 lg:row-start-1',
            )}
            data-program-matrix="true"
          >
            {resolvedItems.map((item, index) => {
              const Icon = item.Icon
              const surface = resolveCardSurface(item.cardBackground, resolvedSectionBackground)
              const isLastItem = index === resolvedItems.length - 1
              const isLeftColumn = index % 2 === 0
              const lastDesktopRowStart = resolvedItems.length - (resolvedItems.length % 2 || 2)
              const isLastDesktopRow = index >= lastDesktopRowStart
              const buttonClassName = item.action ? surface.button[item.action.variant] : undefined

              return (
                <article
                  className={cn(
                    'flex min-w-0 flex-col p-6 text-left md:p-8',
                    surface.className,
                    surface.divider,
                    !isLastItem && 'border-b',
                    isLastDesktopRow && 'md:border-b-0',
                    isLeftColumn && 'md:border-r',
                  )}
                  data-card-background={surface.value}
                  data-last-desktop-row={isLastDesktopRow ? 'true' : undefined}
                  data-left-column={isLeftColumn ? 'true' : undefined}
                  data-program-matrix-item="true"
                  key={item.id}
                >
                  {Icon ? (
                    <Icon
                      aria-hidden="true"
                      className={cn('mb-4 size-5 shrink-0', surface.icon)}
                      data-program-icon="true"
                      focusable="false"
                    />
                  ) : null}
                  <h3 className="font-sans text-lg font-semibold leading-snug text-current">
                    {item.title}
                  </h3>
                  {item.metadata ? (
                    <p
                      className={cn(
                        'mt-2 font-mono text-xs font-semibold uppercase tracking-[0.24em]',
                        surface.secondary,
                      )}
                    >
                      {item.metadata}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className={cn('mt-4 max-w-[65ch] text-sm leading-6', surface.secondary)}>
                      {item.description}
                    </p>
                  ) : null}
                  {item.action ? (
                    <div className="mt-auto pt-6" data-program-matrix-item-action="true">
                      <ProgrammeAction
                        action={item.action}
                        buttonClassName={buttonClassName}
                        linkClassName={surface.link}
                      />
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>
        <BlockFooterActions actions={footerActions} />
      </div>
    </section>
  )
}
