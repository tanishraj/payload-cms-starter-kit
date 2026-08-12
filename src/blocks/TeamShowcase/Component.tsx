import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import {
  TeamShowcase,
  type TeamShowcaseAlignment,
  type TeamShowcaseMember,
  type TeamShowcaseSize,
} from '@/components/team-showcase'
import { getMediaImageProps } from '@/lib/media'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'

type TeamShowcaseBlockLike = {
  showHeaderDivider?: boolean | null
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: TeamShowcaseAlignment | null
  description?: string | null
  title?: string | null
  members?:
    | {
        cardBackground?: string | null
        image?: unknown
        name?: string | null
        role?: string | null
        description?: string | null
      }[]
    | null
  size?: TeamShowcaseSize | null
}

export function TeamShowcaseBlockComponent({
  showHeaderDivider = true,
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  title,
  members,
  size = 'default',
}: TeamShowcaseBlockLike) {
  const resolvedMembers = (members ?? []).flatMap((member) => {
    const name = member.name?.trim()

    const imageProps = getMediaImageProps({
      fallbackAlt: name ?? 'Team member',
      media: member.image as never,
      preset: 'generic',
    })

    return name && imageProps
      ? [
          {
            cardBackground: member.cardBackground,
            image: imageProps.src,
            name,
            role: member.role?.trim() ?? '',
            description: member.description?.trim() ?? '',
          } satisfies TeamShowcaseMember,
        ]
      : []
  })

  if (!resolvedMembers.length) {
    return null
  }

  return (
    <TeamShowcase
      actions={
        <ContentActions
          actions={resolveCmsActions(actions)}
          alignment={contentAlignment ?? 'left'}
          data-team-showcase-actions="true"
          mode={actionMode ?? 'link'}
        />
      }
      appearance={appearance}
      showHeaderDivider={showHeaderDivider ?? undefined}
      contentAlignment={contentAlignment ?? undefined}
      description={description?.trim() || undefined}
      heading={title ?? undefined}
      members={resolvedMembers}
      size={size ?? undefined}
    />
  )
}
