'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  ProfileCarouselCard,
  type ProfileCarouselCardVariant,
  type ProfileCarouselOverlayAlignment,
  type ProfileCarouselProfile,
  type ProfileCarouselSize,
} from '@/components/profile-carousel-card'
import type { BlockBackground } from '@/blocks/shared/blockAppearance'
import type {
  MediaOverlayCoverage,
  MediaOverlayDirection,
  MediaOverlayStrength,
  MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'

type ProfileCarouselClientProps = {
  cardVariant: ProfileCarouselCardVariant
  overlayAlignment: ProfileCarouselOverlayAlignment
  overlayCoverage: MediaOverlayCoverage
  overlayDirection: MediaOverlayDirection
  overlayStyle: MediaOverlayStrength
  profiles: ProfileCarouselProfile[]
  sectionBackground: BlockBackground
  size: ProfileCarouselSize
  themeMode: MediaOverlayTone
}

export function ProfileCarouselClient({
  cardVariant,
  overlayAlignment,
  overlayCoverage,
  overlayDirection,
  overlayStyle,
  profiles,
  sectionBackground,
  size,
  themeMode,
}: ProfileCarouselClientProps) {
  return (
    <Carousel
      className="relative w-full pt-14"
      data-carousel-loop="true"
      opts={{ align: 'start', loop: true }}
    >
      <div className="absolute top-0 right-0 flex h-10 items-center justify-end gap-2">
        <CarouselPrevious
          aria-label="Previous profile"
          className="static inset-auto translate-y-0"
          variant="default"
        />
        <CarouselNext
          aria-label="Next profile"
          className="static inset-auto translate-y-0"
          variant="default"
        />
      </div>
      <CarouselContent className="-ml-5">
        {profiles.map((profile, index) => (
          <CarouselItem className="pl-5 md:basis-1/2 lg:basis-1/4" key={`${profile.name}-${index}`}>
            <ProfileCarouselCard
              overlayAlignment={overlayAlignment}
              overlayCoverage={overlayCoverage}
              overlayDirection={overlayDirection}
              overlayStyle={overlayStyle}
              profile={profile}
              sectionBackground={sectionBackground}
              size={size}
              themeMode={themeMode}
              variant={cardVariant}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
