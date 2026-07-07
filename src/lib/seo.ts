import type { Metadata } from 'next'

export const robotsFieldOptions = [
  {
    label: 'Index, Follow',
    value: 'index,follow',
  },
  {
    label: 'No Index, Follow',
    value: 'noindex,follow',
  },
  {
    label: 'Index, No Follow',
    value: 'index,nofollow',
  },
  {
    label: 'No Index, No Follow',
    value: 'noindex,nofollow',
  },
] as const

export type RobotsFieldValue = (typeof robotsFieldOptions)[number]['value']

export function getRobotsMetadata(value: string | null | undefined): Metadata['robots'] {
  switch (value) {
    case 'noindex,follow':
      return { index: false, follow: true }
    case 'index,nofollow':
      return { index: true, follow: false }
    case 'noindex,nofollow':
      return { index: false, follow: false }
    case 'index,follow':
    default:
      return { index: true, follow: true }
  }
}
