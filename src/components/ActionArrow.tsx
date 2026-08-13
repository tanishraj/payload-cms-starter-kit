import { ArrowRight } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Arrow that swings from diagonal to straight on hover.
 *
 * Two stacked arrows inside a clipped box: the resting one sits at -35° and
 * rotates flat as it slides out, while a second, already-flat arrow slides in
 * behind it. Reads as a single arrow straightening out.
 *
 * Shared by buttons and text links so both animate identically. Relies on the
 * `group/button` class that `buttonVariants` puts on every button and link.
 */
export function ActionArrow({ className, ...spanProps }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      {...spanProps}
      className={cn('relative inline-flex size-4 shrink-0 overflow-hidden', className)}
    >
      <ArrowRight
        className="absolute left-0 top-0 size-4 rotate-[-35deg] transition-all duration-200 ease-out motion-reduce:transition-none group-hover/button:translate-x-1 group-hover/button:opacity-0 group-hover/button:rotate-0 group-focus-visible/button:translate-x-1 group-focus-visible/button:opacity-0 group-focus-visible/button:rotate-0"
        strokeWidth={2.5}
      />
      <ArrowRight
        className="absolute left-0 top-0 size-4 translate-x-[-70%] opacity-0 transition-all duration-200 ease-out motion-reduce:transition-none group-hover/button:translate-x-0 group-hover/button:opacity-100 group-focus-visible/button:translate-x-0 group-focus-visible/button:opacity-100"
        strokeWidth={2.5}
      />
    </span>
  )
}
