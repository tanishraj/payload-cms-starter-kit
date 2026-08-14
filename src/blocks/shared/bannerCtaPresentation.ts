export type BannerActionPlacement = 'below' | 'side'
export type BannerContentAlignment = 'center' | 'left' | 'right'
export type BannerContentWidth = 'default' | 'narrow' | 'wide'
export type BannerHeight = 'compact' | 'default' | 'immersive'
export type BannerOverlayDirection = 'leftToRight' | 'rightToLeft' | 'vertical'
export type BannerOverlayStyle = 'dark' | 'darker' | 'light'
export type BannerThemeMode = 'auto' | 'dark' | 'light'

// `auto` tints with --primary so the scrim tracks the active theme; `light`
// tints with --background for dark copy; `dark` keeps white copy readable.
export const bannerOverlayClasses = {
  auto: {
    light: {
      vertical: 'bg-linear-to-b from-primary/72 via-primary/56 to-primary/78',
      leftToRight: 'bg-linear-to-r from-primary/72 via-primary/56 to-primary/78',
      rightToLeft: 'bg-linear-to-l from-primary/72 via-primary/56 to-primary/78',
    },
    dark: {
      vertical: 'bg-linear-to-b from-primary/86 via-primary/72 to-primary/88',
      leftToRight: 'bg-linear-to-r from-primary/86 via-primary/72 to-primary/88',
      rightToLeft: 'bg-linear-to-l from-primary/86 via-primary/72 to-primary/88',
    },
    darker: {
      vertical: 'bg-linear-to-b from-primary/95 via-primary/82 to-primary/45',
      leftToRight: 'bg-linear-to-r from-primary/95 via-primary/82 to-primary/45',
      rightToLeft: 'bg-linear-to-l from-primary/95 via-primary/82 to-primary/45',
    },
  },
  light: {
    light: {
      vertical: 'bg-linear-to-b from-background/72 via-background/56 to-background/78',
      leftToRight: 'bg-linear-to-r from-background/72 via-background/56 to-background/78',
      rightToLeft: 'bg-linear-to-l from-background/72 via-background/56 to-background/78',
    },
    dark: {
      vertical: 'bg-linear-to-b from-background/82 via-background/68 to-background/86',
      leftToRight: 'bg-linear-to-r from-background/82 via-background/68 to-background/86',
      rightToLeft: 'bg-linear-to-l from-background/82 via-background/68 to-background/86',
    },
    darker: {
      vertical: 'bg-linear-to-b from-background/94 via-background/80 to-background/40',
      leftToRight: 'bg-linear-to-r from-background/94 via-background/80 to-background/40',
      rightToLeft: 'bg-linear-to-l from-background/94 via-background/80 to-background/40',
    },
  },
  dark: {
    light: {
      vertical: 'bg-linear-to-b from-black/56 via-black/42 to-black/62',
      leftToRight: 'bg-linear-to-r from-black/56 via-black/42 to-black/62',
      rightToLeft: 'bg-linear-to-l from-black/56 via-black/42 to-black/62',
    },
    dark: {
      vertical: 'bg-linear-to-b from-black/68 via-black/54 to-black/74',
      leftToRight: 'bg-linear-to-r from-black/68 via-black/54 to-black/74',
      rightToLeft: 'bg-linear-to-l from-black/68 via-black/54 to-black/74',
    },
    darker: {
      vertical: 'bg-linear-to-b from-black/86 via-black/70 to-black/34',
      leftToRight: 'bg-linear-to-r from-black/86 via-black/70 to-black/34',
      rightToLeft: 'bg-linear-to-l from-black/86 via-black/70 to-black/34',
    },
  },
} as const

export const bannerTextToneClasses = {
  auto: { title: 'text-primary-foreground', description: 'text-primary-foreground/84' },
  light: { title: 'text-foreground', description: 'text-foreground/84' },
  dark: { title: 'text-white', description: 'text-white/84' },
} as const

export const bannerAlignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

export const bannerActionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

export const bannerContentWidthClasses = {
  narrow: 'max-w-xl',
  default: 'max-w-2xl',
  wide: 'max-w-4xl',
} as const

export const bannerTitleSizeClasses = {
  compact: 'text-3xl sm:text-4xl md:text-5xl',
  default: 'text-4xl sm:text-5xl md:text-6xl',
  immersive: 'text-4xl sm:text-6xl md:text-7xl',
} as const

export const bannerHeightClasses = {
  compact: 'min-h-[32dvh]',
  default: 'min-h-[46dvh]',
  immersive: 'min-h-[68dvh]',
} as const

export function resolveBannerActionPlacement(
  value: BannerActionPlacement | 'inline' | null | undefined,
): BannerActionPlacement {
  return value === 'inline' ? 'below' : (value ?? 'side')
}
