'use client'

import { useState } from 'react'

import type { BlockBackground } from '@/blocks/shared/blockAppearance'
import { cn } from '@/lib/utils'

import { DownloadListPresentation, normalizeGridColumns } from './Presentation'
import type {
  DownloadDisplayMode,
  DownloadDocumentIconSize,
  DownloadGridActionDisplay,
  DownloadGridColumns,
  DownloadGridIconPosition,
  ResolvedDownload,
} from './types'

type Props = {
  columns?: DownloadGridColumns | null
  displayMode?: DownloadDisplayMode | null
  documentIconSize?: DownloadDocumentIconSize | null
  downloads: ResolvedDownload[]
  gridActionDisplay?: DownloadGridActionDisplay | null
  gridIconPosition?: DownloadGridIconPosition | null
  sectionBackground: BlockBackground
  showDocumentIcon?: boolean | null
  showFilter?: boolean | null
}

const displayModes = new Set<DownloadDisplayMode>(['cards', 'framedGrid', 'list', 'openGrid'])

export function DownloadListClient({
  columns = '3',
  displayMode = 'list',
  documentIconSize = 'medium',
  downloads,
  gridActionDisplay = 'labelled',
  gridIconPosition = 'above',
  sectionBackground,
  showDocumentIcon = true,
  showFilter = false,
}: Props) {
  const categories = [
    'All',
    ...Array.from(
      new Set(downloads.map((download) => download.category).filter(Boolean) as string[]),
    ),
  ]
  const hasCategories = categories.length > 1
  const [activeCategory, setActiveCategory] = useState('All')
  const filtered =
    hasCategories && activeCategory !== 'All'
      ? downloads.filter((download) => download.category === activeCategory)
      : downloads
  const resolvedDisplayMode = displayMode && displayModes.has(displayMode) ? displayMode : 'list'

  return (
    <div className="flex flex-col gap-6">
      {showFilter && hasCategories ? (
        <div className="flex flex-wrap gap-2" data-download-filters="true">
          {categories.map((category) => {
            const selected = activeCategory === category
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-current/20 bg-transparent text-current/70 hover:border-primary/50 hover:text-current',
                )}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            )
          })}
        </div>
      ) : null}
      <DownloadListPresentation
        columns={normalizeGridColumns(columns)}
        displayMode={resolvedDisplayMode}
        documentIconSize={documentIconSize ?? 'medium'}
        downloads={filtered}
        gridActionDisplay={gridActionDisplay === 'icons' ? 'icons' : 'labelled'}
        gridIconPosition={gridIconPosition === 'inline' ? 'inline' : 'above'}
        sectionBackground={sectionBackground}
        showDocumentIcon={showDocumentIcon ?? true}
      />
    </div>
  )
}
