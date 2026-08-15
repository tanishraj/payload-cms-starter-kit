import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
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
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type Cta39Alignment = 'center' | 'left' | 'right'
type Cta39HeaderLayout = 'split' | 'stacked'
type Cta39SplitContentAlignment = 'bottom' | 'center' | 'top'

type Cta39BlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: Cta39Alignment | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  headerLayout?: Cta39HeaderLayout | null
  size?: RegularBlockSize | null
  splitContentAlignment?: Cta39SplitContentAlignment | null
  title?: string | null
}

const blockAlignmentClasses = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
} as const

const contentAlignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

const descriptionAlignmentClasses = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
} as const

const splitContentAlignmentClasses = {
  top: 'lg:self-start',
  center: 'lg:self-center',
  bottom: 'lg:self-end',
} as const

const validAlignments = new Set<Cta39Alignment>(['left', 'center', 'right'])
const validSizes = new Set<RegularBlockSize>(['none', 'compact', 'default', 'comfortable'])

export function Cta39BlockComponent({
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  footerActions,
  headerLayout = 'stacked',
  size = 'default',
  splitContentAlignment = 'center',
  title,
}: Cta39BlockLike) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const resolvedDescription = description?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedActions = resolveCmsActions(actions)
  const resolvedContentAlignment = validAlignments.has(contentAlignment as Cta39Alignment)
    ? (contentAlignment as Cta39Alignment)
    : 'center'
  const resolvedSize = validSizes.has(size as RegularBlockSize)
    ? (size as RegularBlockSize)
    : 'default'
  const resolvedSplitContentAlignment: Cta39SplitContentAlignment =
    splitContentAlignment === 'top' || splitContentAlignment === 'bottom'
      ? splitContentAlignment
      : 'center'
  const hasSupportingContent = Boolean(resolvedDescription || resolvedActions.length)
  const resolvedHeaderLayout: Cta39HeaderLayout =
    headerLayout === 'split' && hasSupportingContent ? 'split' : 'stacked'
  const { background, className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)

  const heading = (
    <h2 className={contentSectionHeadingClasses}>
      {resolvedAccentTitle ? (
        <>
          <span className="block">{resolvedTitle}</span>
          <em className="block">{resolvedAccentTitle}</em>
        </>
      ) : (
        resolvedTitle
      )}
    </h2>
  )

  const supportingContent = (
    <>
      {resolvedDescription ? (
        <p
          className={cn(
            contentSectionDescriptionClasses,
            'max-w-2xl',
            descriptionAlignmentClasses[resolvedContentAlignment],
          )}
        >
          {resolvedDescription}
        </p>
      ) : null}
      <ContentActions
        actions={resolvedActions}
        alignment={resolvedContentAlignment}
        data-cta39-actions="true"
      />
    </>
  )

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}
      data-cta39="true"
      data-cta39-background={background}
      data-cta39-layout={resolvedHeaderLayout}
    >
      <div className={regularBlockContainerClasses}>
        <header
          className={cn(
            'grid gap-6',
            resolvedHeaderLayout === 'split'
              ? 'lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:gap-16'
              : cn('max-w-3xl', blockAlignmentClasses[resolvedContentAlignment]),
          )}
        >
          <div
            className={cn(
              'flex min-w-0 flex-col gap-4',
              contentAlignmentClasses[resolvedContentAlignment],
            )}
            data-content-alignment={resolvedContentAlignment}
          >
            {resolvedEyebrow ? (
              <SectionEyebrow surface={background}>{resolvedEyebrow}</SectionEyebrow>
            ) : null}
            {heading}
            {resolvedHeaderLayout === 'stacked' ? supportingContent : null}
          </div>

          {resolvedHeaderLayout === 'split' ? (
            <div
              className={cn(
                'flex min-w-0 max-w-2xl flex-col gap-4',
                blockAlignmentClasses[resolvedContentAlignment],
                contentAlignmentClasses[resolvedContentAlignment],
                splitContentAlignmentClasses[resolvedSplitContentAlignment],
              )}
              data-cta39-split-alignment={resolvedSplitContentAlignment}
            >
              {supportingContent}
            </div>
          ) : null}
        </header>

        <BlockFooterActions actions={footerActions} alignment={resolvedContentAlignment} />
      </div>
    </section>
  )
}
