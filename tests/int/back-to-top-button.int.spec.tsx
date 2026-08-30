import fs from 'node:fs'
import path from 'node:path'
import { act } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BackToTopButton } from '@/components/global/BackToTopButton'

let animationFrames: FrameRequestCallback[]

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value })
}

function flushAnimationFrame() {
  const callbacks = animationFrames.splice(0)
  act(() => callbacks.forEach((callback) => callback(0)))
}

describe('BackToTopButton', () => {
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    animationFrames = []
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    setScrollY(0)
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        animationFrames.push(callback)
        return animationFrames.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('scrollTo', vi.fn())
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reveals after one viewport and hides the inactive control from interaction', () => {
    const { container } = render(<BackToTopButton />)
    const button = container.querySelector('[data-back-to-top="true"]') as HTMLButtonElement

    expect(button.getAttribute('aria-hidden')).toBe('true')
    expect(button.tabIndex).toBe(-1)

    setScrollY(800)
    fireEvent.scroll(window)
    flushAnimationFrame()

    expect(screen.getByRole('button', { name: 'Back to top' })).toBe(button)
    expect(button.getAttribute('aria-hidden')).toBeNull()
    expect(button.tabIndex).toBe(0)
  })

  it('uses smooth scrolling unless reduced motion is requested', () => {
    const { rerender } = render(<BackToTopButton />)
    const button = document.querySelector('[data-back-to-top="true"]') as HTMLButtonElement

    fireEvent.click(button)
    expect(window.scrollTo).toHaveBeenLastCalledWith({ behavior: 'smooth', top: 0 })

    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList)
    rerender(<BackToTopButton />)
    fireEvent.click(button)

    expect(window.scrollTo).toHaveBeenLastCalledWith({ behavior: 'auto', top: 0 })
  })

  it('uses the shared themed control and mobile safe-area positioning', () => {
    const { container } = render(<BackToTopButton />)
    const button = container.querySelector('[data-back-to-top="true"]') as HTMLButtonElement

    expect(button.dataset.slot).toBe('button')
    expect(button.className).toContain('z-40')
    expect(button.className).toContain('size-11')
    expect(button.className).toContain('env(safe-area-inset-bottom)')
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('removes global listeners and a queued frame on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const view = render(<BackToTopButton />)

    fireEvent.scroll(window)
    view.unmount()

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })

  it('is mounted once in the public frontend layout', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/(frontend)/layout.tsx'),
      'utf8',
    )

    expect(source).toContain(
      "import { BackToTopButton } from '@/components/global/BackToTopButton'",
    )
    expect(source.match(/<BackToTopButton \/>/g)).toHaveLength(1)
  })
})
