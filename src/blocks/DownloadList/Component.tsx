import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'
import { DownloadListClient, type ResolvedDownload } from './DownloadListClient'

type DownloadItem = {
  cardBackground?: string | null
  category?: string | null
  description?: string | null
  externalUrl?: string | null
  file?: string | number | Media | null
  fileType?: string | null
  id?: string | null
  title?: string | null
}

type DownloadListBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  displayMode?: 'list' | 'cards' | 'compact' | null
  downloads?: DownloadItem[] | null
  eyebrow?: string | null
  showFilter?: boolean | null
  size?: RegularBlockSize | null
  title?: string | null
}

function detectFileType(item: DownloadItem): string | undefined {
  if (item.fileType?.trim()) return item.fileType.trim().toUpperCase()
  if (isMediaDoc(item.file) && item.file.mimeType) {
    const mime = item.file.mimeType
    if (mime === 'application/pdf') return 'PDF'
    if (mime.includes('spreadsheet') || mime.includes('excel')) return 'XLSX'
    if (mime.includes('csv')) return 'CSV'
    if (mime.startsWith('image/')) return mime.split('/')[1]?.toUpperCase()
    if (mime.includes('word')) return 'DOC'
  }
  return undefined
}

export function DownloadListBlockComponent({
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  displayMode = 'list',
  downloads,
  eyebrow,
  showFilter = false,
  size = 'default',
  title,
}: DownloadListBlockLike) {
  const validDownloads = (downloads ?? []).filter((d) => d.title?.trim())
  if (validDownloads.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'left') === 'center'
  const resolvedActions = resolveCmsActions(actions)

  const resolvedDownloads: ResolvedDownload[] = validDownloads.flatMap((item, index) => {
    const fileUrl = isMediaDoc(item.file) ? getMediaAbsoluteUrl(item.file) : undefined
    const href = fileUrl ?? item.externalUrl?.trim()
    if (!href) return []

    return [
      {
        id: item.id ?? index,
        title: item.title!.trim(),
        description: item.description?.trim() || undefined,
        category: item.category?.trim() || undefined,
        cardBackground: item.cardBackground ?? undefined,
        href,
        isExternal: !fileUrl,
        fileType: detectFileType(item),
      },
    ]
  })

  if (resolvedDownloads.length === 0) return null

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}
    >
      <div className={regularBlockContainerClasses}>
        {eyebrow?.trim() || title?.trim() || description?.trim() || resolvedActions.length > 0 ? (
          <div
            className={cn(
              'mb-12 flex flex-col gap-4',
              isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
            )}
          >
            {eyebrow?.trim() ? (
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                {eyebrow.trim()}
              </p>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {title.trim()}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="text-base leading-7 text-current/70">{description.trim()}</p>
            ) : null}
            {resolvedActions.length > 0 ? (
              <div className="mt-2">
                <ContentActions actions={resolvedActions} />
              </div>
            ) : null}
          </div>
        ) : null}

        <DownloadListClient
          downloads={resolvedDownloads}
          displayMode={displayMode}
          showFilter={showFilter}
        />
      </div>
    </section>
  )
}
