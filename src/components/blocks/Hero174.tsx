import { ArrowDown } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Hero174Props {
  backgroundImageUrl?: string | null
  className?: string
  ctaHref?: string | null
  ctaLabel?: string | null
  description?: string | null
  locationLabel?: string | null
  locationValue?: string | null
  title?: string | null
}

const defaultBackgroundImage =
  'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/full-width-backgrounds/andrew-kliatskyi-MaVm_A0xhKk-unsplash.jpg'

export function Hero174({
  backgroundImageUrl,
  className,
  ctaHref,
  ctaLabel,
  description,
  locationLabel,
  locationValue,
  title,
}: Hero174Props) {
  const imageUrl = backgroundImageUrl || defaultBackgroundImage

  return (
    <section
      className={cn(
        `dark relative h-svh min-h-[600px] w-full bg-cover bg-center bg-no-repeat after:absolute after:inset-0 after:block after:size-full after:bg-zinc-950/50 after:content-[''] sm:max-h-[1400px]`,
        className,
      )}
      style={{ backgroundImage: `url('${imageUrl}')` }}
    >
      <div className="relative z-10 mx-auto flex size-full max-w-[125rem] px-4 py-9">
        <div className="flex w-full flex-col justify-between gap-10">
          <div className="mx-auto flex max-w-[31.25rem] flex-1 flex-col items-center justify-center gap-7 sm:max-w-[37.5rem] md:max-w-[50rem]">
            <h1 className="text-center text-4xl leading-tight font-medium text-foreground sm:text-5xl md:text-6xl">
              {title || 'Transform Your Vision Into Digital Reality'}
            </h1>
            <p className="text-center text-lg text-balance text-foreground md:text-2xl">
              {description ||
                'We craft exceptional digital solutions that help brands stand out and make a lasting impact in the digital landscape.'}
            </p>
            {ctaHref && ctaLabel ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  className="block h-fit w-fit rounded-sm px-6 py-3.5 text-sm font-semibold tracking-wider text-nowrap uppercase"
                >
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-black/20 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary" />
              <div className="text-sm font-medium text-muted-foreground">
                <p className="text-primary">{locationLabel || 'Global Headquarters'}</p>
                <p>{locationValue || 'San Francisco, California'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="flex rounded-full border-2 border-primary transition-colors hover:bg-primary/20"
            >
              <ArrowDown className="m-auto !size-5 stroke-primary" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
