import { AlertTriangle, ArrowRight, Clock3, LucideIcon, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionLink = {
  label?: string | null
  openInNewTab?: boolean | null
  url?: string | null
}

type SystemPageKind = '404' | 'comingSoon' | 'maintenance'

export type SystemPageHeroProps = {
  badge?: string | null
  description?: string | null
  heading: string
  image?: {
    alt: string
    src: string
  }
  kind: SystemPageKind
  primaryAction?: ActionLink | null
  secondaryAction?: ActionLink | null
  supportingNote?: string | null
}

const kindStyles: Record<
  SystemPageKind,
  {
    icon: LucideIcon
    iconClassName: string
    panelClassName: string
  }
> = {
  '404': {
    icon: AlertTriangle,
    iconClassName: 'text-amber-600 dark:text-amber-400',
    panelClassName: 'border-amber-500/20 bg-amber-500/5',
  },
  comingSoon: {
    icon: Clock3,
    iconClassName: 'text-sky-600 dark:text-sky-400',
    panelClassName: 'border-sky-500/20 bg-sky-500/5',
  },
  maintenance: {
    icon: Wrench,
    iconClassName: 'text-orange-600 dark:text-orange-400',
    panelClassName: 'border-orange-500/20 bg-orange-500/5',
  },
}

function ActionButton({
  action,
  variant,
}: {
  action?: ActionLink | null
  variant: 'default' | 'outline'
}) {
  if (!action?.label || !action.url) {
    return null
  }

  const isExternal = /^https?:\/\//.test(action.url)
  const openInNewTab = action.openInNewTab || isExternal

  return (
    <Button
      asChild
      size="lg"
      variant={variant}
    >
      <a
        href={action.url}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noreferrer noopener' : undefined}
      >
        {action.label}
        {variant === 'default' && <ArrowRight className="size-4" />}
      </a>
    </Button>
  )
}

export function SystemPageHero({
  badge,
  description,
  heading,
  image,
  kind,
  primaryAction,
  secondaryAction,
  supportingNote,
}: SystemPageHeroProps) {
  const style = kindStyles[kind]
  const Icon = style.icon

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container">
        <div
          className={cn(
            'mx-auto grid max-w-6xl gap-10 overflow-hidden rounded-xl border p-8 md:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] md:p-12',
            style.panelClassName,
          )}
        >
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-border/70 bg-background/80">
                <Icon className={cn('size-6', style.iconClassName)} />
              </div>
              {badge ? (
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-[11px] uppercase"
                >
                  {badge}
                </Badge>
              ) : null}
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold text-foreground md:text-5xl">
              {heading}
            </h1>
            {description ? (
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                {description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton
                action={primaryAction}
                variant="default"
              />
              <ActionButton
                action={secondaryAction}
                variant="outline"
              />
            </div>
            {supportingNote ? (
              <p className="mt-6 text-sm text-muted-foreground">{supportingNote}</p>
            ) : null}
          </div>
          <div className="flex min-h-72 items-center justify-center">
            {image ? (
              <div className="w-full overflow-hidden rounded-xl border bg-background/90 shadow-sm">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full max-h-[420px] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-72 w-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/80">
                <Icon className={cn('size-14', style.iconClassName)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
