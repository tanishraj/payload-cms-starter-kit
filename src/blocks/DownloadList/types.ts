export type DownloadDisplayMode = 'cards' | 'compact' | 'framedGrid' | 'list' | 'openGrid'

export type DownloadGridColumns = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

export type DownloadDocumentIconSize = 'large' | 'medium' | 'small'

export type DownloadActionKind = 'download' | 'link'

export type DownloadGridIconPosition = 'above' | 'inline'

export type DownloadGridActionDisplay = 'icons' | 'labelled'

export type DownloadActionSettings = {
  openViewInNewTab?: boolean | null
  showDownload?: boolean | null
  showView?: boolean | null
}

export type ResolvedDownloadAction = {
  href: string
  kind: DownloadActionKind
  label: string
  openInNewTab: boolean
}

export type ResolvedDownload = {
  actions: ResolvedDownloadAction[]
  cardBackground?: string
  description?: string
  fileType?: string
  id: string | number
  title: string
}
