import { cn } from '@/lib/utils'

export type ProfileCarouselImagePosition = 'bottom' | 'center' | 'left' | 'right' | 'top'
export type ProfileCarouselCardVariant = 'overlay' | 'stacked'
export type ProfileCarouselOverlayAlignment = 'center' | 'left' | 'right'
export type ProfileCarouselSize = 'comfortable' | 'compact' | 'default'

export type ProfileCarouselProfile = {
  image: {
    alt: string
    height?: number
    src: string
    width?: number
  }
  imagePosition?: ProfileCarouselImagePosition | null
  name: string
  role?: string | null
}

type ProfileCarouselCardProps = {
  overlayAlignment: ProfileCarouselOverlayAlignment
  profile: ProfileCarouselProfile
  size: ProfileCarouselSize
  variant: ProfileCarouselCardVariant
}

const imageHeightClasses = {
  compact: 'h-64 sm:h-72 md:h-80',
  default: 'h-72 sm:h-80 md:h-96',
  comfortable: 'h-80 sm:h-96 md:h-[28rem]',
} as const

const objectPositionClasses = {
  center: 'object-[center_center]',
  top: 'object-[center_top]',
  bottom: 'object-[center_bottom]',
  left: 'object-[left_center]',
  right: 'object-[right_center]',
} as const

const overlayAlignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

export function ProfileCarouselCard({
  overlayAlignment,
  profile,
  size,
  variant,
}: ProfileCarouselCardProps) {
  const imagePosition = profile.imagePosition ?? 'center'
  const mediaFrame = (
    <div
      className={cn('relative w-full overflow-hidden rounded-md', imageHeightClasses[size])}
      data-profile-carousel-media-frame="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={profile.image.alt}
        className={cn(
          'block h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 [@media(hover:hover)]:group-hover:scale-[1.02]',
          objectPositionClasses[imagePosition],
        )}
        data-profile-carousel-image-position={imagePosition}
        height={profile.image.height}
        src={profile.image.src}
        width={profile.image.width}
      />
      {variant === 'overlay' ? (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-linear-to-t from-background/95 via-background/70 to-transparent p-5 pt-16 text-foreground',
            overlayAlignmentClasses[overlayAlignment],
          )}
        >
          <p className="text-base leading-tight font-semibold">{profile.name}</p>
          {profile.role ? (
            <p className="text-sm leading-6 text-foreground/70">{profile.role}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  if (variant === 'overlay') {
    return (
      <article
        className="group min-w-0"
        data-profile-carousel-card-variant="overlay"
        data-profile-carousel-overlay-alignment={overlayAlignment}
      >
        {mediaFrame}
      </article>
    )
  }

  return (
    <article
      className="group flex min-w-0 flex-col gap-3"
      data-profile-carousel-card-variant="stacked"
    >
      {mediaFrame}
      <div className="flex flex-col gap-0.5">
        <p className="text-base leading-tight font-semibold text-current">{profile.name}</p>
        {profile.role ? <p className="text-sm leading-6 text-current/70">{profile.role}</p> : null}
      </div>
    </article>
  )
}
