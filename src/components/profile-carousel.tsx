import type { ReactNode } from 'react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import {
  ProfileCarouselCard,
  type ProfileCarouselCardVariant,
  type ProfileCarouselImagePosition,
  type ProfileCarouselOverlayAlignment,
  type ProfileCarouselProfile,
  type ProfileCarouselSize,
} from '@/components/profile-carousel-card'
import { ProfileCarouselClient } from '@/components/profile-carousel-client'
import { cn } from '@/lib/utils'

export type ProfileCarouselAlignment = 'center' | 'left' | 'right'
export type {
  ProfileCarouselCardVariant,
  ProfileCarouselImagePosition,
  ProfileCarouselOverlayAlignment,
  ProfileCarouselProfile,
  ProfileCarouselSize,
}

type ProfileCarouselProps = {
  actions?: ReactNode
  alignment?: ProfileCarouselAlignment
  appearance?: BlockAppearance | null
  cardVariant?: ProfileCarouselCardVariant
  className?: string
  description?: string | null
  eyebrow?: string | null
  overlayAlignment?: ProfileCarouselOverlayAlignment
  profiles: ProfileCarouselProfile[]
  size?: ProfileCarouselSize
  title?: string | null
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const profileMarginClasses = {
  compact: 'mt-8',
  default: 'mt-10',
  comfortable: 'mt-12',
} as const

export function ProfileCarousel({
  actions,
  alignment = 'left',
  appearance,
  cardVariant = 'stacked',
  className,
  description,
  eyebrow,
  overlayAlignment = 'left',
  profiles,
  size = 'default',
  title,
}: ProfileCarouselProps) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedAlignment = alignment ?? 'left'
  const resolvedSize = size ?? 'default'
  const visibleProfiles = profiles.slice(0, 12)
  const usesCarousel = visibleProfiles.length > 4

  if (!visibleProfiles.length) {
    return null
  }

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[resolvedSize],
        appearanceClasses.className,
        className,
      )}
      data-profile-carousel="true"
      data-profile-carousel-alignment={resolvedAlignment}
      data-profile-carousel-background={appearance?.background ?? 'none'}
      data-profile-carousel-card-variant={cardVariant}
      data-profile-carousel-mode={usesCarousel ? 'carousel' : 'static'}
      data-profile-carousel-size={resolvedSize}
    >
      <div className={regularBlockContainerClasses}>
        <div className={cn('flex max-w-3xl flex-col gap-4', alignmentClasses[resolvedAlignment])}>
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="text-base leading-7 text-balance text-current/70">{description}</p>
          ) : null}
          {actions}
        </div>

        <div className={profileMarginClasses[resolvedSize]}>
          {usesCarousel ? (
            <ProfileCarouselClient
              cardVariant={cardVariant}
              overlayAlignment={overlayAlignment}
              profiles={visibleProfiles}
              size={resolvedSize}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {visibleProfiles.map((profile, index) => (
                <ProfileCarouselCard
                  key={`${profile.name}-${index}`}
                  overlayAlignment={overlayAlignment}
                  profile={profile}
                  size={resolvedSize}
                  variant={cardVariant}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
