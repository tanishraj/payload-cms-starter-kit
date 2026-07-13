import { cn } from '@/lib/utils'

import { AnimatedMetricValue } from './AnimatedMetricValue'

export type StatsStripItem = {
  label?: string | null
  prefix?: string | null
  suffix?: string | null
  value?: number | null
}

type ValidStatsStripItem = StatsStripItem & {
  label: string
  value: number
}

export type StatsStripBlockLike = {
  animationDuration?: number | null
  animationEnabled?: boolean | null
  backgroundStyle?: 'accent' | 'default' | 'muted' | null
  items?: StatsStripItem[] | null
  triggerOnce?: boolean | null
}

const backgroundClasses = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted text-foreground',
  accent: 'bg-accent text-accent-foreground',
} as const

const chunkItems = (items: ValidStatsStripItem[]) => {
  const rows: ValidStatsStripItem[][] = []

  for (let index = 0; index < items.length; index += 4) {
    rows.push(items.slice(index, index + 4))
  }

  return rows
}

const rowGridClasses = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
} as const

export function StatsStripBlockComponent({
  animationDuration = 1200,
  animationEnabled = true,
  backgroundStyle = 'default',
  items,
  triggerOnce = true,
}: StatsStripBlockLike) {
  const validItems = (items ?? []).flatMap((item) => {
    const label = item?.label?.trim()

    if (!label || typeof item?.value !== 'number' || Number.isNaN(item.value)) {
      return []
    }

    return [
      {
        ...item,
        label,
        value: item.value,
      },
    ]
  })

  if (!validItems.length) {
    return null
  }

  const resolvedBackgroundStyle = backgroundStyle ?? 'default'
  const rows = chunkItems(validItems)

  return (
    <section
      className={cn('border-b border-border', backgroundClasses[resolvedBackgroundStyle])}
      data-stats-strip-background={resolvedBackgroundStyle}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4">
        {rows.map((row, rowIndex) => (
          <div
            className={cn('grid grid-cols-2', rowGridClasses[row.length])}
            data-stats-strip-row={rowIndex}
            data-stats-strip-row-size={row.length}
            key={`stats-strip-row-${rowIndex}`}
          >
            {row.map((item, itemIndex) => {
              const isOddLastMobileItem = row.length % 2 === 1 && itemIndex === row.length - 1

              return (
                <article
                  className={cn(
                    'flex min-h-40 flex-col justify-center gap-3 px-6 py-8',
                    'border-b border-border md:border-b-0',
                    itemIndex < row.length - 1 && 'md:border-r',
                    isOddLastMobileItem && 'col-span-2 md:col-span-1',
                  )}
                  key={`${item.label}-${rowIndex}-${itemIndex}`}
                >
                  <p className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                    {animationEnabled ? (
                      <AnimatedMetricValue
                        durationMs={animationDuration}
                        prefix={item.prefix}
                        suffix={item.suffix}
                        triggerOnce={triggerOnce}
                        value={item.value}
                      />
                    ) : (
                      `${item.prefix ?? ''}${item.value}${item.suffix ?? ''}`
                    )}
                  </p>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] opacity-70">
                    {item.label}
                  </p>
                </article>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
