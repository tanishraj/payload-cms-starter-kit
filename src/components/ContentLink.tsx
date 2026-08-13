import type { ComponentProps, CSSProperties } from 'react'

import { ActionArrow } from '@/components/ActionArrow'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ContentLinkProps = Omit<ComponentProps<'a'>, 'children' | 'href' | 'rel' | 'target'> & {
  arrowStyle?: CSSProperties
  href: string
  label: string
  openInNewTab?: boolean
}

export function ContentLink({
  arrowStyle,
  className,
  href,
  label,
  openInNewTab,
  ...anchorProps
}: ContentLinkProps) {
  return (
    <a
      {...anchorProps}
      className={cn(
        buttonVariants({ variant: 'link' }),
        'group/button h-auto gap-2 px-0 py-0 text-sm font-semibold no-underline hover:no-underline',
        className,
      )}
      data-content-link="true"
      href={href}
      rel={openInNewTab ? 'noreferrer' : undefined}
      target={openInNewTab ? '_blank' : undefined}
    >
      {/* Underline stays a constant weight; only the arrow reacts to hover. */}
      <span
        className="underline decoration-current decoration-2 underline-offset-4"
        data-content-link-label="true"
      >
        {label}
      </span>
      <ActionArrow data-content-link-arrow="true" style={arrowStyle} />
    </a>
  )
}
