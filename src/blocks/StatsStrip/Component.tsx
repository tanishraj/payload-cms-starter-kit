import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
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
  appearance?: BlockAppearance | null
  items?: StatsStripItem[] | null
  triggerOnce?: boolean | null
}

const chunkItems = (items: ValidStatsStripItem[]) => {
  const rows: ValidStatsStripItem[][] = []

  for (let index = 0; index < items.length; index += 4) {
    rows.push(items.slice(index, index + 4))
  }

  return rows
}

type RowSize = 1 | 2 | 3 | 4

const rowGridClasses = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
} satisfies Record<RowSize, string>

export function StatsStripBlockComponent({
  animationDuration = 1200,
  animationEnabled = true,
  appearance,
  items,
  triggerOnce = true,
}: StatsStripBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
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

  const rows = chunkItems(validItems)
  const hasMultipleRows = rows.length > 1

  return (
    <section
      className={appearanceClasses.className}
      data-stats-strip-background={appearance?.background ?? 'none'}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4">
        {rows.map((row, rowIndex) => (
          <div key={`stats-strip-row-group-${rowIndex}`}>
            {rowIndex > 0 ? (
              <div
                className="w-full border-t border-border"
                data-stats-strip-row-divider="true"
              />
            ) : null}
            <div
              className={cn('grid grid-cols-2', rowGridClasses[row.length as RowSize])}
              data-stats-strip-row={rowIndex}
              data-stats-strip-row-size={row.length}
              data-stats-strip-rows={rows.length}
            >
              {row.map((item, itemIndex) => {
                const isOddLastMobileItem = row.length % 2 === 1 && itemIndex === row.length - 1
                const hasMobileRightDivider =
                  !isOddLastMobileItem && itemIndex % 2 === 0 && itemIndex + 1 < row.length
                const hasDesktopRightDivider = itemIndex < row.length - 1

                return (
                  <article
                    className={cn(
                      'flex min-h-32 flex-col justify-center gap-3 px-5 py-7 text-left md:min-h-40 md:px-8 md:py-9',
                      hasMobileRightDivider && 'border-r border-border/60',
                      hasDesktopRightDivider && 'md:border-r md:border-border/60',
                      hasMultipleRows && rowIndex < rows.length - 1 && 'md:border-b-0',
                      isOddLastMobileItem && 'col-span-2 md:col-span-1',
                    )}
                    key={`${item.label}-${rowIndex}-${itemIndex}`}
                  >
                    <p className="font-serif text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
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
                    <p className="max-w-[18ch] font-mono text-[0.7rem] leading-[1.55] uppercase tracking-[0.18em] opacity-70 sm:text-xs">
                      {item.label}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
