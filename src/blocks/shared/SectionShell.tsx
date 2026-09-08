import type { ComponentProps, ReactNode } from 'react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'

type SectionShellProps = Omit<ComponentProps<'section'>, 'children'> & {
  appearance?: BlockAppearance | null
  children: ReactNode
  containerClassName?: string
  size?: RegularBlockSize | null
}

export function SectionShell({
  appearance,
  children,
  className,
  containerClassName,
  size = 'default',
  ...sectionProps
}: SectionShellProps) {
  const resolvedAppearance = resolveBlockAppearanceClasses(appearance)
  const resolvedSize = size ?? 'default'

  return (
    <section
      {...sectionProps}
      className={cn(
        regularBlockMobilePaddingClasses[resolvedSize],
        resolvedAppearance.className,
        className,
      )}
    >
      <div className={cn(regularBlockContainerClasses, containerClassName)}>{children}</div>
    </section>
  )
}
