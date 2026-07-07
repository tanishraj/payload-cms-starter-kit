import type {
  Footer2Block,
  HeaderNavbar12Block,
  NavigationLink,
} from '@/payload-types'

import { resolveNavigationLink } from './navigationLinks'

export type NavbarMenuItem = {
  description?: string
  items?: NavbarMenuItem[]
  openInNewTab?: boolean
  title: string
  url?: string
}

export type FooterMenuSection = {
  links: {
    href: string
    name: string
    openInNewTab?: boolean
  }[]
  title: string
}

const getTitle = (
  link: number | NavigationLink | null | undefined,
  override: string | null | undefined,
) => override?.trim() || (typeof link === 'object' && link ? link.title : undefined)

export const resolveHeaderNavigationItems = (
  block: HeaderNavbar12Block,
): NavbarMenuItem[] => {
  const results: NavbarMenuItem[] = []

  for (const item of block.navigationItems ?? []) {
    const parentResolved = resolveNavigationLink(item.link)
    const parentTitle = getTitle(item.link, item.label)
    const children: NavbarMenuItem[] = []

    for (const child of item.children ?? []) {
      const resolved = resolveNavigationLink(child.link)
      const title = getTitle(child.link, child.label)

      if (!resolved.href || !title) {
        continue
      }

      children.push({
        description: child.description ?? resolved.description,
        openInNewTab: resolved.openInNewTab,
        title,
        url: resolved.href,
      })
    }

    if (children.length > 0) {
      const items =
        parentResolved.href && parentTitle
          ? [
              {
                openInNewTab: parentResolved.openInNewTab,
                title: 'Overview',
                url: parentResolved.href,
              },
              ...children,
            ]
          : children

      if (!parentTitle) {
        continue
      }

      results.push({
        items,
        title: parentTitle,
      })
      continue
    }

    if (!parentResolved.href || !parentTitle) {
      continue
    }

    results.push({
      openInNewTab: parentResolved.openInNewTab,
      title: parentTitle,
      url: parentResolved.href,
    })
  }

  return results
}

export const resolveFooterSections = (
  block: Footer2Block,
): FooterMenuSection[] => {
  const results: FooterMenuSection[] = []

  for (const section of block.sections ?? []) {
    const links: FooterMenuSection['links'] = []

    for (const entry of section.links ?? []) {
      const resolved = resolveNavigationLink(entry.link)
      const name =
        entry.name?.trim() || (typeof entry.link === 'object' && entry.link ? entry.link.title : undefined)

      if (!resolved.href || !name) {
        continue
      }

      links.push({
        href: resolved.href,
        name,
        openInNewTab: resolved.openInNewTab,
      })
    }

    if (!section.title || links.length === 0) {
      continue
    }

    results.push({
      links,
      title: section.title,
    })
  }

  return results
}
