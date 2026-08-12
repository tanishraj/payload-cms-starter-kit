import { ArrowRight } from 'lucide-react'
import type { ComponentProps } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ContentLinkProps = Omit<ComponentProps<'a'>, 'children' | 'href' | 'rel' | 'target'> & {
  href: string
  label: string
  openInNewTab?: boolean
}

export function ContentLink({
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
      <span
        className="underline decoration-current/55 decoration-1 underline-offset-4 transition-[text-decoration-color,text-decoration-thickness] group-hover/button:decoration-current group-hover/button:decoration-2 group-focus-visible/button:decoration-current group-focus-visible/button:decoration-2"
        data-content-link-label="true"
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex size-4 shrink-0 overflow-hidden"
        data-content-link-arrow="true"
      >
        <ArrowRight
          className="absolute left-0 top-0 size-4 rotate-[-35deg] transition-all duration-200 ease-out group-hover/button:translate-x-1 group-hover/button:opacity-0 group-hover/button:rotate-0"
          strokeWidth={2.5}
        />
        <ArrowRight
          className="absolute left-0 top-0 size-4 translate-x-[-70%] opacity-0 transition-all duration-200 ease-out group-hover/button:translate-x-0 group-hover/button:opacity-100"
          strokeWidth={2.5}
        />
      </span>
    </a>
  )
}
