'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

export type ResolvedLogo = {
  id: string | number
  src: string
  alt: string
  label?: string
  url?: string
  openInNewTab?: boolean
}

type LogoItemProps = {
  duplicate?: boolean
  grayscale: boolean
  logo: ResolvedLogo
  logoHeightClass: string
  showLabels: boolean
}

function LogoItem({ duplicate = false, grayscale, logo, logoHeightClass, showLabels }: LogoItemProps) {
  const image = (
    <Image
      src={logo.src}
      alt={duplicate ? '' : logo.alt}
      width={120}
      height={64}
      className={cn(
        'w-auto object-contain transition-all duration-300',
        logoHeightClass,
        grayscale && 'grayscale hover:grayscale-0',
      )}
    />
  )

  const content = (
    <div className="flex flex-col items-center gap-1.5">
      {logo.url ? (
        <a
          href={logo.url}
          target={logo.openInNewTab ? '_blank' : undefined}
          rel={logo.openInNewTab ? 'noopener noreferrer' : undefined}
          tabIndex={duplicate ? -1 : undefined}
          aria-hidden={duplicate || undefined}
          className="flex items-center opacity-70 transition-opacity hover:opacity-100"
        >
          {image}
        </a>
      ) : (
        <div className="flex items-center opacity-70 transition-opacity hover:opacity-90">
          {image}
        </div>
      )}
      {showLabels && logo.label ? (
        <span aria-hidden={duplicate || undefined} className="text-xs font-medium text-muted-foreground">
          {logo.label}
        </span>
      ) : null}
    </div>
  )

  return content
}

type LogoStripMarqueeProps = {
  grayscale: boolean
  logoHeightClass: string
  logos: ResolvedLogo[]
  showLabels: boolean
}

export function LogoStripMarquee({ grayscale, logoHeightClass, logos, showLabels }: LogoStripMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false)

  const track = (duplicate: boolean) => (
    <div
      aria-hidden={duplicate || undefined}
      className="flex shrink-0 animate-marquee items-center gap-10 pr-10"
      style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
    >
      {logos.map((logo) => (
        <LogoItem
          key={`${duplicate ? 'dup' : 'pri'}-${logo.id}`}
          duplicate={duplicate}
          grayscale={grayscale}
          logo={logo}
          logoHeightClass={logoHeightClass}
          showLabels={showLabels}
        />
      ))}
    </div>
  )

  return (
    <div
      className="flex w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex w-max min-w-full items-center">
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
