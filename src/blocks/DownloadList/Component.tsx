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
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  displayMode?: 'list' | 'cards' | 'compact' | null
  downloads?: DownloadItem[] | null
  eyebrow?: string | null
  footerActionMode?: 'button' | 'link' | null
  footerActions?: CmsActionValue[] | null
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
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  displayMode = 'list',
  downloads,
  eyebrow,
  footerActionMode = 'link',
  footerActions,
  showFilter = false,
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
          downloads={resolvedDownloads}
          displayMode={displayMode}
          sectionBackground={appearance?.background ?? 'none'}
          showFilter={showFilter}
        />
        <BlockFooterActions actions={footerActions} mode={footerActionMode} />
      </div>
    </section>
  )
}
