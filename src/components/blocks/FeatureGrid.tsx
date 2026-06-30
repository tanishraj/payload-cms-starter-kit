import { Fragment } from 'react'
import { BoxesIcon, CheckIcon, HeadphonesIcon, PuzzleIcon, ShieldCheckIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const icons = {
  boxes: BoxesIcon,
  headphones: HeadphonesIcon,
  puzzle: PuzzleIcon,
  'shield-check': ShieldCheckIcon,
}

type FeatureItem = {
  description?: string | null
  icon?: keyof typeof icons | null
  features?:
    | {
        text?: string | null
      }[]
    | null
  title: string
}

export type FeatureGridBlockViewProps = {
  className?: string
  description?: string | null
  eyebrow?: string | null
  items?: FeatureItem[] | null
  title: string
}

export function FeatureGridBlockView({
  className,
  description,
  eyebrow,
  items,
  title,
}: FeatureGridBlockViewProps) {
  if (!items?.length) {
    return null
  }

  return (
    <section className={cn('py-32', className)}>
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
          {eyebrow ? (
            <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl md:text-5xl">{title}</h2>
          {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
        </div>
        <div className="mx-auto grid max-w-5xl gap-9 md:grid-cols-2">
          {items.map((item, index) => {
            const Icon = icons[item.icon ?? 'boxes']
            const features = item.features?.filter((feature) => feature.text?.trim())

            return (
              <div
                className="flex flex-col gap-8 rounded-xl bg-muted p-9"
                key={`${item.title}-${index}`}
              >
                <div className="flex flex-col gap-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary">
                    <Icon className="size-5 text-background" />
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                  </div>
                </div>
                {features?.length ? (
                  <ul className="flex flex-col gap-3.5">
                    {features.map((feature, featureIndex) => (
                      <Fragment key={`${item.title}-${featureIndex}`}>
                        <Separator />
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckIcon className="size-4 shrink-0 text-primary" />
                          {feature.text}
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
