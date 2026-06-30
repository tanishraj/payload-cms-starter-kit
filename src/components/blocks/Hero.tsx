import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type HeroBlockViewProps = {
  description?: string | null
  eyebrow?: string | null
  primaryActionHref?: string | null
  primaryActionLabel?: string | null
  secondaryActionHref?: string | null
  secondaryActionLabel?: string | null
  title: string
}

export function HeroBlockView({
  description,
  eyebrow,
  primaryActionHref,
  primaryActionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  title,
}: HeroBlockViewProps) {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(234,88,12,0.18),_transparent_55%)]" />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-8">
            {eyebrow ? <Badge>{eyebrow}</Badge> : null}
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
                {title}
              </h1>
              {description ? (
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">{description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {primaryActionHref && primaryActionLabel ? (
                <Button asChild size="lg">
                  <Link href={primaryActionHref}>
                    {primaryActionLabel}
                    <ArrowRight />
                  </Link>
                </Button>
              ) : null}
              {secondaryActionHref && secondaryActionLabel ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-background via-secondary/40 to-accent/50 p-8 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.55)]">
            <div className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Pro block ready
              </p>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-border/60 bg-background/90 p-5">
                  <p className="text-sm text-muted-foreground">Drop future shadcnblocks sections into</p>
                  <code className="mt-2 block font-mono text-sm text-foreground">
                    src/components/blocks/&lt;BlockName&gt;.tsx
                  </code>
                </div>
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                  <p className="text-sm text-muted-foreground">Map each Payload block schema in</p>
                  <code className="mt-2 block font-mono text-sm text-foreground">src/blocks/RenderBlocks.tsx</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
