import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ActionButtonContent } from '@/components/ActionButtonContent'
import { BorderButton } from '@/components/shadcnblocks/border-button'
import { Services21, type Services21Item, type Services21Alignment } from '@/components/services21'
import { ContentLink } from '@/components/ContentLink'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import type { Media } from '@/payload-types'

type Services21BlockService = {
  code?: string | null
  description?: string | null
  image?: unknown
  title?: string | null
}

type Services21BlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: Services21Alignment | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  services?: Services21BlockService[] | null
  size?: 'none' | 'comfortable' | 'compact' | 'default' | null
  title?: string | null
}

type ActionButtonMode = 'default' | 'outline' | 'primary' | 'secondary'

const resolveServiceCode = (code: string | null | undefined, index: number) => {
  const trimmed = code?.trim()
  const paddedIndex = String(index + 1).padStart(2, '0')

  return trimmed && trimmed.length > 0 ? trimmed : `{${paddedIndex}}`
}

const buttonClassNameByVariant: Record<ActionButtonMode, string> = {
  default:
    'border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
  outline: 'border-current/20 text-current hover:bg-muted hover:text-current/80',
  primary:
    'border-primary bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_8%)]',
  secondary: 'border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20',
}

export function Services21BlockComponent({
  accentTitle,
  actions,
  appearance,
  description,
  eyebrow,
  footerActions,
  contentAlignment = 'center',
  services,
  size = 'default',
  title,
}: Services21BlockLike) {
  const resolvedServices = (services ?? []).flatMap((service, index): Services21Item[] => {
    const titleValue = service.title?.trim()
    const image = getMediaImageProps({
      media: service.image as Media | null | number | string,
      preset: 'hero',
      fallbackAlt: titleValue || 'Service image',
    })

    if (!titleValue || !image) {
      return []
    }

    return [
      {
        description: service.description?.trim() || '',
        id: resolveServiceCode(service.code, index),
        image: image.src,
        title: titleValue,
      },
    ]
  })

  const resolvedActions = resolveCmsActions(actions).slice(0, 1)
  const resolvedTitle = title?.trim()
  const resolvedDescription = description?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedContentAlignment = contentAlignment ?? 'left'
  const action = resolvedActions[0]
  const actionVariant: ActionButtonMode =
    action?.variant === 'link' ? 'default' : (action?.variant ?? 'default')
  const hasServices = resolvedServices.length > 0
  const actionNode = action ? (
    action.mode === 'button' ? (
      <BorderButton
        asChild
        className={`group mt-10 ${buttonClassNameByVariant[actionVariant]}`}
        variant={actionVariant}
      >
        <a
          href={action.href}
          rel={action.openInNewTab ? 'noreferrer' : undefined}
          target={action.openInNewTab ? '_blank' : undefined}
        >
          <ActionButtonContent label={action.label} showArrow={action.showArrow} />
        </a>
      </BorderButton>
    ) : (
      <ContentLink
        className="mt-10"
        href={action.href}
        label={action.label}
        openInNewTab={action.openInNewTab}
      />
    )
  ) : null

  if (!hasServices) {
    return null
  }

  return (
    <>
      <Services21
        accentTitle={accentTitle}
        appearance={appearance}
        actions={actionNode}
        contentAlignment={resolvedContentAlignment}
        description={resolvedDescription}
        eyebrow={resolvedEyebrow}
        items={resolvedServices}
        size={size ?? 'default'}
        title={resolvedTitle}
      />
      <BlockFooterActions actions={footerActions} />
    </>
  )
}
