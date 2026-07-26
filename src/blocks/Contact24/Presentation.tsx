import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { Contact24, type Contact24DetailsAlignment } from '@/components/contact24'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'

export type Contact24BlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: 'center' | 'left' | 'right' | null
  description?: string | null
  detailsAlignment?: Contact24DetailsAlignment | null
  eyebrow?: string | null
  size?: 'comfortable' | 'compact' | 'default' | null
  title?: string | null
}

export function Contact24BlockPresentation({
  appearance,
  contentAlignment = 'left',
  description,
  detailsAlignment = 'left',
  eyebrow,
  offices,
  size = 'default',
  title,
}: Contact24BlockLike & { offices: SiteOfficeLocation[] }) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  return (
    <Contact24
      appearance={appearance}
      contentAlignment={contentAlignment ?? 'left'}
      description={description?.trim()}
      detailsAlignment={detailsAlignment ?? 'left'}
      eyebrow={eyebrow?.trim()}
      offices={offices}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
