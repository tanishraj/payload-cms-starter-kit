import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'
import { DownloadListClient, type ResolvedDownload } from './DownloadListClient'

type DownloadItem = {
  category?: string | null
  description?: string | null
  externalUrl?: string | null
  file?: string | number | Media | null
  fileType?: string | null
  id?: string | null
  title?: string | null
}

type DownloadListBlockLike = {
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

  const resolvedDownloads: ResolvedDownload[] = validDownloads.flatMap((item, index) => {
    const fileUrl = isMediaDoc(item.file) ? getMediaAbsoluteUrl(item.file) : undefined
    const href = fileUrl ?? item.externalUrl?.trim()
    if (!href) return []

    return [{
      id: item.id ?? index,
      title: item.title!.trim(),
      description: item.description?.trim() || undefined,
      category: item.category?.trim() || undefined,
      href,
      isExternal: !fileUrl,
      fileType: detectFileType(item),
    }]
  })

  if (resolvedDownloads.length === 0) return null

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {(eyebrow?.trim() || title?.trim() || description?.trim()) ? (
          <div
            className={cn(
              'mb-10 flex flex-col gap-3',
              isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
            )}
          >
            {eyebrow?.trim() ? (
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {eyebrow.trim()}
              </p>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                {title.trim()}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="text-lg text-muted-foreground">{description.trim()}</p>
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
