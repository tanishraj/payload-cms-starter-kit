import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'
import { DownloadListClient } from './DownloadListClient'
import { resolveDocumentActions, type DownloadManualActionInput } from './resolveActions'
import type {
  DownloadDisplayMode,
  DownloadDocumentIconSize,
  DownloadGridActionDisplay,
  DownloadGridColumns,
  DownloadGridIconPosition,
  ResolvedDownload,
} from './types'

type DownloadItem = {
  actions?: DownloadManualActionInput[] | null
  cardBackground?: string | null
  description?: string | null
  externalUrl?: string | null
  file?: string | number | Media | null
  fileType?: string | null
  id?: string | null
  title?: string | null
}

type DownloadListBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  columns?: DownloadGridColumns | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  documentIconSize?: DownloadDocumentIconSize | null
  displayMode?: DownloadDisplayMode | null
  downloads?: DownloadItem[] | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  gridActionDisplay?: DownloadGridActionDisplay | null
  gridIconPosition?: DownloadGridIconPosition | null
  openViewInNewTab?: boolean | null
  showDownloadAction?: boolean | null
  showDocumentIcon?: boolean | null
  showViewAction?: boolean | null
  size?: RegularBlockSize | null
  title?: string | null
}

const fileTypeByMime: Record<string, string> = {
  'application/msword': 'DOC',
  'application/pdf': 'PDF',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/x-zip-compressed': 'ZIP',
  'application/zip': 'ZIP',
  'text/csv': 'CSV',
}

function detectFileType(item: DownloadItem): string | undefined {
  if (item.fileType?.trim()) return item.fileType.trim().toUpperCase()
  if (isMediaDoc(item.file) && item.file.mimeType) {
    const mime = item.file.mimeType.toLowerCase()
    if (fileTypeByMime[mime]) return fileTypeByMime[mime]
    if (mime.startsWith('image/')) return mime.split('/')[1]?.toUpperCase()
  }
  return undefined
}

export function DownloadListBlockComponent({
  accentTitle,
  actions,
  appearance,
  columns = '3',
  contentAlignment = 'left',
  description,
  documentIconSize = 'medium',
  displayMode = 'list',
  downloads,
  eyebrow,
  footerActions,
  gridActionDisplay = 'labelled',
  gridIconPosition = 'above',
  openViewInNewTab = true,
  showDownloadAction = true,
  showDocumentIcon = true,
  showViewAction = false,
  size = 'default',
  title,
}: DownloadListBlockLike) {
  const validDownloads = (downloads ?? []).filter((d) => d.title?.trim())
  if (validDownloads.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'left') === 'center'
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAccentTitle = accentTitle?.trim() || undefined

  const resolvedDownloads: ResolvedDownload[] = validDownloads.flatMap((item, index) => {
    const fileUrl = isMediaDoc(item.file) ? getMediaAbsoluteUrl(item.file) : undefined
    const externalViewUrl = item.externalUrl?.trim() || undefined
    const viewHref = externalViewUrl ?? fileUrl
    const downloadHref = fileUrl
    const documentActions = resolveDocumentActions(item.actions, {
      downloadHref,
      openViewInNewTab: openViewInNewTab ?? true,
      showDownload: showDownloadAction ?? true,
      showView: showViewAction ?? false,
      viewHref,
    })
    if (documentActions.length === 0) return []

    return [
      {
        actions: documentActions,
        id: item.id ?? index,
        title: item.title!.trim(),
        description: item.description?.trim() || undefined,
        cardBackground: item.cardBackground ?? undefined,
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
              <SectionEyebrow surface={appearance?.background ?? 'none'}>
                {eyebrow.trim()}
              </SectionEyebrow>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {resolvedAccentTitle ? (
                  <>
                    <span className="block font-[inherit]">{title.trim()}</span>
                    <em className="block font-[inherit]">{resolvedAccentTitle}</em>
                  </>
                ) : (
                  title.trim()
                )}
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
          columns={columns ?? '3'}
          documentIconSize={documentIconSize ?? 'medium'}
          downloads={resolvedDownloads}
          displayMode={displayMode}
          gridActionDisplay={gridActionDisplay ?? 'labelled'}
          gridIconPosition={gridIconPosition ?? 'above'}
          sectionBackground={appearance?.background ?? 'none'}
          showDocumentIcon={showDocumentIcon ?? true}
        />
        <BlockFooterActions actions={footerActions} />
      </div>
    </section>
  )
}
