import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'

type SplitFeatureBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentVerticalAlignment?: 'bottom' | 'center' | 'top' | null
  description?: string | null
  eyebrow?: string | null
  image?: unknown
  imagePosition?: 'bottom' | 'center' | 'left' | 'right' | 'top' | null
  layoutMode?: 'contentOnly' | 'split' | null
  mediaFillMode?: 'contained' | 'containedFill' | 'edgeToEdge' | null
  mediaPosition?: 'left' | 'right' | null
  size?: 'comfortable' | 'compact' | 'default' | null
  title: string
}

const orderClasses = {
  left: {
    content: 'md:order-2',
    media: 'md:order-1',
  },
  right: {
    content: 'md:order-1',
    media: 'md:order-2',
  },
} as const

const objectPositionClasses = {
  center: 'object-[center_center]',
  top: 'object-[center_top]',
  bottom: 'object-[center_bottom]',
  left: 'object-[left_center]',
  right: 'object-[right_center]',
} as const

const containedPaddingClasses = {
  compact: 'py-10 md:py-10',
  default: 'py-12 md:py-12',
  comfortable: 'py-16 md:py-16',
} as const

const edgeContentPaddingClasses = {
  compact: 'px-4 py-10 md:px-8 md:py-10 lg:px-12',
  default: 'px-4 py-12 md:px-8 md:py-12 lg:px-12',
  comfortable: 'px-4 py-16 md:px-8 md:py-16 lg:px-12',
} as const

const imageRightContentPaddingClasses = {
  compact: 'py-10 pr-4 md:py-10 md:pr-8 lg:pr-12',
  default: 'py-12 pr-4 md:py-12 md:pr-8 lg:pr-12',
  comfortable: 'py-16 pr-4 md:py-16 md:pr-8 lg:pr-12',
} as const

const edgeLayoutMinHeightClasses = {
  compact: 'min-h-[18rem] md:min-h-[24rem]',
  default: 'min-h-[24rem] md:min-h-[32rem]',
  comfortable: 'min-h-[30rem] md:min-h-[40rem]',
} as const

const contentVerticalAlignmentClasses = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
} as const

export function SplitFeatureBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentVerticalAlignment = 'center',
  description,
  eyebrow,
  image,
  imagePosition = 'center',
  layoutMode = 'split',
  mediaFillMode = 'contained',
  mediaPosition = 'left',
  size = 'default',
  title,
}: SplitFeatureBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const media = getMediaImageProps({
    media: image as never,
    preset: 'generic',
    fallbackAlt: title,
  })

  const resolvedLayoutMode = layoutMode ?? 'split'

  const resolvedActions = resolveCmsActions(actions)

  const resolvedImagePosition = imagePosition ?? 'center'
  const resolvedPosition = mediaPosition ?? 'left'
  const resolvedMediaFillMode = mediaFillMode ?? 'contained'
  const resolvedSize = size ?? 'default'
  const resolvedContentVerticalAlignment = contentVerticalAlignment ?? 'center'
  const order = resolvedPosition === 'right' ? orderClasses.right : orderClasses.left
  const hasMedia = Boolean(media)
  const renderAsSplit = resolvedLayoutMode === 'split' && hasMedia
  const renderAsEdgeToEdge = renderAsSplit && resolvedMediaFillMode === 'edgeToEdge'
  const renderAsContainedFill = renderAsSplit && resolvedMediaFillMode === 'containedFill'
  const contentContainerClasses = renderAsSplit
    ? 'max-w-xl text-left'
    : 'mx-auto max-w-2xl items-center text-center'
  const contentVerticalAlignmentClass =
    contentVerticalAlignmentClasses[resolvedContentVerticalAlignment]
  const splitContentPaddingClasses =
    resolvedPosition === 'right'
      ? imageRightContentPaddingClasses[resolvedSize]
      : edgeContentPaddingClasses[resolvedSize]

  const content = (
    <div
      className={cn(
        'flex flex-col gap-4',
        renderAsEdgeToEdge ? 'w-full max-w-xl text-left mr-auto' : contentContainerClasses,
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-balance text-base leading-7 text-muted-foreground">{description}</p>
      ) : null}
      <ContentActions
        actions={resolvedActions}
        alignment={renderAsSplit ? 'left' : 'center'}
        data-split-feature-actions="true"
        mode={actionMode ?? 'link'}
      />
    </div>
  )

  return (
    <section
      className={appearanceClasses.className}
      data-split-feature-action-mode={actionMode ?? 'link'}
      data-split-feature-background={appearance?.background ?? 'none'}
      data-split-feature-layout={renderAsSplit ? 'split' : 'contentOnly'}
      data-split-feature-media-fill={renderAsSplit ? resolvedMediaFillMode : 'contentOnly'}
      data-split-feature-content-vertical-alignment={
        renderAsSplit ? resolvedContentVerticalAlignment : 'contentOnly'
      }
      data-split-feature-image-position={resolvedImagePosition}
      data-split-feature-position={renderAsSplit ? resolvedPosition : 'contentOnly'}
      data-split-feature-size={resolvedSize}
    >
      {renderAsEdgeToEdge ? (
        <div
          className={cn(
            'grid items-stretch md:grid-cols-2',
            edgeLayoutMinHeightClasses[resolvedSize],
          )}
        >
          {renderAsSplit ? (
            <div
              className={cn(order.media, 'relative min-h-full overflow-hidden')}
              data-split-feature-media-frame="edgeToEdge"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={media?.alt}
                className={cn(
                  'absolute inset-0 size-full object-cover',
                  objectPositionClasses[resolvedImagePosition],
                )}
                src={media?.src}
              />
            </div>
          ) : null}
          <div className={cn(order.content)}>
            {resolvedPosition === 'right' ? (
              <div className="ml-auto h-full w-full max-w-[calc(var(--breakpoint-2xl)/2)] pl-4">
                <div
                  className={cn(
                    'flex min-h-full flex-col',
                    contentVerticalAlignmentClass,
                    splitContentPaddingClasses,
                  )}
                >
                  {content}
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'flex min-h-full flex-col',
                  contentVerticalAlignmentClass,
                  splitContentPaddingClasses,
                )}
              >
                {content}
              </div>
            )}
          </div>
        </div>
      ) : renderAsContainedFill ? (
        <div className="mx-auto max-w-screen-2xl px-4">
          <div
            className={cn(
              'grid items-stretch md:grid-cols-2',
              edgeLayoutMinHeightClasses[resolvedSize],
            )}
          >
            <div className={cn(order.media)} data-split-feature-media-frame="containedFill">
              <div className="relative aspect-[4/3] overflow-hidden md:h-full md:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={media?.alt}
                  className={cn(
                    'absolute inset-0 size-full object-cover',
                    objectPositionClasses[resolvedImagePosition],
                  )}
                  src={media?.src}
                />
              </div>
            </div>
            <div className={cn(order.content)}>
              <div
                className={cn(
                  'flex min-h-full flex-col',
                  contentVerticalAlignmentClass,
                  splitContentPaddingClasses,
                )}
              >
                {content}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn('mx-auto max-w-screen-2xl px-4', containedPaddingClasses[resolvedSize])}>
          {renderAsSplit ? (
            <div className={cn('grid items-stretch gap-8 md:grid-cols-2 md:gap-12 lg:gap-16')}>
              <div className={cn(order.media)} data-split-feature-media-frame="contained">
                <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={media?.alt}
                    className={cn(
                      'aspect-4/3 size-full object-cover',
                      objectPositionClasses[resolvedImagePosition],
                    )}
                    src={media?.src}
                  />
                </div>
              </div>
              <div
                className={cn(
                  order.content,
                  'flex min-h-full flex-col',
                  contentVerticalAlignmentClass,
                )}
              >
                {content}
              </div>
            </div>
          ) : (
            <div className="block">{content}</div>
          )}
        </div>
      )}
    </section>
  )
}
