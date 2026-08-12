import { cn } from '@/lib/utils'

export type BlockBackground = 'none' | 'primary' | 'secondary' | 'muted' | 'accent'

export type BlockAppearance = {
  background?: BlockBackground | null
  border?: 'none' | 'top' | 'bottom' | 'topAndBottom' | null
}

const backgroundClasses = {
  none: '',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  muted: 'bg-muted',
  accent: 'bg-accent',
} as const

const surfaceForegroundClasses = {
  none: '',
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  muted: 'text-foreground',
  accent: 'text-accent-foreground',
} as const

const borderClasses = {
  none: '',
  top: 'border-t border-border',
  bottom: 'border-b border-border',
  topAndBottom: 'border-y border-border',
} as const

export function resolveBlockAppearanceClasses(appearance?: BlockAppearance | null) {
  const background = appearance?.background ?? 'none'
  const border = appearance?.border ?? 'none'

  const backgroundClassName = backgroundClasses[background]
  const textClassName = surfaceForegroundClasses[background]
  const borderClassName = borderClasses[border]

  return {
    backgroundClassName,
    textClassName,
    borderClassName,
    className: cn(backgroundClassName, textClassName, borderClassName),
  }
}
