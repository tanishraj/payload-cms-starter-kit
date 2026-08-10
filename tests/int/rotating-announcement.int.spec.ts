import { act } from 'react'
import { createElement } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const motionPreferences = vi.hoisted(() => ({ reduced: false }))

vi.mock('framer-motion', async () => {
  const React = await import('react')

  return {
    AnimatePresence: ({ children, mode }: { children: ReactNode; mode?: string }) =>
      React.createElement('div', { 'data-presence-mode': mode }, children),
    motion: {
      div: React.forwardRef<
        HTMLDivElement,
        HTMLAttributes<HTMLDivElement> & {
          animate?: unknown
          exit?: unknown
          initial?: unknown
          transition?: { duration?: number }
        }
      >(function MotionDiv(
        { animate: _animate, exit: _exit, initial: _initial, transition, ...props },
        ref,
      ) {
        return React.createElement('div', {
          ...props,
          'data-duration': transition?.duration,
          ref,
        })
      }),
    },
    useReducedMotion: () => motionPreferences.reduced,
  }
})

import { RotatingAnnouncementContent } from '@/components/announcement/RotatingAnnouncementContent'

describe('rotating announcement content', () => {
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    motionPreferences.reduced = false
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    cleanup()
  })

  it('renders a single item without advancing away from it', () => {
    render(
      createElement(RotatingAnnouncementContent, {
        intervalMs: 4000,
        items: [{ description: 'One description', url: '/one' }],
      }),
    )

    expect(screen.getByText('One description')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'One description' }).getAttribute('href')).toBe('/one')

    act(() => {
      vi.advanceTimersByTime(8000)
    })

    expect(screen.getByText('One description')).toBeTruthy()
  })

  it('rotates through multiple items one at a time', () => {
    render(
      createElement(RotatingAnnouncementContent, {
        intervalMs: 2000,
        items: [
          { description: 'First description', title: 'First title' },
          { description: 'Second description', title: 'Second title' },
        ],
      }),
    )

    expect(screen.getByText('First title')).toBeTruthy()
    expect(screen.getByText('First description')).toBeTruthy()

    act(() => {
      vi.advanceTimersByTime(2325)
    })

    expect(screen.getByText('Second title')).toBeTruthy()
    expect(screen.getByText('Second description')).toBeTruthy()
    expect(screen.queryByText('First title')).toBeNull()
    expect(screen.queryByText('First description')).toBeNull()
  })

  it('uses wait-mode presence and renders one announcement layer', () => {
    const { container } = render(
      createElement(RotatingAnnouncementContent, {
        intervalMs: 2000,
        items: [
          { description: 'First description', title: 'First title' },
          { description: 'Second description', title: 'Second title' },
        ],
      }),
    )

    expect(container.querySelector('[data-presence-mode="wait"]')).toBeTruthy()
    expect(screen.getAllByTestId('announcement-item')).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getAllByTestId('announcement-item')).toHaveLength(1)
  })

  it('pauses rotation while hovered and resumes after hover ends', () => {
    render(
      createElement(RotatingAnnouncementContent, {
        intervalMs: 2000,
        items: [
          { description: 'First description', title: 'First title' },
          { description: 'Second description', title: 'Second title' },
        ],
      }),
    )

    const rotator = screen.getByTestId('announcement-rotator')

    act(() => {
      fireEvent.mouseEnter(rotator)
    })

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.queryByText('Second title')).toBeNull()
    expect(screen.queryByText('Second description')).toBeNull()

    act(() => {
      fireEvent.mouseLeave(rotator)
    })

    act(() => {
      vi.advanceTimersByTime(2325)
    })

    expect(screen.getByText('Second title')).toBeTruthy()
    expect(screen.getByText('Second description')).toBeTruthy()
  })

  it('supports horizontal transitions with the same one-at-a-time rotation model', () => {
    render(
      createElement(RotatingAnnouncementContent, {
        intervalMs: 2000,
        items: [
          { description: 'First horizontal description', title: 'First horizontal title' },
          { description: 'Second horizontal description', title: 'Second horizontal title' },
        ],
        mode: 'horizontal',
      }),
    )

    expect(screen.getByText('First horizontal title')).toBeTruthy()

    act(() => {
      vi.advanceTimersByTime(2325)
    })

    expect(screen.getByText('Second horizontal title')).toBeTruthy()
    expect(screen.getByText('Second horizontal description')).toBeTruthy()
    expect(screen.queryByText('First horizontal title')).toBeNull()
  })

  it('disables transition duration when reduced motion is preferred', () => {
    motionPreferences.reduced = true

    render(
      createElement(RotatingAnnouncementContent, {
        items: [
          { description: 'First description' },
          { description: 'Second description' },
        ],
      }),
    )

    expect(screen.getByTestId('announcement-item').getAttribute('data-duration')).toBe('0')
  })
})
