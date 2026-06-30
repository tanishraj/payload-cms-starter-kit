import { Blocks, Layers3, ShieldCheck, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const icons = {
  blocks: Blocks,
  layers: Layers3,
  sparkles: Sparkles,
  'shield-check': ShieldCheck,
}

type FeatureItem = {
  description?: string | null
  icon?: keyof typeof icons | null
  title: string
}

export type FeatureGridBlockViewProps = {
  description?: string | null
  eyebrow?: string | null
  items?: FeatureItem[] | null
  title: string
}

export function FeatureGridBlockView({
  description,
  eyebrow,
  items,
  title,
}: FeatureGridBlockViewProps) {
  if (!items?.length) {
    return null
  }

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="max-w-2xl space-y-4">
          {eyebrow ? <Badge variant="muted">{eyebrow}</Badge> : null}
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2>
          {description ? <p className="text-lg leading-8 text-muted-foreground">{description}</p> : null}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = icons[item.icon ?? 'sparkles']

            return (
              <Card className="h-full" key={`${item.title}-${index}`}>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                {item.description ? (
                  <CardContent>
                    <CardDescription className="text-sm leading-7">{item.description}</CardDescription>
                  </CardContent>
                ) : null}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
