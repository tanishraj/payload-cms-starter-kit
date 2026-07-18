import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FeatureSpotlightBlockComponent } from '@/blocks/FeatureSpotlight/Component'
import { FeatureSpotlightBlock } from '@/blocks/FeatureSpotlight/config'

describe('feature spotlight block', () => {
  it('uses the canonical Payload identity', () => {
    expect(FeatureSpotlightBlock.slug).toBe('featureSpotlight')
    expect(FeatureSpotlightBlock.interfaceName).toBe('FeatureSpotlightBlock')
    expect(FeatureSpotlightBlock.labels).toEqual({
      singular: 'Feature Spotlight',
      plural: 'Feature Spotlights',
    })
  })

  it('renders image-right layout with a text link CTA', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        actionMode: 'link',
        actions: [
          { label: 'See all programs', linkType: 'custom', url: '/programs' },
          { label: 'Compare pathways', linkType: 'custom', url: '/pathways' },
        ],
        appearance: {
          background: 'muted',
          border: 'bottom',
          textColor: 'auto',
        },
        contentVerticalAlignment: 'top',
        description: 'Choose from MD, MD-PhD, and specialized tracks.',
        eyebrow: 'Programs',
        image: { alt: 'Students in clinic', url: '/media/programs.jpg' } as never,
        imagePosition: 'right',
        layoutMode: 'split',
        mediaPosition: 'right',
        title: 'Four years. Six pathways. One physician.',
      }),
    )

    expect(html).toContain('data-feature-spotlight-position="right"')
    expect(html).toContain('data-feature-spotlight-content-vertical-alignment="top"')
    expect(html).toContain('data-feature-spotlight-image-position="right"')
    expect(html).toContain('data-feature-spotlight-layout="split"')
    expect(html).toContain('data-feature-spotlight-action-mode="link"')
    expect(html).toContain('data-action-mode="link"')
    expect(html).toContain('data-feature-spotlight-background="muted"')
    expect(html).toContain('data-feature-spotlight-actions="true"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('href="/pathways"')
    expect(html).toContain('See all programs')
    expect(html).toContain('Compare pathways')
    expect(html).toContain('lucide-arrow-right')
    expect(html).toContain('bg-muted')
    expect(html).toContain('border-b border-border')
    expect(html).toContain('text-muted-foreground')
    expect(html).toContain('text-3xl font-semibold tracking-tight')
    expect(html).toContain('hover:underline')
    expect(html).toContain('border border-border')
    expect(html).toContain('flex min-h-full flex-col justify-start')
  })

  it('renders muted background and two CTA buttons', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        actionMode: 'button',
        actions: [
          {
            label: 'Start your application',
            linkType: 'custom',
            url: '/apply',
            variant: 'default',
          },
          { label: 'Schedule a visit', linkType: 'custom', url: '/visit', variant: 'secondary' },
        ],
        appearance: {
          background: 'accent',
          border: 'top',
          textColor: 'auto',
        },
        description: 'Applications for the Class of 2030 open August 1.',
        image: { alt: 'Clinical team', url: '/media/apply.jpg' } as never,
        imagePosition: 'top',
        layoutMode: 'split',
        mediaPosition: 'left',
        title: 'Ready to begin?',
      }),
    )

    expect(html).toContain('data-feature-spotlight-background="accent"')
    expect(html).toContain('data-feature-spotlight-action-mode="button"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-variant="default"')
    expect(html).toContain('data-action-variant="secondary"')
    expect(html).toContain('href="/apply"')
    expect(html).toContain('href="/visit"')
    expect(html).toContain('bg-accent')
    expect(html).toContain('text-accent-foreground')
    expect(html).toContain('border-t border-border')
    expect(html).toContain('border border-border')
    expect(html).toContain('object-[center_top]')
  })

  it('renders centered content-only layout without an image', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        actionMode: 'link',
        actions: [{ label: 'Start your application', linkType: 'custom', url: '/apply' }],
        description: 'Applications for the Class of 2030 open August 1.',
        layoutMode: 'contentOnly',
        size: 'compact',
        title: 'Ready to begin?',
      }),
    )

    expect(html).toContain('data-feature-spotlight-layout="contentOnly"')
    expect(html).toContain('data-feature-spotlight-position="contentOnly"')
    expect(html).toContain('data-feature-spotlight-size="compact"')
    expect(html).toContain('py-10')
    expect(html).toContain('md:py-10')
    expect(html).toContain('href="/apply"')
    expect(html).not.toContain('<img')
  })

  it('supports edge-to-edge media fill while keeping content contained', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        actionMode: 'link',
        actions: [{ label: 'Explore facilities', linkType: 'custom', url: '/facilities' }],
        contentVerticalAlignment: 'bottom',
        description: 'Train with faculty mentors across clinics, labs, and simulation spaces.',
        image: { alt: 'Simulation lab', url: '/media/sim-lab.jpg' } as never,
        imagePosition: 'bottom',
        layoutMode: 'split',
        mediaFillMode: 'edgeToEdge',
        mediaPosition: 'left',
        size: 'comfortable',
        title: 'Built for immersive study.',
      }),
    )

    expect(html).toContain('data-feature-spotlight-layout="split"')
    expect(html).toContain('data-feature-spotlight-position="left"')
    expect(html).toContain('data-feature-spotlight-image-position="bottom"')
    expect(html).toContain('data-feature-spotlight-content-vertical-alignment="bottom"')
    expect(html).toContain('data-feature-spotlight-media-fill="edgeToEdge"')
    expect(html).toContain('data-feature-spotlight-media-frame="edgeToEdge"')
    expect(html).toContain('data-feature-spotlight-size="comfortable"')
    expect(html).toContain('min-h-[30rem]')
    expect(html).toContain('md:min-h-[40rem]')
    expect(html).toContain('min-h-80')
    expect(html).toContain(
      'relative aspect-[4/3] overflow-hidden md:min-h-full md:aspect-auto',
    )
    expect(html).toContain('py-16')
    expect(html).toContain('md:py-16')
    expect(html).toContain('flex min-h-full flex-col justify-end')
    expect(html).toContain('absolute inset-0 size-full object-cover')
    expect(html).toContain('object-[center_bottom]')
    expect(html).not.toContain('rounded-xl border border-border bg-muted/20')
  })

  it('aligns image-right edge-to-edge content with the website container gutter', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        contentVerticalAlignment: 'center',
        description: 'Train with faculty mentors across clinics, labs, and simulation spaces.',
        image: { alt: 'Simulation lab', url: '/media/sim-lab.jpg' } as never,
        layoutMode: 'split',
        mediaFillMode: 'edgeToEdge',
        mediaPosition: 'right',
        size: 'default',
        title: 'Built for immersive study.',
      }),
    )

    expect(html).toContain('data-feature-spotlight-position="right"')
    expect(html).toContain('data-feature-spotlight-media-fill="edgeToEdge"')
    expect(html).toContain('min-h-72')
    expect(html).toContain('ml-auto h-full w-full max-w-[calc(var(--breakpoint-2xl)/2)] pl-4')
    expect(html).toContain(
      'flex min-h-full flex-col justify-center py-12 pr-4 md:py-12 md:pr-8 lg:pr-12',
    )
    expect(html).toContain('w-full max-w-xl text-left mr-auto')
  })

  it('supports contained-fill media while keeping the layout inside the normal container', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        actionMode: 'link',
        actions: [{ label: 'Explore facilities', linkType: 'custom', url: '/facilities' }],
        contentVerticalAlignment: 'top',
        description: 'Train with faculty mentors across clinics, labs, and simulation spaces.',
        image: { alt: 'Simulation lab', url: '/media/sim-lab.jpg' } as never,
        imagePosition: 'center',
        layoutMode: 'split',
        mediaFillMode: 'containedFill',
        mediaPosition: 'left',
        size: 'comfortable',
        title: 'Built for immersive study.',
      }),
    )

    expect(html).toContain('data-feature-spotlight-layout="split"')
    expect(html).toContain('data-feature-spotlight-position="left"')
    expect(html).toContain('data-feature-spotlight-image-position="center"')
    expect(html).toContain('data-feature-spotlight-content-vertical-alignment="top"')
    expect(html).toContain('data-feature-spotlight-media-fill="containedFill"')
    expect(html).toContain('data-feature-spotlight-media-frame="containedFill"')
    expect(html).toContain('data-feature-spotlight-size="comfortable"')
    expect(html).toContain('mx-auto max-w-screen-2xl px-0 md:px-4')
    expect(html).toContain('min-h-[30rem]')
    expect(html).toContain('md:min-h-[40rem]')
    expect(html).toContain('relative aspect-[4/3] overflow-hidden md:h-full md:aspect-auto')
    expect(html).toContain('absolute inset-0 size-full object-cover')
    expect(html).toContain('object-[center_center]')
    expect(html).toContain(
      'flex min-h-full flex-col justify-start px-4 py-16 md:px-8 md:py-16 lg:px-12',
    )
    expect(html).not.toContain('rounded-xl border border-border bg-muted/20')
  })

  it('aligns image-right contained-fill content with the website container gutter', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureSpotlightBlockComponent, {
        contentVerticalAlignment: 'center',
        description: 'Train with faculty mentors across clinics, labs, and simulation spaces.',
        image: { alt: 'Simulation lab', url: '/media/sim-lab.jpg' } as never,
        layoutMode: 'split',
        mediaFillMode: 'containedFill',
        mediaPosition: 'right',
        size: 'default',
        title: 'Built for immersive study.',
      }),
    )

    expect(html).toContain('data-feature-spotlight-position="right"')
    expect(html).toContain('data-feature-spotlight-media-fill="containedFill"')
    expect(html).toContain('mx-auto max-w-screen-2xl px-0 md:px-4')
    expect(html).toContain(
      'flex min-h-full flex-col justify-center py-12 pr-4 md:py-12 md:pr-8 lg:pr-12',
    )
    expect(html).not.toContain(
      'flex min-h-full flex-col justify-center px-4 py-12 md:px-8 md:py-12 lg:px-12',
    )
  })
})
