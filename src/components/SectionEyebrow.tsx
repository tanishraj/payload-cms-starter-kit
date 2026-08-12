import type { ComponentPropsWithoutRef } from 'react'

import type { BlockBackground } from '@/blocks/shared/blockAppearance'
import { cn } from '@/lib/utils'

export type SectionEyebrowSurface = BlockBackground | 'darkOverlay'

type SectionEyebrowProps = ComponentPropsWithoutRef<'p'> & {
  surface?: SectionEyebrowSurface
}

export function SectionEyebrow({
  children,
  className,
  surface = 'none',
  ...props
}: SectionEyebrowProps) {
  return (
    <p
      {...props}
      className={cn(
        'font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70',
        className,
      )}
      data-section-eyebrow="true"
      data-section-eyebrow-surface={surface}
    >
      {children}
    </p>
  )
}
