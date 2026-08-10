'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const DEFAULT_INTERVAL_MS = 4000
const MIN_INTERVAL_MS = 2000
const TRANSITION_DURATION_SECONDS = 0.16

type RotatingAnnouncementItem = {
  description: string
  title?: string
  url?: string
}

export type RotatingAnnouncementMode = 'horizontal' | 'vertical'

export function RotatingAnnouncementContent({
  intervalMs,
  items,
  mode = 'vertical',
}: {
  intervalMs?: number | null
  items: RotatingAnnouncementItem[]
  mode?: RotatingAnnouncementMode
}) {
  const sanitizedInterval = useMemo(
    () => Math.max(intervalMs ?? DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS),
    [intervalMs],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (isPaused || items.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % items.length)
    }, sanitizedInterval)

    return () => window.clearInterval(intervalId)
  }, [isPaused, items.length, sanitizedInterval])

  const safeCurrentIndex = currentIndex % items.length
  const currentItem = items[safeCurrentIndex]
  const initialOffset = mode === 'horizontal' ? { x: 8, y: 0 } : { x: 0, y: 8 }
  const exitOffset = mode === 'horizontal' ? { x: -8, y: 0 } : { x: 0, y: -8 }
  const motionDisabled = prefersReducedMotion === true

  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden py-0.5"
      data-testid="announcement-rotator"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={safeCurrentIndex}
          animate={{ opacity: 1, x: 0, y: 0 }}
          data-testid="announcement-item"
          exit={motionDisabled ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...exitOffset }}
          initial={motionDisabled ? false : { opacity: 0, ...initialOffset }}
          transition={{
            duration: motionDisabled ? 0 : TRANSITION_DURATION_SECONDS,
            ease: 'easeOut',
          }}
        >
          <AnnouncementItem item={currentItem} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function AnnouncementItem({ item }: { item: RotatingAnnouncementItem }) {
  const isExternalUrl = item.url?.startsWith('http://') || item.url?.startsWith('https://')

  return (
    <div className="flex min-h-full min-w-0 items-center gap-x-2 whitespace-nowrap">
      {item.title ? (
        <span className="max-w-[40%] shrink truncate font-medium">{item.title}</span>
      ) : null}
      {item.title ? (
        <span aria-hidden="true" className="shrink-0 text-current/70">
          —
        </span>
      ) : null}
      {item.url ? (
        <a
          className="min-w-0 flex-1 truncate transition-opacity hover:opacity-80"
          href={item.url}
          rel={isExternalUrl ? 'noreferrer' : undefined}
          target={isExternalUrl ? '_blank' : undefined}
        >
          {item.description}
        </a>
      ) : (
        <p className="min-w-0 flex-1 truncate">{item.description}</p>
      )}
    </div>
  )
}
