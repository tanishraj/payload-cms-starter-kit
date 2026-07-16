import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import { Button } from '@/components/ui/button'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type HeroButton = {
  label?: string | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  url?: string | null
  variant?: 'default' | 'link' | 'outline' | 'secondary' | null
}

type HeroInstitutionalBlockLike = {
  appearance?: BlockAppearance | null
  backgroundImage?: unknown
  buttons?: HeroButton[] | null
  contentWidth?: 'default' | 'narrow' | 'wide' | null
  description?: string | null
  eyebrow?: string | null
  height?: '40' | '60' | '80' | 'balanced' | 'compact' | 'default' | 'immersive' | null
  horizontalAlignment?: 'center' | 'left' | 'right' | null
  overlayStyle?: 'brand' | 'dark' | 'darker' | 'ink' | 'light' | 'soft' | null
  themeMode?: 'auto' | 'dark' | 'light' | null
  title: string
  verticalAlignment?: 'bottom' | 'center' | 'top' | null
}

const overlayClasses = {
  auto: {
    light: 'bg-linear-to-b from-background/72 via-background/56 to-background/78',
    dark: 'bg-linear-to-b from-background/82 via-background/68 to-background/86',
    darker: 'bg-linear-to-b from-background/90 via-background/80 to-background/92',
  },
  light: {
    light: 'bg-linear-to-b from-background/72 via-background/56 to-background/78',
    dark: 'bg-linear-to-b from-background/82 via-background/68 to-background/86',
    darker: 'bg-linear-to-b from-background/90 via-background/80 to-background/92',
  },
  dark: {
    light: 'bg-linear-to-b from-black/56 via-black/42 to-black/62',
    dark: 'bg-linear-to-b from-black/68 via-black/54 to-black/74',
    darker: 'bg-linear-to-b from-black/80 via-black/68 to-black/84',
  },
} as const

const textToneClasses = {
  auto: {
    eyebrow: 'text-foreground/78',
    title: 'text-foreground',
    description: 'text-foreground/84',
  },
  light: {
    eyebrow: 'text-slate-950/78',
    title: 'text-slate-950',
    description: 'text-slate-950/84',
  },
  dark: {
    eyebrow: 'text-white/78',
    title: 'text-white',
    description: 'text-white/84',
  },
} as const

const horizontalShellClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const textAlignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

const verticalShellClasses = {
  top: 'items-start py-16 md:py-20',
  center: 'items-center py-16 md:py-20',
  bottom: 'items-end py-16 md:py-20',
} as const

const contentWidthClasses = {
  narrow: 'max-w-xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
} as const

const titleWidthClasses = {
  narrow: 'max-w-[12ch]',
  default: 'max-w-[16ch]',
  wide: 'max-w-[20ch]',
} as const

const descriptionWidthClasses = {
  narrow: 'max-w-[46ch]',
  default: 'max-w-[60ch]',
  wide: 'max-w-[72ch]',
} as const

const heightClasses = {
  compact: 'min-h-[40dvh]',
  default: 'min-h-[60dvh]',
  immersive: 'min-h-[80dvh]',
} as const

const titleSizeClasses = {
  compact: 'text-3xl sm:text-4xl md:text-5xl',
  default: 'text-4xl sm:text-5xl md:text-6xl',
  immersive: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
} as const

const descriptionSizeClasses = {
  compact: 'text-sm leading-6 lg:text-lg',
  default: 'text-base leading-7 lg:text-xl',
  immersive: 'text-base leading-7 lg:text-xl',
} as const

const actionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const heroButtonToneClasses = {
  auto: {
    default: '',
    secondary:
      'bg-slate-950/8 text-slate-950 hover:bg-slate-950/12 aria-expanded:bg-slate-950/12 aria-expanded:text-slate-950',
    outline:
      'border-slate-950/16 bg-white/78 text-slate-950 hover:bg-white hover:text-slate-950 aria-expanded:bg-white aria-expanded:text-slate-950 dark:bg-white/78 dark:hover:bg-white',
    link: 'text-slate-950 hover:text-slate-950/80',
  },
  light: {
    default: '',
    secondary:
      'bg-slate-950/8 text-slate-950 hover:bg-slate-950/12 aria-expanded:bg-slate-950/12 aria-expanded:text-slate-950',
    outline:
      'border-slate-950/16 bg-white/78 text-slate-950 hover:bg-white hover:text-slate-950 aria-expanded:bg-white aria-expanded:text-slate-950 dark:bg-white/78 dark:hover:bg-white',
    link: 'text-slate-950 hover:text-slate-950/80',
  },
  dark: {
    default: '',
    secondary:
      'bg-white/12 text-white hover:bg-white/18 aria-expanded:bg-white/18 aria-expanded:text-white',
    outline:
      'border-white/20 bg-white/8 text-white hover:bg-white/14 hover:text-white aria-expanded:bg-white/14 aria-expanded:text-white dark:bg-white/8 dark:hover:bg-white/14',
    link: 'text-white hover:text-white/84',
  },
} as const

export function HeroInstitutionalBlockComponent({
  appearance,
  backgroundImage,
  buttons,
  contentWidth = 'default',
  description,
  eyebrow,
  height = 'default',
  horizontalAlignment = 'left',
  overlayStyle = 'dark',
  themeMode = 'auto',
  title,
  verticalAlignment = 'center',
}: HeroInstitutionalBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedContentWidth = contentWidth ?? 'default'
  const resolvedHorizontalAlignment = horizontalAlignment ?? 'left'
  const resolvedOverlayStyle =
    overlayStyle === 'ink'
      ? 'darker'
      : overlayStyle === 'brand'
        ? 'dark'
        : overlayStyle === 'soft'
          ? 'light'
          : (overlayStyle ?? 'dark')
  const resolvedThemeMode = themeMode ?? 'auto'
  const resolvedVerticalAlignment = verticalAlignment ?? 'center'
  const resolvedHeight =
    height === '40'
      ? 'compact'
      : height === '80'
        ? 'immersive'
        : height === '60' || height === 'balanced'
          ? 'default'
          : (height ?? 'default')

  const image = getMediaImageProps({
    media: backgroundImage as never,
    preset: 'hero',
    fallbackAlt: title,
  })

  if (!image) {
    return null
  }

  const actions = (buttons ?? []).flatMap((button) => {
    const label = button.label?.trim()
    const link = resolveCmsLink(button)
    const resolvedVariant = button.variant ?? 'default'

    return label && link.href
      ? [
          {
            href: link.href,
            label,
            openInNewTab: link.openInNewTab,
            variant: resolvedVariant,
          },
        ]
      : []
  })

  return (
    <section
      className={cn('relative isolate overflow-hidden', appearanceClasses.className)}
      data-hero-background={appearance?.background ?? 'none'}
      data-hero-block="true"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={image.alt} className="size-full object-cover" src={image.src} />
      </div>
      <div
        className={cn('absolute inset-0', overlayClasses[resolvedThemeMode][resolvedOverlayStyle])}
        data-hero-overlay={resolvedOverlayStyle}
        data-hero-theme={resolvedThemeMode}
      />
      <div
        className={cn('relative mx-auto flex max-w-screen-2xl px-4', heightClasses[resolvedHeight])}
        data-hero-height={resolvedHeight}
      >
        <div
          className={cn(
            'flex w-full',
            horizontalShellClasses[resolvedHorizontalAlignment],
            verticalShellClasses[resolvedVerticalAlignment],
          )}
          data-hero-horizontal={resolvedHorizontalAlignment}
          data-hero-vertical={resolvedVerticalAlignment}
        >
          <div
            className={cn(
              'flex flex-col gap-8 lg:flex-1',
              resolvedHorizontalAlignment !== 'center' ? 'lg:max-w-xl' : contentWidthClasses[resolvedContentWidth],
              textAlignmentClasses[resolvedHorizontalAlignment],
            )}
            data-hero-content-width={resolvedContentWidth}
          >
            <div className="flex flex-col gap-6">
              {eyebrow ? (
                <p
                  className={cn(
                    'font-mono text-xs font-semibold uppercase tracking-[0.28em]',
                    textToneClasses[resolvedThemeMode].eyebrow,
                  )}
                  data-hero-eyebrow="true"
                >
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className={cn(
                  'font-semibold tracking-tight text-balance',
                  titleSizeClasses[resolvedHeight],
                  textToneClasses[resolvedThemeMode].title,
                  titleWidthClasses[resolvedContentWidth],
                )}
              >
                {title}
              </h1>
              {description ? (
                <p
                  className={cn(
                    'text-balance',
                    descriptionSizeClasses[resolvedHeight],
                    descriptionWidthClasses[resolvedContentWidth],
                    textToneClasses[resolvedThemeMode].description,
                    resolvedHorizontalAlignment !== 'center' ? 'max-w-2xl' : undefined,
                  )}
                  data-hero-description="true"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {actions.length > 0 ? (
              <div
                className={cn(
                  'flex flex-col gap-3 sm:flex-row',
                  actionAlignmentClasses[resolvedHorizontalAlignment],
                )}
                data-hero-actions="true"
              >
                {actions.map((action) => (
                  <Button
                    asChild
                    key={`${action.label}-${action.href}`}
                    size="lg"
                    variant={action.variant}
                    className={cn(
                      'h-12 w-full sm:w-auto',
                      heroButtonToneClasses[resolvedThemeMode][action.variant],
                    )}
                  >
                    <a
                      href={action.href}
                      rel={action.openInNewTab ? 'noreferrer' : undefined}
                      target={action.openInNewTab ? '_blank' : undefined}
                    >
                      {action.label}
                    </a>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
