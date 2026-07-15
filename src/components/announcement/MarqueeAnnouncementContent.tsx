'use client'

import { Fragment, useMemo, useState } from 'react'

const DEFAULT_MARQUEE_DURATION_MS = 18000
const MIN_MARQUEE_DURATION_MS = 8000

type MarqueeAnnouncementItem = {
  description: string
  title?: string
  url?: string
}

export function MarqueeAnnouncementContent({
  durationMs,
  items,
}: {
  durationMs?: number | null
  items: MarqueeAnnouncementItem[]
}) {
  const [isPaused, setIsPaused] = useState(false)
  const sanitizedDuration = useMemo(
    () => Math.max(durationMs ?? DEFAULT_MARQUEE_DURATION_MS, MIN_MARQUEE_DURATION_MS),
    [durationMs],
  )

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className="min-w-0 flex-1 overflow-hidden py-0.5"
      data-testid="announcement-marquee"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex w-max min-w-full items-center">
        <MarqueeTrack animationDuration={sanitizedDuration} isPaused={isPaused} items={items} />
        <MarqueeTrack
          animationDuration={sanitizedDuration}
          duplicate
          isPaused={isPaused}
          items={items}
        />
      </div>
    </div>
  )
}

function MarqueeTrack({
  animationDuration,
  duplicate = false,
  isPaused,
  items,
}: {
  animationDuration: number
  duplicate?: boolean
  isPaused: boolean
  items: MarqueeAnnouncementItem[]
}) {
  return (
    <div
      aria-hidden={duplicate || undefined}
      className="flex shrink-0 animate-marquee items-center gap-4 whitespace-nowrap pr-4"
      data-testid="announcement-marquee-track"
      style={{
        animationDuration: `${animationDuration}ms`,
        animationPlayState: isPaused ? 'paused' : 'running',
      }}
    >
      {items.map((item, index) => (
        <Fragment
          key={`${duplicate ? 'duplicate' : 'primary'}-${item.url ?? item.description}-${index}`}
        >
          <MarqueeItem duplicate={duplicate} item={item} />
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-(--radius) bg-current/70"
          />
        </Fragment>
      ))}
    </div>
  )
}

function MarqueeItem({
  duplicate = false,
  item,
}: {
  duplicate?: boolean
  item: MarqueeAnnouncementItem
}) {
  const isExternalUrl = item.url?.startsWith('http://') || item.url?.startsWith('https://')

  if (item.url) {
    return (
      <a
        className="inline-flex items-center gap-x-2 transition-opacity hover:opacity-80"
        href={item.url}
        rel={isExternalUrl ? 'noreferrer' : undefined}
        tabIndex={duplicate ? -1 : undefined}
        target={isExternalUrl ? '_blank' : undefined}
      >
        {item.title ? <span className="font-medium">{item.title}</span> : null}
        {item.title ? (
          <span aria-hidden="true" className="text-current/70">
            —
          </span>
        ) : null}
        <span>{item.description}</span>
      </a>
    )
  }

  return (
    <div className="inline-flex items-center gap-x-2">
      {item.title ? <span className="font-medium">{item.title}</span> : null}
      {item.title ? (
        <span aria-hidden="true" className="text-current/70">
          —
        </span>
      ) : null}
      <span>{item.description}</span>
    </div>
  )
}
