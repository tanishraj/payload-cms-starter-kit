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
        'group/button h-auto gap-2 px-0 py-0 text-sm',
        className,
      )}
      href={href}
      rel={openInNewTab ? 'noreferrer' : undefined}
      target={openInNewTab ? '_blank' : undefined}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="relative inline-flex size-4 shrink-0 overflow-hidden">
        <ArrowRight className="absolute left-0 top-0 size-4 rotate-[-35deg] transition-all duration-200 ease-out group-hover/button:translate-x-1 group-hover/button:opacity-0 group-hover/button:rotate-0" />
        <ArrowRight className="absolute left-0 top-0 size-4 translate-x-[-70%] opacity-0 transition-all duration-200 ease-out group-hover/button:translate-x-0 group-hover/button:opacity-100" />
      </span>
    </a>
  )
}
