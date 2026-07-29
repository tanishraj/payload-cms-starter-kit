import { Award, Medal, Star, TrendingUp, Trophy } from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'

type AwardCategory = 'accreditation' | 'ranking' | 'award' | 'recognition' | 'milestone'

type AwardItem = {
  title?: string | null
  organization?: string | null
  category?: AwardCategory | null
  year?: string | null
  description?: string | null
}

type AwardsListBlockLike = {
  appearance?: BlockAppearance | null
  awards?: AwardItem[] | null
  description?: string | null
  eyebrow?: string | null
  heading?: string | null
  size?: RegularBlockSize | null
  variant?: 'cards' | 'table' | 'rows' | null
}

const categoryConfig: Record<AwardCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  accreditation: { label: 'Accreditation', icon: Medal, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950' },
  ranking: { label: 'Ranking', icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' },
  award: { label: 'Award', icon: Trophy, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950' },
  recognition: { label: 'Recognition', icon: Star, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950' },
  milestone: { label: 'Milestone', icon: Award, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950' },
}

function CategoryBadge({ category }: { category?: AwardCategory | null }) {
  const cat = category ?? 'recognition'
  const { label, icon: Icon, color } = categoryConfig[cat]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>
      <Icon className="size-3" />
      {label}
    </span>
  )
}

export function AwardsListBlockComponent({
  appearance,
  awards,
  description,
  eyebrow,
  heading,
  size = 'default',
  variant = 'cards',
}: AwardsListBlockLike) {
  const items = (awards ?? []).filter((a) => a.title?.trim())
  if (!items.length) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {/* Header */}
        {(eyebrow?.trim() || heading?.trim() || description?.trim()) ? (
          <div className="mb-10 flex flex-col gap-3">
            {eyebrow?.trim() ? (
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {eyebrow.trim()}
              </p>
            ) : null}
            {heading?.trim() ? (
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {heading.trim()}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="max-w-2xl text-muted-foreground">{description.trim()}</p>
            ) : null}
          </div>
        ) : null}

        {/* Cards variant */}
        {(variant === 'cards' || !variant) ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const cat = (item.category ?? 'recognition') as AwardCategory
              const { icon: Icon, color } = categoryConfig[cat]
              return (
                <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', color)}>
                      <Icon className="size-5" />
                    </div>
                    {item.year?.trim() ? (
                      <span className="text-xs font-medium text-muted-foreground">{item.year.trim()}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold leading-tight text-foreground">{item.title?.trim()}</h3>
                    {item.organization?.trim() ? (
                      <p className="text-sm text-muted-foreground">{item.organization.trim()}</p>
                    ) : null}
                    {item.description?.trim() ? (
                      <p className="mt-1 text-sm text-muted-foreground/80">{item.description.trim()}</p>
                    ) : null}
                  </div>
                  <CategoryBadge category={item.category} />
                </div>
              )
            })}
          </div>
        ) : null}

        {/* Table variant */}
        {variant === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Award / Accreditation</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-foreground sm:table-cell">Organization</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                  <th className="hidden px-4 py-3 text-right font-semibold text-foreground md:table-cell">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.title?.trim()}</p>
                      {item.description?.trim() ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description.trim()}</p>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {item.organization?.trim() ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="hidden px-4 py-3 text-right text-muted-foreground md:table-cell">
                      {item.year?.trim() ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Rows variant */}
        {variant === 'rows' ? (
          <div className="flex flex-col divide-y divide-border">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                  <p className="font-semibold text-foreground sm:flex-1">{item.title?.trim()}</p>
                  {item.organization?.trim() ? (
                    <p className="text-sm text-muted-foreground sm:w-40 sm:shrink-0">{item.organization.trim()}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <CategoryBadge category={item.category} />
                  {item.year?.trim() ? (
                    <span className="text-xs text-muted-foreground">{item.year.trim()}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
