import Link from 'next/link'
import { CheckCircle2, Globe, Lock, Star, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type HeroBlockViewProps = {
  className?: string
  description?: string | null
  eyebrow?: string | null
  primaryActionHref?: string | null
  primaryActionLabel?: string | null
  secondaryActionHref?: string | null
  secondaryActionLabel?: string | null
  title: string
}

export function HeroBlockView({
  className,
  description,
  eyebrow,
  primaryActionHref,
  primaryActionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  title,
}: HeroBlockViewProps) {
  return (
    <section className={cn('relative overflow-hidden py-32', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-[600px] max-h-[600px] w-full opacity-10"
        style={{
          backgroundImage:
            "url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/grid3.svg')",
          backgroundRepeat: 'repeat',
          maskImage: 'radial-gradient(ellipse 80% 100% at 50% 30%, #000 40%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 100% at 50% 30%, #000 40%, transparent 75%)',
        }}
      />
      <div className="relative z-10 container px-4 sm:px-6 lg:px-8">
        {eyebrow ? (
          <p className="mb-6 text-center text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="relative mx-auto mb-8 max-w-4xl flex-wrap text-center text-4xl font-semibold text-balance md:mb-10 md:text-6xl md:leading-snug">
          <span>
            {title}
            <Globe className="mx-2 mb-1 inline-block h-auto w-8 md:mx-4 md:mb-3 md:w-14" />
          </span>
          <div className="absolute -top-10 -left-20 hidden w-fit -rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground underline-offset-3 lg:flex">
            <Zap className="h-auto w-3" />
            Fast
          </div>
          <div className="absolute top-14 -left-24 hidden w-fit -rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground underline-offset-3 lg:flex">
            <Lock className="h-auto w-3" />
            Secure
          </div>
          <div className="absolute -top-10 -right-24 hidden w-fit rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground underline-offset-3 lg:flex">
            Professional
            <Star className="h-auto w-3" />
          </div>
          <div className="absolute top-14 -right-28 hidden w-fit rotate-12 gap-1 border-b border-dashed border-muted-foreground text-sm font-normal text-muted-foreground underline-offset-3 lg:flex">
            Optimized
            <CheckCircle2 className="h-auto w-3" />
          </div>
        </h1>
        {description ? (
          <p className="mx-auto mb-10 max-w-3xl text-center font-medium text-muted-foreground md:text-xl">
            {description}
          </p>
        ) : null}
        <div className="flex flex-col items-center justify-center gap-3 pt-3 pb-12">
          {primaryActionHref && primaryActionLabel ? (
            <Button asChild size="lg">
              <Link href={primaryActionHref}>{primaryActionLabel}</Link>
            </Button>
          ) : null}
          {secondaryActionHref && secondaryActionLabel ? (
            <Button asChild size="lg" variant="link">
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
