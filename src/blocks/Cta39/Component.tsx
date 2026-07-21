import { ContentActions } from '@/components/ContentActions'
import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type Cta39Size = 'comfortable' | 'compact' | 'default'
type Cta39Alignment = 'center' | 'left' | 'right'

type Cta39BlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: Cta39Alignment | null
  description?: string | null
  size?: Cta39Size | null
  title?: string | null
}

const contentAlignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

export function Cta39BlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  size = 'default',
  title,
}: Cta39BlockLike) {
  const resolvedTitle = title?.trim()
  const resolvedDescription = description?.trim()
  const resolvedSize: Cta39Size = size ?? 'default'
  const resolvedActions = resolveCmsActions(actions)
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedContentAlignment = contentAlignment ?? 'center'

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
            'flex w-full flex-col gap-4 rounded-xl border border-dashed border-border bg-background p-8 sm:gap-5 sm:p-12 md:p-16',
            contentAlignmentClasses[resolvedContentAlignment],
          )}
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {resolvedTitle}
          </h2>
          {resolvedDescription ? (
            <p className="text-base leading-7 text-muted-foreground">{resolvedDescription}</p>
          ) : null}
          <ContentActions
            actions={resolvedActions}
            alignment={resolvedContentAlignment}
            className={resolvedContentAlignment === 'center' ? 'justify-center' : undefined}
            data-cta39-actions="true"
            mode={actionMode ?? 'link'}
          />
        </div>
      </div>
    </section>
  )
}
