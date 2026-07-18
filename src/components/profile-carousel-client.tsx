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

type ProfileCarouselClientProps = {
  cardVariant: ProfileCarouselCardVariant
  overlayAlignment: ProfileCarouselOverlayAlignment
  profiles: ProfileCarouselProfile[]
  size: ProfileCarouselSize
}

export function ProfileCarouselClient({
  cardVariant,
  overlayAlignment,
  profiles,
  size,
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
              profile={profile}
              size={size}
              variant={cardVariant}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
