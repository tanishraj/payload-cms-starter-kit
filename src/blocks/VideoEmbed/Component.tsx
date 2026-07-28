import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'

type AspectRatio = '16/9' | '4/3' | '1/1' | '9/16'
type MaxWidth = 'full' | 'lg' | 'md'

type VideoEmbedBlockLike = {
  appearance?: BlockAppearance | null
  aspectRatio?: AspectRatio | null
  autoplay?: boolean | null
  caption?: string | null
  maxWidth?: MaxWidth | null
  size?: RegularBlockSize | null
  title?: string | null
  url?: string | null
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '9/16': 'aspect-[9/16]',
}

const maxWidthClasses: Record<MaxWidth, string> = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  full: 'max-w-none',
}

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } {
  // YouTube — handles youtu.be, youtube.com/watch, youtube.com/shorts
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/,
  )
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    }
  }

  // Vimeo — handles vimeo.com/<id> and player.vimeo.com/video/<id>
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  return { type: 'direct', embedUrl: url }
}

export function VideoEmbedBlockComponent({
  appearance,
  aspectRatio = '16/9',
  autoplay = false,
  caption,
  maxWidth = 'lg',
  size = 'default',
  title,
  url,
}: VideoEmbedBlockLike) {
  if (!url?.trim()) return null

  const resolvedSize: RegularBlockSize = size ?? 'default'
  const resolvedAspectRatio: AspectRatio = aspectRatio ?? '16/9'
  const resolvedMaxWidth: MaxWidth = maxWidth ?? 'lg'
  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const { type, embedUrl } = parseVideoUrl(url.trim())

  const iframeTitle = title?.trim() || (type === 'youtube' ? 'YouTube video' : type === 'vimeo' ? 'Vimeo video' : 'Video')
  const autoplayParam = autoplay ? '&autoplay=1&mute=1' : ''

  const embedSrc =
    type === 'youtube'
      ? `${embedUrl}?rel=0&modestbranding=1${autoplayParam}`
      : type === 'vimeo'
        ? `${embedUrl}?dnt=1${autoplay ? '&autoplay=1&muted=1' : ''}`
        : embedUrl

  return (
    <section className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        <figure className={cn('mx-auto w-full', maxWidthClasses[resolvedMaxWidth])}>
          <div className={cn('w-full overflow-hidden rounded-xl', aspectRatioClasses[resolvedAspectRatio])}>
            {type === 'direct' ? (
              <video
                className="h-full w-full object-cover"
                controls
                autoPlay={autoplay ?? false}
                muted={autoplay ?? false}
                playsInline
                title={iframeTitle}
              >
                <source src={embedSrc} />
              </video>
            ) : (
              <iframe
                className="h-full w-full border-0"
                src={embedSrc}
                title={iframeTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
          {caption?.trim() ? (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
              {caption.trim()}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  )
}
