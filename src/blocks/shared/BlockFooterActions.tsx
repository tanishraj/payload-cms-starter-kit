import { ContentActions } from '@/components/ContentActions'
import type { SectionContentAlignment } from '@/blocks/shared/sectionFields'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type BlockFooterActionsProps = {
  actions?: CmsActionValue[] | null
  alignment: SectionContentAlignment
  className?: string
}

export function BlockFooterActions({ actions, alignment, className }: BlockFooterActionsProps) {
  const resolved = resolveCmsActions(actions)
  if (!resolved.length) return null

  return (
    <ContentActions actions={resolved} alignment={alignment} className={cn('mt-10', className)} />
  )
}
