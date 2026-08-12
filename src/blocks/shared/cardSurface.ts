import type { CmsActionVariant } from '@/lib/cmsLinks'

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

const cardSurfaceClasses: Record<CardSurfaceValue, CardSurfaceClasses> = {
  default: {
    value: 'default',
    className: 'bg-card text-card-foreground',
    secondary: 'text-muted-foreground',
    icon: 'text-primary',
    divider: 'border-border',
    link: 'text-primary hover:text-primary/80',
    overlay: 'from-card via-card/75 to-transparent text-card-foreground',
    button: {},
  },
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

export const resolveCardSurface = (value?: string | null): CardSurfaceClasses => {
  const resolvedValue = cardSurfaceValues.includes(value as CardSurfaceValue)
    ? (value as CardSurfaceValue)
    : 'default'

  return cardSurfaceClasses[resolvedValue]
}
