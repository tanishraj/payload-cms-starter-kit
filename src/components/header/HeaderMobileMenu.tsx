'use client'

import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { ResolvedHeaderLink, ResolvedHeaderMenuItem } from '@/lib/headerNavigation'
import { cn } from '@/lib/utils'

type HeaderMobileMenuProps = {
  ctas: Array<ResolvedHeaderLink & { variant?: 'default' | 'link' | 'outline' | null }>
  menuItems: ResolvedHeaderMenuItem[]
}

const topLevelLinkClasses = 'min-h-9 w-full justify-start px-3'

const childLinkClasses = 'h-7 justify-start px-2 font-normal'

const expandableRowClasses = 'min-h-9 w-full justify-between px-3'

export function HeaderMobileMenu({ ctas, menuItems }: HeaderMobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const toggleExpanded = (value: string) => {
    setExpandedItem((current) => (current === value ? null : value))
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <div data-header-mobile-menu="true">
        <SheetTrigger asChild>
          <Button
            aria-expanded={open}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Menu />
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent className="w-full max-w-sm lg:hidden" showCloseButton={false} side="right">
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-sm font-medium text-muted-foreground">Menu</SheetTitle>
          <SheetClose asChild>
            <Button size="icon-sm" type="button" variant="ghost">
              <span className="sr-only">Close menu</span>
              <X />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col gap-0">
              {menuItems.map((item, index) => {
                const hasChildren = Boolean(item.children?.length)
                const itemKey = `${item.label}-${index}`
                const isExpanded = expandedItem === itemKey

                return (
                  <li className="flex flex-col gap-1" key={`${item.label}-${item.href}-${index}`}>
                    {hasChildren ? (
                      <Button
                        aria-expanded={isExpanded}
                        aria-label={`Toggle ${item.label} submenu`}
                        className={expandableRowClasses}
                        onClick={() => toggleExpanded(itemKey)}
                        type="button"
                        variant="ghost"
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            'shrink-0 transition-transform duration-200',
                            isExpanded ? 'rotate-180' : undefined,
                          )}
                        />
                      </Button>
                    ) : (
                      <Button asChild className={cn(topLevelLinkClasses, 'min-w-0 flex-1')} variant="ghost">
                        <a
                          href={item.href}
                          rel={item.newTab ? 'noreferrer' : undefined}
                          target={item.newTab ? '_blank' : undefined}
                        >
                          <span className="truncate">{item.label}</span>
                        </a>
                      </Button>
                    )}

                    {hasChildren ? (
                      <div
                        className={cn(
                          'overflow-hidden pl-2.5 transition-[grid-template-rows,opacity] duration-200',
                          isExpanded
                            ? 'grid grid-rows-[1fr] opacity-100'
                            : 'grid grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <div className="min-h-0">
                          <div className="flex flex-col gap-0 border-l border-border pl-2">
                            {item.children?.map((child) => (
                              <Button
                                asChild
                                className={childLinkClasses}
                                key={`${child.label}-${child.href}`}
                                size="sm"
                                variant="ghost"
                              >
                                <a
                                  href={child.href}
                                  rel={child.newTab ? 'noreferrer' : undefined}
                                  target={child.newTab ? '_blank' : undefined}
                                >
                                  <span className="truncate">{child.label}</span>
                                </a>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          {ctas.length ? (
            <div className="flex flex-col gap-2 border-t pt-4">
              {ctas.map((item) => (
                <Button
                  asChild
                  key={`${item.label}-${item.href}`}
                  variant={item.variant ?? 'default'}
                >
                  <a
                    href={item.href}
                    rel={item.newTab ? 'noreferrer' : undefined}
                    target={item.newTab ? '_blank' : undefined}
                  >
                    {item.label}
                  </a>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
