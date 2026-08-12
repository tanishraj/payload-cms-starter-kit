import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import {
  contentIntroClasses,
  contentItemDescriptionClasses,
  contentItemLinkClasses,
  contentItemMetadataClasses,
  contentItemTitleClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import {
  resolveCmsActions,
  resolveCmsLink,
  type CmsActionValue,
  type CmsLinkValue,
} from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type EditorialReasonValue = Omit<CmsLinkValue, 'linkType'> & {
  description?: string | null
  id?: string | null
  linkType?: 'custom' | 'none' | 'page' | null
  title?: string | null
}

type EditorialReasonsBlockLike = {
  accentTitle?: string | null
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  description?: string | null
  eyebrow?: string | null
  introVerticalAlignment?: 'bottom' | 'center' | 'top' | null
  reasons?: EditorialReasonValue[] | null
  size?: RegularBlockSize | null
  stickyIntro?: boolean | null
  title?: string | null
}

type ResolvedEditorialReason = {
  description?: string
  href?: string
  id: number | string
  openInNewTab: boolean
  title: string
}

const introAlignmentClasses = {
  top: 'lg:self-start',
  center: 'lg:self-center',
  bottom: 'lg:self-end',
} as const

export function EditorialReasonsBlockComponent({
  accentTitle,
  actionMode = 'link',
  actions,
  appearance,
  description,
  eyebrow,
  introVerticalAlignment = 'top',
  reasons,
  size = 'default',
  stickyIntro = true,
  title,
}: EditorialReasonsBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedReasons = (reasons ?? []).flatMap((reason, index): ResolvedEditorialReason[] => {
    const reasonTitle = reason.title?.trim()
    if (!reasonTitle) return []

    const destination = resolveCmsLink({
      linkType: reason.linkType === 'none' ? null : reason.linkType,
      openInNewTab: reason.openInNewTab,
      page: reason.page,
      url: reason.url,
    })

    return [
      {
        description: reason.description?.trim() || undefined,
        href: destination.href,
        id: reason.id ?? index,
        openInNewTab: destination.openInNewTab ?? false,
        title: reasonTitle,
      },
    ]
  })

  if (!resolvedReasons.length) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedAccentTitle = accentTitle?.trim()
  const resolvedActionMode = actionMode ?? 'link'
  const resolvedActions = resolveCmsActions(actions)
  const resolvedDescription = description?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedIntroAlignment = introVerticalAlignment ?? 'top'
  const resolvedSectionBackground = appearance?.background ?? 'none'
  const resolvedSize = size ?? 'default'
  const resolvedStickyIntro = stickyIntro ?? true

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}
      data-editorial-reasons="true"
    >
      <div
        className={cn(
          regularBlockContainerClasses,
          'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16',
        )}
      >
        <div
          className={cn('min-w-0', introAlignmentClasses[resolvedIntroAlignment])}
          data-editorial-reasons-intro="true"
          data-editorial-reasons-intro-alignment={resolvedIntroAlignment}
        >
          <div
            className={cn(
              contentIntroClasses,
              'items-start',
              resolvedStickyIntro && 'lg:sticky lg:top-28',
            )}
            data-editorial-reasons-sticky={resolvedStickyIntro ? 'true' : 'false'}
          >
            {resolvedEyebrow ? (
              <SectionEyebrow surface={resolvedSectionBackground}>{resolvedEyebrow}</SectionEyebrow>
            ) : null}

            <h2 className={contentSectionHeadingClasses}>
              <span className="block font-[family-name:inherit]">{resolvedTitle}</span>
              {resolvedAccentTitle ? (
                <span className="block font-[family-name:inherit] italic">
                  {resolvedAccentTitle}
                </span>
              ) : null}
            </h2>

            {resolvedDescription ? (
              <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
            ) : null}

            <ContentActions
              actions={resolvedActions}
              alignment="left"
              data-editorial-reasons-actions="true"
              mode={resolvedActionMode}
            />
          </div>
        </div>

        <div className="border-t border-border" data-editorial-reasons-list="true">
          {resolvedReasons.map((reason, index) => (
            <article
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-b border-border py-7 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5 sm:py-8"
              data-editorial-reason="true"
              key={reason.id}
            >
              <span
                aria-hidden="true"
                className={cn(contentItemMetadataClasses, 'pt-1 tabular-nums')}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0">
                {reason.href ? (
                  <h3>
                    <a
                      className={cn(contentItemTitleClasses, contentItemLinkClasses)}
                      href={reason.href}
                      rel={reason.openInNewTab ? 'noreferrer' : undefined}
                      target={reason.openInNewTab ? '_blank' : undefined}
                    >
                      {reason.title}
                    </a>
                  </h3>
                ) : (
                  <h3 className={contentItemTitleClasses}>{reason.title}</h3>
                )}

                {reason.description ? (
                  <p className={cn(contentItemDescriptionClasses, 'mt-2')}>{reason.description}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
