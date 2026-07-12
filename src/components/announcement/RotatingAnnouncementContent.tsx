'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_INTERVAL_MS = 4000
const MIN_INTERVAL_MS = 2000
const TRANSITION_MS = 320

type RotatingAnnouncementItem = {
  description: string
  title?: string
  url?: string
}

export function RotatingAnnouncementContent({
  intervalMs,
  items,
}: {
  intervalMs?: number | null
  items: RotatingAnnouncementItem[]
}) {
  const sanitizedInterval = useMemo(
    () => Math.max(intervalMs ?? DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS),
    [intervalMs],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const currentIndexRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  useEffect(() => {
    if (isPaused || items.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % items.length

      setPreviousIndex(currentIndexRef.current)
      setCurrentIndex(nextIndex)
      currentIndexRef.current = nextIndex

      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setPreviousIndex(null)
        timeoutRef.current = null
      }, TRANSITION_MS)
    }, sanitizedInterval)

    return () => {
      window.clearInterval(intervalId)

      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isPaused, items.length, sanitizedInterval])

  const safeCurrentIndex = currentIndex % items.length
  const safePreviousIndex = previousIndex != null ? previousIndex % items.length : null
  const currentItem = items[safeCurrentIndex]
  const previousItem = safePreviousIndex != null ? items[safePreviousIndex] : null

  if (!previousItem) {
    return (
      <div
        className="min-w-0 flex-1 py-0.5"
        data-testid="announcement-rotator"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnnouncementItem item={currentItem} />
      </div>
    )
  }

  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden py-0.5"
      data-testid="announcement-rotator"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div aria-hidden="true" className="invisible">
        <AnnouncementItem item={currentItem} />
      </div>
      {previousItem ? (
        <div
          className="animate-out fade-out slide-out-to-top-2 absolute inset-0"
          style={{ animationDuration: `${TRANSITION_MS}ms` }}
        >
          <AnnouncementItem item={previousItem} />
        </div>
      ) : null}
      <div
        className="animate-in fade-in slide-in-from-bottom-2 absolute inset-0"
        style={previousItem ? { animationDuration: `${TRANSITION_MS}ms` } : undefined}
      >
        <AnnouncementItem item={currentItem} />
      </div>
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
        <span aria-hidden="true" className="shrink-0 text-primary-foreground/70">
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
