'use client'

import { useState } from 'react'
import Image from 'next/image'

import type { BlockBackground } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { type ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

export type ResolvedTab = {
  actions: ResolvedCmsAction[]
  description?: string
  eyebrow?: string
  id: string | number
  imageSrc?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  label: string
  title?: string
}

type Props = {
  sectionBackground: BlockBackground
  tabs: ResolvedTab[]
  tabStyle?: 'underline' | 'pills' | 'boxed' | null
  contentLayout?: 'imageRight' | 'imageLeft' | 'imageTop' | 'textOnly' | null
  tabContentAlignment?: 'left' | 'center'
}

export function TabsContentClient({
  sectionBackground,
  tabs,
  tabStyle = 'underline',
  contentLayout = 'imageRight',
  tabContentAlignment = 'left',
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = tabs[activeIndex]

  const resolvedTabStyle = tabStyle ?? 'underline'
  const resolvedLayout = contentLayout ?? 'imageRight'

  return (
    <div className="flex flex-col gap-8">
      {/* Tab bar */}
      <div
        role="tablist"
        className={cn(
          'flex flex-wrap gap-1',
          resolvedTabStyle === 'underline' && 'border-b border-border gap-0',
          resolvedTabStyle === 'pills' && 'gap-2',
          resolvedTabStyle === 'boxed' && 'rounded-lg border border-border bg-muted p-1 gap-1',
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                resolvedTabStyle === 'underline' && [
                  'px-4 py-3 border-b-2 -mb-px',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                ],
                resolvedTabStyle === 'pills' && [
                  'rounded-full px-4 py-2',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ],
                resolvedTabStyle === 'boxed' && [
                  'rounded-md px-4 py-2',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ],
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab panel */}
      {active ? (
        <div
          role="tabpanel"
          key={activeIndex}
          className={cn(
            'flex gap-8 md:gap-12',
            resolvedLayout === 'imageTop' && 'flex-col',
            resolvedLayout === 'imageRight' && 'flex-col md:flex-row-reverse md:items-center',
            resolvedLayout === 'imageLeft' && 'flex-col md:flex-row md:items-center',
            resolvedLayout === 'textOnly' && 'flex-col max-w-2xl',
          )}
        >
          {/* Image */}
          {active.imageSrc && resolvedLayout !== 'textOnly' ? (
            <div
              className={cn(
                'relative overflow-hidden rounded-xl',
                resolvedLayout === 'imageTop'
                  ? 'aspect-video w-full'
                  : 'aspect-video w-full md:flex-1',
              )}
            >
              <Image
                src={active.imageSrc}
                alt={active.imageAlt ?? ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : null}

          {/* Text */}
          <div
            className={cn(
              'flex flex-col gap-4',
              resolvedLayout !== 'imageTop' && active.imageSrc && resolvedLayout !== 'textOnly'
                ? 'md:flex-1'
                : 'w-full',
              tabContentAlignment === 'center' && 'items-center text-center',
            )}
          >
            {active.eyebrow ? (
              <SectionEyebrow surface={sectionBackground}>{active.eyebrow}</SectionEyebrow>
            ) : null}
            {active.title ? (
              <h3 className="font-sans text-xl font-semibold tracking-tight text-current sm:text-2xl">
                {active.title}
              </h3>
            ) : null}
            {active.description ? (
              <p className="text-base leading-7 text-current/70">{active.description}</p>
            ) : null}
            {active.actions.length > 0 ? (
              <div className="mt-2">
                <ContentActions actions={active.actions} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
