import { act } from 'react'
import { createElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RotatingAnnouncementContent } from '@/components/announcement/RotatingAnnouncementContent'

describe('rotating announcement content', () => {
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
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
})
