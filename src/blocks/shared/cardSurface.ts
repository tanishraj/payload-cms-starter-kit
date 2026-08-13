import type { CmsActionVariant } from '@/lib/cmsLinks'

import type { BlockBackground } from './blockAppearance'
import { cardSurfaceValues, type CardSurfaceValue } from './cardThemeFields'

export type CardSurfaceClasses = {
  button: Partial<Record<CmsActionVariant, string>>
  className: string
  divider: string
  icon: string
  link: string
  overlay: string
  secondary: string
  value: CardSurfaceValue
}

const explicitCardSurfaceClasses: Record<
  Exclude<CardSurfaceValue, 'default'>,
  CardSurfaceClasses
> = {
  primary: {
    value: 'primary',
    className: 'bg-primary text-primary-foreground',
    secondary: 'text-primary-foreground/75',
    icon: 'text-primary-foreground',
    divider: 'border-primary-foreground/15',
    link: 'text-primary-foreground hover:text-primary-foreground/80',
    overlay: 'from-primary via-primary/75 to-transparent text-primary-foreground',
    button: {
      default:
        'bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:border-primary-foreground focus-visible:ring-primary-foreground/30',
    },
  },
  secondary: {
    value: 'secondary',
    className: 'bg-secondary text-secondary-foreground',
    secondary: 'text-secondary-foreground/70',
    icon: 'text-secondary-foreground',
    divider: 'border-secondary-foreground/15',
    link: 'text-secondary-foreground hover:text-secondary-foreground/80',
    overlay: 'from-secondary via-secondary/75 to-transparent text-secondary-foreground',
    button: {
      secondary:
        'bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 focus-visible:border-secondary-foreground focus-visible:ring-secondary-foreground/30',
    },
  },
  muted: {
    value: 'muted',
    className: 'bg-muted text-foreground',
    secondary: 'text-muted-foreground',
    icon: 'text-primary',
    divider: 'border-border',
    link: 'text-primary hover:text-primary/80',
    overlay: 'from-muted via-muted/75 to-transparent text-foreground',
    button: {},
  },
  accent: {
    value: 'accent',
    className: 'bg-accent text-accent-foreground',
    secondary: 'text-accent-foreground/70',
    icon: 'text-primary',
    divider: 'border-accent-foreground/15',
    link: 'text-primary hover:text-primary/80',
    overlay: 'from-accent via-accent/75 to-transparent text-accent-foreground',
    button: {},
  },
}

const defaultDividerClasses: Record<BlockBackground, string> = {
  none: 'border-current/10',
  primary: 'border-current/15',
  secondary: 'border-current/10',
  muted: 'border-current/10',
  accent: 'border-current/10',
  'gradient-secondary': 'border-current/10',
  'gradient-muted': 'border-current/10',
  'gradient-accent': 'border-current/10',
  'gradient-success': 'border-current/10',
  'gradient-error': 'border-current/10',
  'gradient-info': 'border-current/10',
  'gradient-warning': 'border-current/10',
}

const resolveDefaultCardSurface = (
  sectionBackground: BlockBackground = 'none',
): CardSurfaceClasses => {
  const usesPrimaryAccent =
    sectionBackground === 'none' ||
    sectionBackground === 'muted' ||
    sectionBackground === 'gradient-muted'

  return {
    value: 'default',
    className: 'bg-transparent text-current',
    secondary: 'text-current/70',
    icon: usesPrimaryAccent ? 'text-primary' : 'text-current',
    divider: defaultDividerClasses[sectionBackground],
    link: usesPrimaryAccent
      ? 'text-primary hover:text-primary/80'
      : 'text-current hover:text-current/80',
    overlay: 'from-black/80 via-black/50 to-transparent text-white',
    button:
      sectionBackground === 'primary'
        ? {
            default:
              'bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:border-primary-foreground focus-visible:ring-primary-foreground/30',
          }
        : sectionBackground === 'secondary' || sectionBackground === 'gradient-secondary'
          ? {
              secondary:
                'bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 focus-visible:border-secondary-foreground focus-visible:ring-secondary-foreground/30',
            }
          : {},
  }
}

export const resolveCardSurface = (
  value?: string | null,
  sectionBackground: BlockBackground = 'none',
): CardSurfaceClasses => {
  const resolvedValue = cardSurfaceValues.includes(value as CardSurfaceValue)
    ? (value as CardSurfaceValue)
    : 'default'

  return resolvedValue === 'default'
    ? resolveDefaultCardSurface(sectionBackground)
    : explicitCardSurfaceClasses[resolvedValue]
}
