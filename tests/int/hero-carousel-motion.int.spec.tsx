import { act } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const carouselHarness = vi.hoisted(() => {
  const autoplayController = {
    play: vi.fn(),
    stop: vi.fn(),
  }
  const autoplayFactory = vi.fn(() => ({ name: 'autoplay' }))
  const listeners = new Map<string, Set<() => void>>()
  let selectedIndex = 0
  let snapCount = 2

  const api = {
    off: vi.fn((event: string, listener: () => void) => {
      listeners.get(event)?.delete(listener)
      return api
    }),
    on: vi.fn((event: string, listener: () => void) => {
      const eventListeners = listeners.get(event) ?? new Set<() => void>()
      eventListeners.add(listener)
      listeners.set(event, eventListeners)
      return api
    }),
    plugins: vi.fn(() => ({ autoplay: autoplayController })),
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    scrollSnapList: vi.fn(() => Array.from({ length: snapCount }, (_, index) => index)),
    scrollTo: vi.fn(),
    selectedScrollSnap: vi.fn(() => selectedIndex),
  }

  return {
    api,
    autoplayController,
    autoplayFactory,
    emitSelection(index: number) {
      selectedIndex = index
      listeners.get('select')?.forEach((listener) => listener())
    },
    reset(count = 2) {
      selectedIndex = 0
      snapCount = count
      listeners.clear()
      autoplayController.play.mockClear()
      autoplayController.stop.mockClear()
      autoplayFactory.mockClear()
      api.off.mockClear()
      api.on.mockClear()
      api.plugins.mockClear()
      api.scrollNext.mockClear()
      api.scrollPrev.mockClear()
      api.scrollSnapList.mockClear()
      api.scrollTo.mockClear()
      api.selectedScrollSnap.mockClear()
    },
  }
})

vi.mock('embla-carousel-autoplay', () => ({
  default: carouselHarness.autoplayFactory,
}))

vi.mock('@/components/ui/carousel', async () => {
  const React = await import('react')

  return {
    Carousel: ({
      children,
      opts: _opts,
      plugins: _plugins,
      setApi,
      ...props
    }: HTMLAttributes<HTMLDivElement> & {
      children: ReactNode
      opts?: unknown
      plugins?: unknown
      setApi?: (api: typeof carouselHarness.api) => void
    }) => {
      React.useEffect(() => {
        setApi?.(carouselHarness.api)
      }, [setApi])

      return React.createElement('div', props, children)
    },
    CarouselContent: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
    CarouselItem: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
  }
})

import { HeroCarouselClient, type CarouselSlide } from '@/blocks/HeroCarousel/HeroCarouselClient'

let prefersReducedMotion = false
const motionPreferenceListeners = new Set<() => void>()

const imageSlides: CarouselSlide[] = [
  { backgroundImageAlt: 'First image', backgroundImageSrc: '/first.jpg', id: 'first' },
  { backgroundImageAlt: 'Second image', backgroundImageSrc: '/second.jpg', id: 'second' },
]

function setReducedMotion(reduced: boolean) {
  act(() => {
    prefersReducedMotion = reduced
    motionPreferenceListeners.forEach((listener) => listener())
  })
}

describe('HeroCarouselClient motion', () => {
  let pauseSpy: ReturnType<typeof vi.spyOn>
  let playSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    prefersReducedMotion = false
    motionPreferenceListeners.clear()
    carouselHarness.reset()
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener: (_event: string, listener: () => void) =>
          motionPreferenceListeners.add(listener),
        get matches() {
          return prefersReducedMotion
        },
        media: '(prefers-reduced-motion: reduce)',
        removeEventListener: (_event: string, listener: () => void) =>
          motionPreferenceListeners.delete(listener),
      })),
    )
    playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
  })

  afterEach(() => {
    cleanup()
    playSpy.mockRestore()
    pauseSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('starts Embla explicitly and persists the visitor pause choice', async () => {
    render(<HeroCarouselClient autoplay slides={imageSlides} />)

    await waitFor(() => expect(carouselHarness.autoplayController.play).toHaveBeenCalled())
    expect(carouselHarness.autoplayFactory).toHaveBeenCalledWith({
      delay: 6000,
      playOnInit: false,
      stopOnInteraction: false,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pause hero motion' }))

    expect(carouselHarness.autoplayController.stop).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Play hero motion' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Play hero motion' }))

    await waitFor(() => expect(carouselHarness.autoplayController.play).toHaveBeenCalledTimes(2))
  })

  it('keeps pointer and focus pauses independent', async () => {
    render(<HeroCarouselClient autoplay slides={imageSlides} />)

    await waitFor(() => expect(carouselHarness.autoplayController.play).toHaveBeenCalled())
    carouselHarness.autoplayController.play.mockClear()
    carouselHarness.autoplayController.stop.mockClear()

    const hero = screen.getByTestId('hero-carousel')
    const nextButton = screen.getByRole('button', { name: 'Next slide' })

    fireEvent.pointerEnter(hero)
    fireEvent.focus(nextButton)
    fireEvent.pointerLeave(hero)

    expect(carouselHarness.autoplayController.stop).toHaveBeenCalled()
    expect(carouselHarness.autoplayController.play).not.toHaveBeenCalled()

    fireEvent.blur(nextButton, { relatedTarget: null })

    await waitFor(() => expect(carouselHarness.autoplayController.play).toHaveBeenCalled())
  })

  it('suppresses automatic motion but retains manual navigation under reduced motion', async () => {
    prefersReducedMotion = true
    render(<HeroCarouselClient autoplay slides={imageSlides} />)

    await waitFor(() => expect(carouselHarness.autoplayController.stop).toHaveBeenCalled())

    expect(carouselHarness.autoplayController.play).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /hero motion/i })).toBeNull()
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeTruthy()
  })

  it('keeps the motion control available when dots are hidden', async () => {
    render(<HeroCarouselClient autoplay showDots={false} slides={imageSlides} />)

    expect(await screen.findByRole('button', { name: 'Pause hero motion' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Go to slide/i })).toBeNull()
  })

  it('controls a single background video independently of slide autoplay', async () => {
    carouselHarness.reset(1)
    render(
      <HeroCarouselClient
        autoplay={false}
        slides={[{ backgroundVideoUrl: '/single.mp4', id: 'video' }]}
      />,
    )

    expect(await screen.findByRole('button', { name: 'Pause hero motion' })).toBeTruthy()
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'Pause hero motion' }))

    expect(pauseSpy).toHaveBeenCalled()
    expect(carouselHarness.autoplayController.play).not.toHaveBeenCalled()
  })

  it('plays only the selected video and pauses the previous slide', async () => {
    render(
      <HeroCarouselClient
        autoplay={false}
        slides={[
          { backgroundVideoUrl: '/first.mp4', id: 'first-video' },
          { backgroundVideoUrl: '/second.mp4', id: 'second-video' },
        ]}
      />,
    )

    const videos = document.querySelectorAll('video')
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1))
    expect(playSpy.mock.instances[0]).toBe(videos[0])

    act(() => carouselHarness.emitSelection(1))

    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(2))
    expect(pauseSpy.mock.instances).toContain(videos[0])
    expect(playSpy.mock.instances[1]).toBe(videos[1])
  })

  it('handles rejected video playback and cleans up on unmount', async () => {
    playSpy.mockRejectedValueOnce(new Error('Playback blocked'))
    const view = render(
      <HeroCarouselClient autoplay slides={[{ backgroundVideoUrl: '/video.mp4', id: 'video' }]} />,
    )

    await waitFor(() => expect(playSpy).toHaveBeenCalled())

    expect(screen.getByTestId('hero-carousel')).toBeTruthy()

    const stopCallsBeforeUnmount = carouselHarness.autoplayController.stop.mock.calls.length
    const pauseCallsBeforeUnmount = pauseSpy.mock.calls.length
    view.unmount()

    expect(carouselHarness.autoplayController.stop.mock.calls.length).toBeGreaterThan(
      stopCallsBeforeUnmount,
    )
    expect(pauseSpy.mock.calls.length).toBeGreaterThan(pauseCallsBeforeUnmount)
  })

  it('stops active slide and video motion when preference changes after mount', async () => {
    render(
      <HeroCarouselClient
        autoplay
        slides={[
          { backgroundVideoUrl: '/video.mp4', id: 'video' },
          { backgroundImageAlt: 'Second image', backgroundImageSrc: '/second.jpg', id: 'second' },
        ]}
      />,
    )

    await waitFor(() => {
      expect(carouselHarness.autoplayController.play).toHaveBeenCalled()
      expect(playSpy).toHaveBeenCalled()
    })

    setReducedMotion(true)

    expect(carouselHarness.autoplayController.stop).toHaveBeenCalled()
    expect(pauseSpy).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /hero motion/i })).toBeNull()
  })
})
