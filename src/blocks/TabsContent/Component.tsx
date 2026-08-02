import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'
import { TabsContentClient, type ResolvedTab } from './TabsContentClient'

type TabItem = {
  actions?: CmsActionValue[] | null
  description?: string | null
  eyebrow?: string | null
  id?: string | null
  image?: string | number | Media | null
  label?: string | null
  title?: string | null
}

type TabsContentBlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  contentLayout?: 'imageRight' | 'imageLeft' | 'imageTop' | 'textOnly' | null
  description?: string | null
  eyebrow?: string | null
  size?: RegularBlockSize | null
  tabContentAlignment?: 'left' | 'center' | null
  tabStyle?: 'underline' | 'pills' | 'boxed' | null
  tabs?: TabItem[] | null
  title?: string | null
}

export function TabsContentBlockComponent({
  appearance,
  contentAlignment = 'center',
  contentLayout = 'imageRight',
  description,
  eyebrow,
  size = 'default',
  tabContentAlignment = 'left',
  tabStyle = 'underline',
  tabs,
  title,
}: TabsContentBlockLike) {
  const validTabs = (tabs ?? []).filter((t) => t.label?.trim())
  if (validTabs.length < 2) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'center') === 'center'

  const resolvedTabs: ResolvedTab[] = validTabs.map((tab, index) => {
    const imageProps = getMediaImageProps({ media: tab.image, preset: 'generic' })
    return {
      id: tab.id ?? index,
      label: tab.label!.trim(),
      eyebrow: tab.eyebrow?.trim() || undefined,
      title: tab.title?.trim() || undefined,
      description: tab.description?.trim() || undefined,
      imageSrc: imageProps?.src,
      imageAlt: imageProps?.alt,
      imageWidth: isMediaDoc(tab.image) ? (tab.image.width ?? undefined) : undefined,
      imageHeight: isMediaDoc(tab.image) ? (tab.image.height ?? undefined) : undefined,
      actions: resolveCmsActions(tab.actions),
    }
  })

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {(eyebrow?.trim() || title?.trim() || description?.trim()) ? (
          <div
            className={cn(
              'mb-12 flex flex-col gap-4',
              isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
            )}
          >
            {eyebrow?.trim() ? (
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                {eyebrow.trim()}
              </p>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {title.trim()}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="text-base leading-7 text-current/70">{description.trim()}</p>
            ) : null}
          </div>
        ) : null}

        <TabsContentClient
          tabs={resolvedTabs}
          tabStyle={tabStyle}
          contentLayout={contentLayout}
          tabContentAlignment={tabContentAlignment ?? 'left'}
        />
      </div>
    </section>
  )
}
