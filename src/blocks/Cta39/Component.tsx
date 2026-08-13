import { ContentActions } from '@/components/ContentActions'
import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type Cta39Size = 'none' | 'comfortable' | 'compact' | 'default'
type Cta39Alignment = 'center' | 'left' | 'right'
type Cta39BorderStyle = 'dashed' | 'dotted' | 'none' | 'solid'

type Cta39BlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  borderStyle?: Cta39BorderStyle | null
  contentAlignment?: Cta39Alignment | null
  description?: string | null
  footerActions?: CmsActionValue[] | null
  size?: Cta39Size | null
  title?: string | null
}

const contentAlignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

const borderStyleClasses: Record<Cta39BorderStyle, string> = {
  dashed: 'border border-dashed border-border',
  dotted: 'border border-dotted border-border',
  solid: 'border border-solid border-border',
  none: '',
}

export function Cta39BlockComponent({
  accentTitle,
  actions,
  appearance,
  borderStyle = 'dashed',
  contentAlignment = 'center',
  description,
  footerActions,
  size = 'default',
  title,
}: Cta39BlockLike) {
  const resolvedTitle = title?.trim()
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const resolvedDescription = description?.trim()
  const resolvedSize: Cta39Size = size ?? 'default'
  const resolvedActions = resolveCmsActions(actions)
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedContentAlignment = contentAlignment ?? 'center'
  const resolvedBorderStyle: Cta39BorderStyle = borderStyle ?? 'dashed'

  if (!resolvedTitle) {
    return null
  }

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[resolvedSize],
        appearanceClasses.className,
      )}
      data-cta39-background={appearance?.background ?? 'none'}
    >
      <div className={regularBlockContainerClasses}>
        <div
          className={cn(
            'flex w-full flex-col gap-4 rounded-xl bg-background text-foreground p-8 sm:gap-5 sm:p-12 md:p-16',
            borderStyleClasses[resolvedBorderStyle],
            contentAlignmentClasses[resolvedContentAlignment],
          )}
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {resolvedAccentTitle ? (
              <>
                <span className="block">{resolvedTitle}</span>
                <em className="block">{resolvedAccentTitle}</em>
              </>
            ) : (
              resolvedTitle
            )}
          </h2>
          {resolvedDescription ? (
            <p className="text-base leading-7 text-muted-foreground">{resolvedDescription}</p>
          ) : null}
          <ContentActions
            actions={resolvedActions}
            alignment={resolvedContentAlignment}
            className={resolvedContentAlignment === 'center' ? 'justify-center' : undefined}
            data-cta39-actions="true"
          />
        </div>
        <BlockFooterActions actions={footerActions} />
      </div>
    </section>
  )
}
