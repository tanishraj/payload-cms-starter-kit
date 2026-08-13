import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ContentActions } from '@/components/ContentActions'
import {
  ProfileCarousel,
  type ProfileCarouselAlignment,
  type ProfileCarouselCardVariant,
  type ProfileCarouselImagePosition,
  type ProfileCarouselOverlayAlignment,
  type ProfileCarouselProfile,
  type ProfileCarouselSize,
} from '@/components/profile-carousel'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'

type ProfileCarouselBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  cardVariant?: ProfileCarouselCardVariant | null
  contentAlignment?: ProfileCarouselAlignment | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  profiles?:
    | {
        cardBackground?: string | null
        image?: unknown
        imagePosition?: ProfileCarouselImagePosition | null
        name?: string | null
        role?: string | null
      }[]
    | null
  overlayAlignment?: ProfileCarouselOverlayAlignment | null
  size?: ProfileCarouselSize | null
  title?: string | null
}

export function ProfileCarouselBlockComponent({
  accentTitle,
  actions,
  appearance,
  cardVariant = 'stacked',
  contentAlignment = 'center',
  description,
  eyebrow,
  footerActions,
  overlayAlignment = 'left',
  profiles,
  size = 'default',
  title,
}: ProfileCarouselBlockLike) {
  const resolvedTitle = title?.trim()
  const resolvedProfiles = (profiles ?? []).flatMap((profile): ProfileCarouselProfile[] => {
    const name = profile.name?.trim()
    const image = getMediaImageProps({
      fallbackAlt: name,
      media: profile.image as never,
      preset: 'generic',
    })

    return name && image
      ? [
          {
            cardBackground: profile.cardBackground,
            image,
            imagePosition: profile.imagePosition,
            name,
            role: profile.role?.trim() || undefined,
          },
        ]
      : []
  })

  if (!resolvedTitle || !resolvedProfiles.length) {
    return null
  }

  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedActions = resolveCmsActions(actions).slice(0, 1)

  return (
    <>
      <ProfileCarousel
        accentTitle={accentTitle}
        actions={
          <ContentActions
            actions={resolvedActions}
            alignment={resolvedAlignment}
            data-profile-carousel-actions="true"
          />
        }
        alignment={resolvedAlignment}
        appearance={appearance}
        cardVariant={cardVariant ?? 'stacked'}
        description={description?.trim() || undefined}
        eyebrow={eyebrow?.trim() || undefined}
        overlayAlignment={overlayAlignment ?? 'left'}
        profiles={resolvedProfiles}
        size={size ?? 'default'}
        title={resolvedTitle}
      />
      <BlockFooterActions actions={footerActions} />
    </>
  )
}
