import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'
import { cn } from '@/lib/utils'

export type Contact24Size = 'comfortable' | 'compact' | 'default'
export type Contact24Alignment = 'center' | 'left' | 'right'

export type Contact24Props = {
  appearance?: BlockAppearance | null
  className?: string
  contentAlignment?: Contact24Alignment
  description?: string | null
  eyebrow?: string | null
  offices: SiteOfficeLocation[]
  size?: Contact24Size
  title: string
}

const headerGapClasses = {
  compact: 'gap-3',
  default: 'gap-4',
  comfortable: 'gap-5',
} as const

const sectionGapClasses = {
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const

const gridGapClasses = {
  compact: 'gap-4',
  default: 'gap-6',
  comfortable: 'gap-8',
} as const

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

export function Contact24({
  appearance,
  className,
  contentAlignment = 'left',
  description,
  eyebrow,
  offices,
  size = 'default',
  title,
}: Contact24Props) {
  const resolvedTitle = title.trim()
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  if (!resolvedTitle || offices.length === 0) {
    return null
  }

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[size],
        appearanceClasses.className,
        className,
      )}
      data-contact24-background={appearance?.background ?? 'none'}
      data-contact24-size={size}
    >
      <div className={regularBlockContainerClasses}>
        <div className={cn('flex flex-col', sectionGapClasses[size])}>
          <header
            className={cn(
              'flex max-w-3xl flex-col',
              headerGapClasses[size],
              alignmentClasses[contentAlignment],
              contentAlignment === 'center' && 'mx-auto',
              contentAlignment === 'right' && 'ml-auto',
            )}
            data-contact24-content-alignment={contentAlignment}
          >
            {eyebrow ? (
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {resolvedTitle}
            </h2>
            {description ? (
              <p className="text-base leading-7 text-current/70">{description}</p>
            ) : null}
          </header>

          <div className={cn('grid grid-cols-1 md:grid-cols-2', gridGapClasses[size])}>
            {offices.map((office) => (
              <Card className="gap-0 py-0" key={office.id}>
                <div className="relative aspect-video overflow-hidden">
                  <iframe
                    allowFullScreen
                    className="size-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={office.mapEmbedUrl}
                    title={office.mapTitle}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent"
                  />
                  <CardHeader className="pointer-events-none absolute inset-x-0 bottom-0">
                    <CardDescription className="font-mono text-xs font-semibold uppercase tracking-[0.18em]">
                      {office.region}
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                      {office.city}
                    </CardTitle>
                  </CardHeader>
                </div>

                <CardContent className="flex flex-1 flex-col pt-(--card-spacing)">
                  <address className="flex flex-col gap-3 not-italic">
                    <div className="flex items-start gap-3">
                      <MapPin
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span>{office.address}</span>
                    </div>
                    <a className="flex items-center gap-3 hover:underline" href={office.phoneHref}>
                      <Phone
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                      {office.phone}
                    </a>
                    <a
                      className="flex items-center gap-3 hover:underline"
                      href={`mailto:${office.email}`}
                    >
                      <Mail
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                      {office.email}
                    </a>
                  </address>
                </CardContent>

                <CardFooter className="pb-(--card-spacing)">
                  <Button asChild className="w-full" variant="outline">
                    <a href={office.mapUrl} rel="noreferrer" target="_blank">
                      View on Map
                      <ExternalLink data-icon="inline-end" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
