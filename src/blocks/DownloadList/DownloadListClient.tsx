'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileImage, File, ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'
import { resolveCardSurface, type CardSurfaceClasses } from '@/blocks/shared/cardSurface'
import type { BlockBackground } from '@/blocks/shared/blockAppearance'

export type ResolvedDownload = {
  cardBackground?: string
  category?: string
  description?: string
  fileType?: string
  href: string
  id: string | number
  isExternal?: boolean
  title?: string | null
}

type Props = {
  downloads: ResolvedDownload[]
  displayMode?: 'list' | 'cards' | 'compact' | null
  sectionBackground: BlockBackground
  showFilter?: boolean | null
}

const FILE_ICON_MAP: Record<string, typeof File> = {
  PDF: FileText,
  XLS: FileSpreadsheet,
  XLSX: FileSpreadsheet,
  CSV: FileSpreadsheet,
  PNG: FileImage,
  JPG: FileImage,
  JPEG: FileImage,
  SVG: FileImage,
}

function FileTypeIcon({ type }: { type?: string }) {
  const key = type?.toUpperCase() ?? ''
  const Icon = FILE_ICON_MAP[key] ?? FileText
  return <Icon className="size-4 shrink-0" />
}

function FileTypeBadge({ type, surface }: { type?: string; surface?: CardSurfaceClasses }) {
  if (!type) return null
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        surface?.value === 'primary'
          ? 'bg-primary-foreground/15 text-primary-foreground'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {type}
    </span>
  )
}

function ListRow({ dl }: { dl: ResolvedDownload }) {
  return (
    <a
      href={dl.href}
      download={!dl.isExternal}
      target={dl.isExternal ? '_blank' : undefined}
      rel={dl.isExternal ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileTypeIcon type={dl.fileType} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
          {dl.title}
        </span>
        {dl.description ? (
          <span className="truncate text-xs text-muted-foreground">{dl.description}</span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <FileTypeBadge type={dl.fileType} />
        {dl.isExternal ? (
          <ExternalLink className="size-4 text-muted-foreground" />
        ) : (
          <Download className="size-4 text-muted-foreground group-hover:text-primary" />
        )}
      </div>
    </a>
  )
}

function CardItem({
  dl,
  sectionBackground,
}: {
  dl: ResolvedDownload
  sectionBackground: BlockBackground
}) {
  const surface = resolveCardSurface(dl.cardBackground, sectionBackground)
  return (
    <a
      href={dl.href}
      download={!dl.isExternal}
      target={dl.isExternal ? '_blank' : undefined}
      rel={dl.isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border p-5 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        surface.className,
        surface.divider,
      )}
      data-card-background={surface.value}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg bg-current/10',
            surface.icon,
          )}
        >
          <FileTypeIcon type={dl.fileType} />
        </div>
        {dl.isExternal ? (
          <ExternalLink className={cn('size-4', surface.secondary)} />
        ) : (
          <Download className={cn('size-4', surface.secondary)} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className={cn('text-sm font-semibold leading-snug', surface.link)}>{dl.title}</span>
        {dl.description ? (
          <span className={cn('text-xs leading-relaxed', surface.secondary)}>{dl.description}</span>
        ) : null}
      </div>
      {dl.fileType ? (
        <div>
          <FileTypeBadge type={dl.fileType} surface={surface} />
        </div>
      ) : null}
    </a>
  )
}

function CompactRow({ dl }: { dl: ResolvedDownload }) {
  return (
    <a
      href={dl.href}
      download={!dl.isExternal}
      target={dl.isExternal ? '_blank' : undefined}
      rel={dl.isExternal ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-3 border-b border-border py-2.5 last:border-0 hover:text-primary focus-visible:outline-none"
    >
      <FileTypeIcon type={dl.fileType} />
      <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary truncate">
        {dl.title}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <FileTypeBadge type={dl.fileType} />
        {dl.isExternal ? (
          <ExternalLink className="size-3.5 text-muted-foreground" />
        ) : (
          <Download className="size-3.5 text-muted-foreground group-hover:text-primary" />
        )}
      </div>
    </a>
  )
}

export function DownloadListClient({
  downloads,
  displayMode = 'list',
  sectionBackground,
  showFilter = false,
}: Props) {
  const categories = [
    'All',
    ...Array.from(new Set(downloads.map((d) => d.category).filter(Boolean) as string[])),
  ]
  const hasCategories = categories.length > 1
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    hasCategories && activeCategory !== 'All'
      ? downloads.filter((d) => d.category === activeCategory)
      : downloads

  return (
    <div className="flex flex-col gap-6">
      {showFilter && hasCategories ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                activeCategory === cat
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      {displayMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dl) => (
            <CardItem key={dl.id} dl={dl} sectionBackground={sectionBackground} />
          ))}
        </div>
      ) : displayMode === 'compact' ? (
        <div className="rounded-lg border border-border bg-card px-4">
          {filtered.map((dl) => (
            <CompactRow key={dl.id} dl={dl} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((dl) => (
            <ListRow key={dl.id} dl={dl} />
          ))}
        </div>
      )}
    </div>
  )
}
