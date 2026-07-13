import { createElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MarqueeAnnouncementContent } from '@/components/announcement/MarqueeAnnouncementContent'

describe('marquee announcement content', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders clickable announcement items and duplicate marquee tracks', () => {
    render(
      createElement(MarqueeAnnouncementContent, {
        durationMs: 18000,
        items: [
          { description: 'First marquee item', title: 'First title', url: '/first' },
          { description: 'Second marquee item', url: '/second' },
        ],
      }),
    )

    const marquee = screen.getByTestId('announcement-marquee')
    const tracks = screen.getAllByTestId('announcement-marquee-track')
    const links = screen.getAllByRole('link')

    expect(marquee).toBeTruthy()
    expect(tracks).toHaveLength(2)
    expect(links).toHaveLength(2)
    expect(links[0]?.getAttribute('href')).toBe('/first')
    expect(links[1]?.getAttribute('href')).toBe('/second')
  })

  it('pauses marquee animation while hovered', () => {
    render(
      createElement(MarqueeAnnouncementContent, {
        durationMs: 18000,
        items: [{ description: 'Hover pause item', url: '/hover' }],
      }),
    )

    const marquee = screen.getByTestId('announcement-marquee')
    const [primaryTrack] = screen.getAllByTestId('announcement-marquee-track')

    expect(primaryTrack.getAttribute('style')).toContain('animation-play-state: running')

    fireEvent.mouseEnter(marquee)
    expect(primaryTrack.getAttribute('style')).toContain('animation-play-state: paused')

    fireEvent.mouseLeave(marquee)
    expect(primaryTrack.getAttribute('style')).toContain('animation-play-state: running')
  })
})
