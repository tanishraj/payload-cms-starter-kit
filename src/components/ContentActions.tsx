import type { ComponentProps } from 'react'

import { ActionButtonContent } from '@/components/ActionButtonContent'
import { ContentLink } from '@/components/ContentLink'
import { Button } from '@/components/ui/button'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type ContentActionAlignment = 'center' | 'left' | 'right'
type ContentActionMode = 'button' | 'link'

type ContentActionsProps = Omit<ComponentProps<'div'>, 'children'> & {
  actions: ResolvedCmsAction[]
  alignment?: ContentActionAlignment
  mode?: ContentActionMode
}

const linkAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const buttonAlignmentClasses = {
  left: 'items-start sm:justify-start',
  center: 'items-center sm:justify-center',
  right: 'items-end sm:justify-end',
} as const

export function ContentActions({
  actions,
  alignment = 'left',
  className,
  mode = 'link',
  ...divProps
}: ContentActionsProps) {
  if (!actions.length) {
    return null
  }

  return (
    <div
      {...divProps}
      className={cn(
        'flex w-full flex-wrap',
        mode === 'button'
          ? cn('flex-col gap-3 sm:flex-row', buttonAlignmentClasses[alignment])
          : cn('gap-x-6 gap-y-3', linkAlignmentClasses[alignment]),
        className,
      )}
      data-action-mode={mode}
    >
      {actions.map((action, index) => {
        const rendersAsButton = mode === 'button' && action.variant !== 'link'

        return rendersAsButton ? (
          <Button
            asChild
            data-action-variant={action.variant}
            key={`${action.label}-${action.href}-${index}`}
            size="lg"
            variant={action.variant}
          >
            <a
              href={action.href}
              rel={action.openInNewTab ? 'noreferrer' : undefined}
              target={action.openInNewTab ? '_blank' : undefined}
            >
              <ActionButtonContent label={action.label} showArrow={action.showArrow} />
            </a>
          </Button>
        ) : (
          <ContentLink
            href={action.href}
            key={`${action.label}-${action.href}-${index}`}
            label={action.label}
            openInNewTab={action.openInNewTab}
          />
        )
      })}
    </div>
  )
}
