import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
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
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  contentLayout?: 'imageRight' | 'imageLeft' | 'imageTop' | 'textOnly' | null
  description?: string | null
  eyebrow?: string | null
  footerActionMode?: 'button' | 'link' | null
  footerActions?: CmsActionValue[] | null
  size?: RegularBlockSize | null
  tabContentAlignment?: 'left' | 'center' | null
  tabStyle?: 'underline' | 'pills' | 'boxed' | null
  tabs?: TabItem[] | null
  title?: string | null
}

export function TabsContentBlockComponent({
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'center',
  contentLayout = 'imageRight',
  description,
  eyebrow,
  footerActionMode = 'link',
  footerActions,
  size = 'default',
  tabContentAlignment = 'left',
  tabStyle = 'underline',
  tabs,
  title,
}: TabsContentBlockLike) {
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const validTabs = (tabs ?? []).filter((t) => t.label?.trim())
  if (validTabs.length < 2) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'center') === 'center'
  const resolvedActions = resolveCmsActions(actions)

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
        {(eyebrow?.trim() || title?.trim() || description?.trim() || resolvedActions.length > 0) ? (
          <div
            className={cn(
              'mb-12 flex flex-col gap-4',
              isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
            )}
          >
            {eyebrow?.trim() ? (
              <SectionEyebrow surface={appearance?.background ?? 'none'}>
                {eyebrow.trim()}
              </SectionEyebrow>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {resolvedAccentTitle ? (
                  <>
                    <span className="block font-[inherit]">{title.trim()}</span>
                    <em className="block font-[inherit]">{resolvedAccentTitle}</em>
                  </>
                ) : (
                  title.trim()
                )}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="text-base leading-7 text-current/70">{description.trim()}</p>
            ) : null}
            {resolvedActions.length > 0 ? (
              <div className="mt-2">
                <ContentActions actions={resolvedActions} />
              </div>
            ) : null}
          </div>
        ) : null}

        <TabsContentClient
          sectionBackground={appearance?.background ?? 'none'}
          tabs={resolvedTabs}
          tabStyle={tabStyle}
          contentLayout={contentLayout}
          tabContentAlignment={tabContentAlignment ?? 'left'}
        />
        <BlockFooterActions actions={footerActions} mode={footerActionMode} />
      </div>
    </section>
  )
}
