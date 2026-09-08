import type { ElementType } from 'react'

import {
  contentIntroClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
  sectionIntroAlignmentClasses,
} from '@/blocks/shared/contentStyles'
import type { SectionContentAlignment } from '@/blocks/shared/sectionFields'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow, type SectionEyebrowSurface } from '@/components/SectionEyebrow'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

type SectionIntroProps = {
  accentTitle?: string | null
  actions?: ResolvedCmsAction[] | null
  alignment?: SectionContentAlignment
  className?: string
  description?: string | null
  eyebrow?: string | null
  headingAs?: 'h1' | 'h2' | 'h3'
  surface?: SectionEyebrowSurface
  title?: string | null
}

export function SectionIntro({
  accentTitle,
  actions = [],
  alignment = 'left',
  className,
  description,
  eyebrow,
  headingAs = 'h2',
  surface = 'none',
  title,
}: SectionIntroProps) {
  const resolvedAccentTitle = accentTitle?.trim()
  const resolvedActions = actions ?? []
  const resolvedDescription = description?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedTitle = title?.trim()

  if (
    !resolvedAccentTitle &&
    !resolvedActions.length &&
    !resolvedDescription &&
    !resolvedEyebrow &&
    !resolvedTitle
  ) {
    return null
  }

  const Heading = headingAs as ElementType

  return (
    <div
      className={cn(contentIntroClasses, sectionIntroAlignmentClasses[alignment], className)}
      data-section-intro="true"
    >
      {resolvedEyebrow ? (
        <SectionEyebrow surface={surface}>{resolvedEyebrow}</SectionEyebrow>
      ) : null}
      {resolvedTitle || resolvedAccentTitle ? (
        <Heading className={contentSectionHeadingClasses}>
          {resolvedTitle ? <span className="block font-[inherit]">{resolvedTitle}</span> : null}
          {resolvedAccentTitle ? (
            <em className="block font-[inherit]">{resolvedAccentTitle}</em>
          ) : null}
        </Heading>
      ) : null}
      {resolvedDescription ? (
        <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
      ) : null}
      {resolvedActions.length ? (
        <ContentActions actions={resolvedActions} alignment={alignment} />
      ) : null}
    </div>
  )
}
