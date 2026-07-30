import Image from 'next/image'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

import { LogoStripMarquee, type ResolvedLogo } from './LogoStripMarquee'

type LogoItem = {
  id?: string | null
  image?: unknown
  label?: string | null
  openInNewTab?: boolean | null
  url?: string | null
}

type LogoStripBlockLike = {
  appearance?: BlockAppearance | null
  displayMode?: 'grid' | 'marquee' | null
  eyebrow?: string | null
  grayscale?: boolean | null
  logoHeight?: 'sm' | 'md' | 'lg' | null
  logos?: LogoItem[] | null
  showLabels?: boolean | null
  size?: RegularBlockSize | null
  title?: string | null
}

const logoHeightClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
} as const

export function LogoStripBlockComponent({
  appearance,
  displayMode = 'marquee',
  eyebrow,
  grayscale = true,
  logoHeight = 'md',
  logos,
  showLabels = false,
  size = 'default',
  title,
}: LogoStripBlockLike) {
  const resolvedLogos: ResolvedLogo[] = (logos ?? []).flatMap((item, index): ResolvedLogo[] => {
    const media = item.image as Media | null | undefined
    if (!isMediaDoc(media)) return []

    const src = getMediaAbsoluteUrl(media)
    if (!src) return []

    return [
      {
        id: item.id ?? index,
        src,
        alt: media.alt?.trim() || item.label?.trim() || 'Logo',
        label: item.label?.trim() || undefined,
        url: item.url?.trim() || undefined,
        openInNewTab: item.openInNewTab ?? true,
      },
    ]
  })

  if (resolvedLogos.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedSize: RegularBlockSize = size ?? 'default'
  const heightClass = logoHeightClasses[logoHeight ?? 'md']
  const hasHeader = eyebrow?.trim() || title?.trim()

  return (
    <section className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        {hasHeader ? (
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            {eyebrow?.trim() ? (
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {eyebrow.trim()}
              </p>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-2xl font-semibold tracking-tight">{title.trim()}</h2>
            ) : null}
          </div>
        ) : null}

        {displayMode === 'marquee' ? (
          <LogoStripMarquee
            grayscale={grayscale ?? true}
            logoHeightClass={heightClass}
            logos={resolvedLogos}
            showLabels={showLabels ?? false}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {resolvedLogos.map((logo) => {
              const image = (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={64}
                  className={cn(
                    'w-auto object-contain transition-all duration-300',
                    heightClass,
                    grayscale && 'grayscale hover:grayscale-0',
                  )}
                />
              )

              const wrapper = logo.url ? (
                <a
                  href={logo.url}
                  target={logo.openInNewTab ? '_blank' : undefined}
                  rel={logo.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="opacity-70 transition-opacity hover:opacity-100"
                >
                  {image}
                </a>
              ) : (
                <div className="opacity-70 transition-opacity hover:opacity-90">{image}</div>
              )

              return (
                <div key={String(logo.id)} className="flex flex-col items-center gap-1.5">
                  {wrapper}
                  {showLabels && logo.label ? (
                    <span className="text-xs font-medium text-muted-foreground">{logo.label}</span>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
