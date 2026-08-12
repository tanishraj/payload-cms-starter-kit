import type { LucideIcon } from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { resolveCardSurface } from '@/blocks/shared/cardSurface'
import type { CardSurfaceValue } from '@/blocks/shared/cardThemeFields'
import { resolveLucideIcon } from '@/blocks/shared/resolveLucideIcon'
import { ContentActions } from '@/components/ContentActions'
import { ContentLink } from '@/components/ContentLink'
import { Button } from '@/components/ui/button'
import { resolveCmsActions, type CmsActionValue, type CmsActionVariant } from '@/lib/cmsLinks'
import { getPageHref } from '@/lib/pagePaths'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type ProgramMatrixItem = {
  cardBackground?: CardSurfaceValue | null
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
  actionMode?: 'button' | 'link' | null
  actionVariant?: CmsActionVariant | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  itemActionLabel?: string | null
  items?: ProgramMatrixItem[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

type ResolvedProgramMatrixItem = {
  cardBackground: CardSurfaceValue
  description?: string
  href?: string
  Icon?: LucideIcon
  id: string | number
  metadata?: string
  openInNewTab: boolean
  title: string
}

type ProgrammeActionProps = {
  actionLabel: string
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  buttonClassName?: string
  href: string
  linkClassName?: string
  openInNewTab: boolean
}

function ProgrammeAction({
  actionLabel,
  actionMode,
  actionVariant,
  buttonClassName,
  href,
  linkClassName,
  openInNewTab,
}: ProgrammeActionProps) {
  if (actionMode === 'button') {
    return (
      <Button asChild className={buttonClassName} size="sm" variant={actionVariant}>
        <a
          href={href}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          target={openInNewTab ? '_blank' : undefined}
        >
          {actionLabel}
        </a>
      </Button>
    )
  }

  return (
    <ContentLink
      className={linkClassName}
      href={href}
      label={actionLabel}
      openInNewTab={openInNewTab}
    />
  )
}

export function ProgramMatrixBlockComponent({
  actionMode = 'link',
  actionVariant = 'default',
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  eyebrow,
  itemActionLabel = 'Learn More',
  items,
  size = 'default',
  title,
}: ProgramMatrixBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedItems = (items ?? []).flatMap(
    (item, index): ResolvedProgramMatrixItem[] => {
      const itemTitle = item.title?.trim()
      if (!itemTitle) return []

      let href: string | undefined
      if (item.linkType === 'page') {
        href = getPageHref(item.page)
      } else if (item.linkType === 'custom') {
        href = item.url?.trim() || undefined
      }

      return [
        {
          cardBackground: resolveCardSurface(item.cardBackground).value,
          description: item.description?.trim() || undefined,
          href,
          Icon: resolveLucideIcon(item.icon),
          id: item.id ?? index,
          metadata: item.metadata?.trim() || undefined,
          openInNewTab: item.openInNewTab ?? false,
          title: itemTitle,
        },
      ]
    },
  )

  if (resolvedItems.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedActionMode = actionMode ?? 'link'
  const resolvedActionVariant = actionVariant ?? 'default'
  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedItemActionLabel = itemActionLabel?.trim() || 'Learn More'
  const resolvedSectionActions = resolveCmsActions(actions)
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedDescription = description?.trim()
  const resolvedSectionBackground = appearance?.background ?? 'none'
  const isPrimarySurface = resolvedSectionBackground === 'primary'
  const isSecondarySurface = resolvedSectionBackground === 'secondary'
  const usesSurfaceForeground =
    isPrimarySurface || isSecondarySurface || resolvedSectionBackground === 'accent'
  const sectionActionsUseSurfaceContrast =
    (resolvedActionMode === 'link' && usesSurfaceForeground) ||
    (resolvedActionMode === 'button' && (isPrimarySurface || isSecondarySurface))

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[size ?? 'default'],
        appearanceClassName,
      )}
      data-program-matrix-section="true"
    >
      <div className={cn(regularBlockContainerClasses, 'flex flex-col gap-10 md:gap-12')}>
        <div
          className={cn(
            'flex max-w-3xl flex-col gap-4',
            resolvedAlignment === 'center'
              ? 'mx-auto items-center text-center'
              : 'items-start text-left',
          )}
          data-content-alignment={resolvedAlignment}
        >
          {resolvedEyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {resolvedEyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {resolvedTitle}
          </h2>
          {resolvedDescription ? (
            <p className="max-w-[70ch] text-base leading-7 text-current/70">
              {resolvedDescription}
            </p>
          ) : null}
          <ContentActions
            actions={resolvedSectionActions}
            alignment={resolvedAlignment}
            className={cn(
              resolvedActionMode === 'link' &&
                usesSurfaceForeground &&
                '[&_a]:text-current',
              resolvedActionMode === 'button' &&
                isPrimarySurface &&
                '[&_[data-action-variant=default]]:bg-primary-foreground [&_[data-action-variant=default]]:text-primary [&_[data-action-variant=default]]:hover:bg-primary-foreground/90',
              resolvedActionMode === 'button' &&
                isSecondarySurface &&
                '[&_[data-action-variant=secondary]]:bg-secondary-foreground [&_[data-action-variant=secondary]]:text-secondary [&_[data-action-variant=secondary]]:hover:bg-secondary-foreground/90',
            )}
            data-program-matrix-actions="true"
            data-surface-contrast={sectionActionsUseSurfaceContrast ? 'true' : undefined}
            mode={resolvedActionMode}
          />
        </div>

        <div
          className="grid overflow-hidden rounded-[var(--radius)] border border-border bg-card text-card-foreground md:grid-cols-2"
          data-program-matrix="true"
        >
          {resolvedItems.map((item, index) => {
            const Icon = item.Icon
            const surface = resolveCardSurface(item.cardBackground)
            const isLastItem = index === resolvedItems.length - 1
            const isLeftColumn = index % 2 === 0
            const lastDesktopRowStart =
              resolvedItems.length - (resolvedItems.length % 2 || 2)
            const isLastDesktopRow = index >= lastDesktopRowStart
            const buttonClassName = surface.button[resolvedActionVariant]

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
                  <p
                    className={cn(
                      'mt-4 max-w-[65ch] text-sm leading-6',
                      surface.secondary,
                    )}
                  >
                    {item.description}
                  </p>
                ) : null}
                {item.href ? (
                  <div className="mt-auto pt-6">
                    <ProgrammeAction
                      actionLabel={resolvedItemActionLabel}
                      actionMode={resolvedActionMode}
                      actionVariant={resolvedActionVariant}
                      buttonClassName={buttonClassName}
                      href={item.href}
                      linkClassName={surface.link}
                      openInNewTab={item.openInNewTab}
                    />
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
