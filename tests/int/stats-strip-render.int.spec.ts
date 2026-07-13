import { act, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnimatedMetricValue } from '@/blocks/StatsStrip/AnimatedMetricValue'
import { StatsStripBlockComponent } from '@/blocks/StatsStrip/Component'

describe('stats strip block', () => {
  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.unstubAllGlobals()
    vi.useRealTimers()
    cleanup()
  })

  it('renders items sequentially across rows and adds a divider before later rows', () => {
    const html = renderToStaticMarkup(
      createElement(StatsStripBlockComponent, {
        backgroundStyle: 'accent',
        items: [
          { label: 'Years of training physicians', value: 112 },
          { label: 'Student-to-faculty ratio', suffix: ':1', value: 9 },
          { label: 'Annual research funding', prefix: '$', suffix: 'M', value: 186 },
          { label: 'Residency match rate', suffix: '%', value: 96 },
          { label: 'Clinical sites', value: 14 },
          { label: 'Successful operations', suffix: 'K', value: 40 },
        ],
      }),
    )

    expect(html).toContain('data-stats-strip-background="accent"')
    expect(html).toContain('data-stats-strip-row="0"')
    expect(html).toContain('data-stats-strip-row="1"')
    expect(html).toContain('data-stats-strip-row-size="4"')
    expect(html).toContain('data-stats-strip-row-size="2"')
    expect(html).toContain('data-stats-strip-row-divider="true"')
    expect(html).toContain('Years of training physicians')
    expect(html).toContain('Student-to-faculty ratio')
    expect(html.indexOf('Clinical sites')).toBeLessThan(html.indexOf('Successful operations'))
  })

  it('applies the mobile right divider only to the first item in each two-column mobile row', () => {
    const { container } = render(
      createElement(StatsStripBlockComponent, {
        items: [
          { label: 'Current students', value: 750 },
          { label: 'Available seats', value: 300 },
          { label: 'Experienced faculties', value: 300 },
          { label: 'Successful operations', suffix: 'K', value: 40 },
        ],
      }),
    )

    const articles = Array.from(container.querySelectorAll('article'))

    expect(articles).toHaveLength(4)
    expect(articles[0]?.className).toContain('border-r')
    expect(articles[1]?.className).not.toContain('border-r border-border/60')
    expect(articles[2]?.className).toContain('border-r')
    expect(articles[3]?.className).not.toContain('border-r border-border/60')
  })

  it('animates only the numeric value and preserves prefix and suffix', () => {
    const observerCallback = vi.fn()

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback.mockImplementation(() =>
          callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as never),
        )
      }

      disconnect() {}

      observe() {
        observerCallback()
      }

      unobserve() {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as never)
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    )

    render(
      createElement(AnimatedMetricValue, {
        durationMs: 1200,
        prefix: '$',
        suffix: 'M',
        triggerOnce: true,
        value: 186,
      }),
    )

    expect(screen.getByTestId('stats-strip-value').textContent).toBe('$0M')

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId('stats-strip-value').textContent).toBe('$186M')
  })

  it('renders the final value immediately when reduced motion is enabled', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    )

    render(
      createElement(AnimatedMetricValue, {
        durationMs: 1200,
        suffix: '%',
        triggerOnce: true,
        value: 96,
      }),
    )

    expect(screen.getByTestId('stats-strip-value').textContent).toBe('96%')
  })
})
