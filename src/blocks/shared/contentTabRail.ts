import { cn } from '@/lib/utils'

export const CONTENT_TAB_VARIANTS = ['contained', 'pill', 'underline'] as const
export type ContentTabVariant = (typeof CONTENT_TAB_VARIANTS)[number]

export const normalizeContentTabVariant = (value?: unknown): ContentTabVariant =>
  value === 'contained' || value === 'pill' ? value : 'underline'

const railClasses = {
  contained: 'border border-border bg-background p-1',
  pill: 'rounded-full border border-border bg-background p-1',
  underline: 'border-b border-border',
} as const satisfies Record<ContentTabVariant, string>

export const getContentTabRailClasses = (variant: ContentTabVariant): string => railClasses[variant]

export const getContentTabClasses = (variant: ContentTabVariant, active: boolean): string =>
  cn(
    'relative inline-flex min-h-11 w-auto shrink-0 items-center justify-center px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
    variant === 'pill' && 'rounded-full',
    variant === 'underline' &&
      'after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-center after:scale-x-0 after:bg-primary after:transition-transform',
    active
      ? variant === 'underline'
        ? 'text-foreground after:scale-x-100'
        : 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground',
  )
