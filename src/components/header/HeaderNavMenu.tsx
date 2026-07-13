import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import type { ResolvedHeaderMenuItem } from '@/lib/headerNavigation'
import { cn } from '@/lib/utils'

type HeaderNavMenuProps = {
  menuItems: ResolvedHeaderMenuItem[]
}

const triggerLinkClasses = 'text-sm font-medium text-foreground'

export function HeaderNavMenu({ menuItems }: HeaderNavMenuProps) {
  if (menuItems.length === 0) {
    return null
  }

  return (
    <nav aria-label="Primary navigation">
      <NavigationMenu className="max-w-none" viewport={false}>
        <NavigationMenuList className="gap-1">
          {menuItems.map((item) => {
            const hasChildren = Boolean(item.children?.length)

            return (
              <NavigationMenuItem className="relative" key={`${item.label}-${item.href}`}>
                {hasChildren ? (
                  <>
                    <NavigationMenuTrigger className="h-8 rounded-full px-3 pr-2.5">
                      <span className={triggerLinkClasses}>{item.label}</span>
                    </NavigationMenuTrigger>

                    <NavigationMenuContent className="left-0 min-w-56 p-1.5 md:w-56">
                      <ul className="flex flex-col gap-0.5">
                        {item.children?.map((child) => (
                          <li key={`${child.label}-${child.href}`}>
                            <NavigationMenuLink
                              className="h-8 rounded-full px-3 py-0 font-normal hover:bg-muted/80 focus:bg-muted/80"
                              href={child.href}
                              rel={child.newTab ? 'noreferrer' : undefined}
                              target={child.newTab ? '_blank' : undefined}
                            >
                              <span className="truncate">{child.label}</span>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className={cn(navigationMenuTriggerStyle(), 'h-8 rounded-full px-3 py-0')}
                    href={item.href}
                    rel={item.newTab ? 'noreferrer' : undefined}
                    target={item.newTab ? '_blank' : undefined}
                  >
                    <span className={triggerLinkClasses}>{item.label}</span>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}
