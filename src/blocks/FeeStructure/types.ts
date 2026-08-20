import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'
import type { CmsActionValue, CmsActionVariant } from '@/lib/cmsLinks'
import type { Media } from '@/payload-types'

export type FeeStructureRowEmphasis = 'standard' | 'total'
export type FeeStructureTabStyle = 'boxed' | 'pills' | 'underline'
export type FeeStructureDownloadActionMode = 'button' | 'link'
export type FeeStructureDownloadButtonVariant = Exclude<CmsActionVariant, 'link'>
export type FeeStructureTabWidth = 'content' | 'equal'

export type FeeStructureCellValue = {
  id?: string | null
  value?: string | null
}

export type FeeStructureColumnValue = {
  id?: string | null
  label?: string | null
}

export type FeeStructureRowValue = {
  cells?: FeeStructureCellValue[] | null
  emphasis?: FeeStructureRowEmphasis | null
  id?: string | null
  label?: string | null
  note?: string | null
}

export type FeeStructureNoteValue = {
  emphasis?: boolean | null
  id?: string | null
  text?: string | null
}

export type FeeStructureCategoryValue = {
  caption?: string | null
  columns?: FeeStructureColumnValue[] | null
  id?: string | null
  label?: string | null
  notes?: FeeStructureNoteValue[] | null
  rows?: FeeStructureRowValue[] | null
}

export type ResolvedFeeStructureColumn = {
  id: string
  label: string
}

export type ResolvedFeeStructureRow = {
  cells: string[]
  emphasis: FeeStructureRowEmphasis
  id: string
  label: string
  note?: string
}

export type ResolvedFeeStructureNote = {
  emphasis: boolean
  id: string
  text: string
}

export type ResolvedFeeStructureCategory = {
  caption?: string
  columns: ResolvedFeeStructureColumn[]
  id: string
  label: string
  notes: ResolvedFeeStructureNote[]
  rows: ResolvedFeeStructureRow[]
}

export type FeeStructureBlockLike = {
  academicSession?: string | null
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'center' | 'left' | null
  description?: string | null
  downloadActionMode?: FeeStructureDownloadActionMode | null
  downloadAppearance?: BlockAppearance | null
  downloadButtonVariant?: FeeStructureDownloadButtonVariant | null
  downloadLabel?: string | null
  eyebrow?: string | null
  feeCategories?: FeeStructureCategoryValue[] | null
  feeDocument?: Media | string | number | null
  footerActions?: CmsActionValue[] | null
  programmeName?: string | null
  size?: RegularBlockSize | null
  tabStyle?: FeeStructureTabStyle | null
  tabWidth?: FeeStructureTabWidth | null
  title?: string | null
}
