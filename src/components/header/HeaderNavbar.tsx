import type { ReactNode } from 'react'

import { HeaderMobileMenu } from '@/components/header/HeaderMobileMenu'
import { HeaderNavMenu } from '@/components/header/HeaderNavMenu'
import { Button } from '@/components/ui/button'
import type { ResolvedHeaderLink, ResolvedHeaderMenuItem } from '@/lib/headerNavigation'
import { cn } from '@/lib/utils'

type HeaderNavbarProps = {
  ctas: Array<ResolvedHeaderLink & { variant?: 'default' | 'link' | 'outline' | null }>
  logo: ReactNode
  menuItems: ResolvedHeaderMenuItem[]
  navAlignment: 'left' | 'center' | 'right'
  size: 'compact' | 'default' | 'large'
}

const sizeClasses = {
  compact: 'min-h-14',
  default: 'min-h-16',
  large: 'min-h-20',
} as const

const navAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

export function HeaderNavbar({ ctas, logo, menuItems, navAlignment, size }: HeaderNavbarProps) {
  return (
    <header
      className="border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85"
      data-header-navbar="true"
    >
      <div className={cn('mx-auto flex w-full max-w-screen-2xl items-center gap-4 px-4', sizeClasses[size])}>
        <div className="flex shrink-0 items-center self-stretch">{logo}</div>

        <div className={cn('hidden min-w-0 flex-1 lg:flex', navAlignmentClasses[navAlignment])}>
          <HeaderNavMenu menuItems={menuItems} />
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {ctas.map((item) => (
            <Button asChild key={`${item.label}-${item.href}`} variant={item.variant ?? 'default'}>
              <a href={item.href} rel={item.newTab ? 'noreferrer' : undefined} target={item.newTab ? '_blank' : undefined}>
                {item.label}
              </a>
            </Button>
          ))}
        </div>

        <div className="ml-auto lg:hidden">
          <HeaderMobileMenu ctas={ctas} menuItems={menuItems} />
        </div>
      </div>
    </header>
  )
}
