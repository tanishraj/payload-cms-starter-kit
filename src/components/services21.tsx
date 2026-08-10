'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'

type Services21Alignment = 'left' | 'center' | 'right'

type Services21Item = {
  id: string
  title?: string | null
  description: string
  image: string
}

type Services21Props = {
  appearance?: BlockAppearance | null
  actions?: ReactNode
  description?: string | null
  eyebrow?: string | null
  items: Services21Item[]
  size?: 'none' | 'compact' | 'default' | 'comfortable'
  title?: string | null
  contentAlignment?: Services21Alignment
  className?: string
}

const usePrevious = <T,>(value: T): T | undefined => {
  const [prev, setPrev] = useState<T | undefined>(undefined)
  const ref = useRef(value)

  useEffect(() => {
    setPrev(ref.current)
    ref.current = value
  }, [value])

  return prev
}

export function Services21({
  appearance,
  className,
  actions,
  contentAlignment = 'left',
  description,
  eyebrow,
  items,
  size = 'default',
  title,
}: Services21Props) {
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0)
  const previousServiceIndex = usePrevious(activeServiceIndex)
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  if (!items.length) {
    return null
  }

  const activeService = items[activeServiceIndex] ?? items[0]
  const previousService =
    previousServiceIndex !== undefined ? (items[previousServiceIndex] ?? activeService) : undefined

  const alignmentClasses = {
    center: 'items-center text-center',
    left: 'items-start text-left',
    right: 'items-end text-right',
  } as const

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size], appearanceClasses.className, className)}
      data-services21-background={appearance?.background ?? 'none'}
      data-services21-size={size}
    >
      <div className={regularBlockContainerClasses}>
        <div className="mb-10 flex w-full flex-col gap-4" data-services21-intro="true">
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-base leading-7 text-current/70">{description}</p>
          ) : null}
          {actions}
        </div>
        <div className={cn('flex w-full flex-col justify-between gap-10 lg:flex-row lg:gap-20')}>
          <div className="top-10 h-fit w-full space-y-7 py-8 lg:sticky lg:max-w-xs">
            <div className="relative h-[22.5rem] overflow-hidden">
              {previousService ? (
                <div className="absolute inset-0">
                  <Image fill alt={previousService.title ?? ''} className="object-cover" src={previousService.image} sizes="(max-width: 1024px) 100vw, 20rem" />
                </div>
              ) : null}
              <motion.div
                animate={{ clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'] }}
                initial={false}
                key={activeServiceIndex}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                className="relative h-full w-full"
              >
                <Image fill alt={activeService.title ?? ''} className="object-cover" src={activeService.image} sizes="(max-width: 1024px) 100vw, 20rem" />
              </motion.div>
            </div>
            {activeService ? (
              <>
                <p className="font-semibold tracking-tight text-current/20 uppercase">
                  {activeService.title}
                </p>
                <p className="text-base text-current/50">{activeService.description}</p>
              </>
            ) : null}
          </div>
          <div className={cn('relative w-full', alignmentClasses[contentAlignment])}>
            <ul className="w-full" data-services21-services-list="true">
              {items.map((service, index) => (
                <li
                  key={`${service.id}-${index}`}
                  onMouseEnter={() => setActiveServiceIndex(index)}
                  className={cn(
                    'cursor-pointer border-b border-foreground/20 py-8 text-3xl font-semibold tracking-tight md:text-5xl lg:text-7xl',
                    index === activeServiceIndex ? 'opacity-100' : 'opacity-20',
                  )}
                >
                  <span>{service.title}</span>
                  <sup className="align-super text-sm text-primary lg:text-3xl">{service.id}</sup>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export type { Services21Alignment, Services21Item, Services21Props }
