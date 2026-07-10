import { ArrowRight, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { resolveCmsLink, type CmsLinkValue } from '@/lib/cmsLinks'

type SystemPageAction = {
  label?: string | null
} & CmsLinkValue

type SystemPageActionLink = {
  label: string
  openInNewTab?: boolean | null
  url: string
}

type SystemScreenProps = {
  badge?: string | null
  className?: string
  description?: string | null
  heading: string
  primaryAction?: SystemPageActionLink | null
  secondaryAction?: SystemPageActionLink | null
  statusDisplay?: string | null
  supportingNote?: string | null
}

export const resolveSystemPageAction = (
  value: SystemPageAction | null | undefined,
): SystemPageActionLink | null => {
  if (!value?.label) {
    return null
  }

  const resolved = resolveCmsLink(value)

  if (!resolved.href) {
    return null
  }

  return {
    label: value.label,
    openInNewTab: resolved.openInNewTab ?? null,
    url: resolved.href,
  }
}

function ActionButton({
  action,
  variant,
}: {
  action?: SystemPageActionLink | null
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
        {variant === 'default' ? <ArrowRight data-icon="inline-end" /> : null}
        {variant === 'outline' && openInNewTab ? <ExternalLink data-icon="inline-end" /> : null}
      </a>
    </Button>
  )
}

function ActionRow({
  primaryAction,
  secondaryAction,
}: {
  primaryAction?: SystemPageActionLink | null
  secondaryAction?: SystemPageActionLink | null
}) {
  const hasPrimary = Boolean(primaryAction?.label && primaryAction.url)
  const hasSecondary = Boolean(secondaryAction?.label && secondaryAction.url)

  if (!hasPrimary && !hasSecondary) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ActionButton
        action={primaryAction}
        variant="default"
      />
      <ActionButton
        action={secondaryAction}
        variant="outline"
      />
    </div>
  )
}

export function SystemPageHero({
  badge,
  className,
  description,
  heading,
  primaryAction,
  secondaryAction,
  statusDisplay,
  supportingNote,
}: SystemScreenProps) {
  return (
    <section
      data-system-page-root="true"
      className={[
        'flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center md:px-10',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        {statusDisplay ? (
          <div className="text-7xl font-semibold tracking-tight text-foreground/20 md:text-9xl">
            {statusDisplay}
          </div>
        ) : badge ? (
          <Badge variant="outline">{badge}</Badge>
        ) : null}
        <div className="flex flex-col items-center gap-4">
          <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            {heading}
          </h1>
          {description ? (
            <p className="max-w-xl text-balance text-base leading-7 text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        <ActionRow
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />
        {supportingNote ? (
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">{supportingNote}</p>
        ) : null}
      </div>
    </section>
  )
}
