import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import { resolveCmsLink, type CmsLinkValue } from '@/lib/cmsLinks'
import type { Media, Page } from '@/payload-types'

import type { DownloadActionSettings, ResolvedDownloadAction } from './types'

export type DownloadManualActionInput = CmsLinkValue & {
  actionAppearance?: string | null
  actionType?: 'download' | 'link' | null
  file?: string | number | Media | null
  icon?: string | null
  iconMode?: string | null
  label?: string | null
  page?: string | number | Page | null
}

export type AutomaticDownloadActionFallback = DownloadActionSettings & {
  downloadHref?: string
  viewHref?: string
}

const resolveManualActions = (
  actions?: DownloadManualActionInput[] | null,
): ResolvedDownloadAction[] =>
  (actions ?? []).slice(0, 2).flatMap((action): ResolvedDownloadAction[] => {
    const label = action.label?.trim()
    if (!label) return []

    if (action.actionType === 'download') {
      const href = isMediaDoc(action.file) ? getMediaAbsoluteUrl(action.file) : undefined
      return href
        ? [
            {
              href,
              kind: 'download' as const,
              label,
              openInNewTab: false,
            },
          ]
        : []
    }

    if (action.actionType === 'link') {
      const destination = resolveCmsLink({
        ...action,
        url: action.url?.trim() || undefined,
      })
      return destination.href
        ? [
            {
              href: destination.href,
              kind: 'link' as const,
              label,
              openInNewTab: Boolean(destination.openInNewTab),
            },
          ]
        : []
    }

    return []
  })

export function resolveDocumentActions(
  manualActions: DownloadManualActionInput[] | null | undefined,
  fallback: AutomaticDownloadActionFallback,
): ResolvedDownloadAction[] {
  const resolvedManualActions = resolveManualActions(manualActions)
  if (resolvedManualActions.length > 0) return resolvedManualActions

  const resolvedFallback: ResolvedDownloadAction[] = []
  if (fallback.showView === true && fallback.viewHref) {
    resolvedFallback.push({
      href: fallback.viewHref,
      kind: 'link',
      label: 'View Document',
      openInNewTab: fallback.openViewInNewTab ?? true,
    })
  }
  if (fallback.showDownload !== false && fallback.downloadHref) {
    resolvedFallback.push({
      href: fallback.downloadHref,
      kind: 'download',
      label: 'Download',
      openInNewTab: false,
    })
  }
  return resolvedFallback
}
