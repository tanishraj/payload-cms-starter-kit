import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SplitFeatureBlockComponent } from '@/blocks/SplitFeature/Component'

describe('split feature block', () => {
  it('renders image-right layout with a text link CTA', () => {
    const html = renderToStaticMarkup(
      createElement(SplitFeatureBlockComponent, {
        appearance: {
          background: 'muted',
          border: 'bottom',
          textColor: 'auto',
        },
        contentVerticalAlignment: 'top',
        ctaMode: 'link',
        description: 'Choose from MD, MD-PhD, and specialized tracks.',
        eyebrow: 'Programs',
        image: { alt: 'Students in clinic', url: '/media/programs.jpg' } as never,
        imagePosition: 'right',
        layoutMode: 'split',
        linkLabel: 'See all programs',
        linkType: 'custom',
        mediaPosition: 'right',
        title: 'Four years. Six pathways. One physician.',
        url: '/programs',
      }),
    )

    expect(html).toContain('data-split-feature-position="right"')
    expect(html).toContain('data-split-feature-content-vertical-alignment="top"')
    expect(html).toContain('data-split-feature-image-position="right"')
    expect(html).toContain('data-split-feature-layout="split"')
    expect(html).toContain('data-split-feature-cta="link"')
    expect(html).toContain('data-split-feature-background="muted"')
    expect(html).toContain('data-split-feature-link-cta="true"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('See all programs')
    expect(html).toContain('lucide-arrow-right')
    expect(html).toContain('bg-muted')
    expect(html).toContain('border-b border-border')
    expect(html).toContain('text-muted-foreground')
    expect(html).toContain('font-heading')
    expect(html).toContain('hover:underline')
    expect(html).toContain('border border-border')
    expect(html).toContain('flex min-h-full flex-col justify-start')
  })

  it('renders muted background and two CTA buttons', () => {
    const html = renderToStaticMarkup(
      createElement(SplitFeatureBlockComponent, {
        appearance: {
          background: 'accent',
          border: 'top',
          textColor: 'auto',
        },
        buttons: [
          { label: 'Start your application', linkType: 'custom', url: '/apply', variant: 'default' },
          { label: 'Schedule a visit', linkType: 'custom', url: '/visit', variant: 'secondary' },
        ] as never,
        ctaMode: 'buttons',
        description: 'Applications for the Class of 2030 open August 1.',
        image: { alt: 'Clinical team', url: '/media/apply.jpg' } as never,
        imagePosition: 'top',
        layoutMode: 'split',
        mediaPosition: 'left',
        title: 'Ready to begin?',
      }),
    )

    expect(html).toContain('data-split-feature-background="accent"')
    expect(html).toContain('data-split-feature-cta="buttons"')
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
      createElement(SplitFeatureBlockComponent, {
        ctaMode: 'link',
        description: 'Applications for the Class of 2030 open August 1.',
        layoutMode: 'contentOnly',
        linkLabel: 'Start your application',
        linkType: 'custom',
        size: 'compact',
        title: 'Ready to begin?',
        url: '/apply',
      }),
    )

    expect(html).toContain('data-split-feature-layout="contentOnly"')
    expect(html).toContain('data-split-feature-position="contentOnly"')
    expect(html).toContain('data-split-feature-size="compact"')
    expect(html).toContain('py-10')
    expect(html).toContain('md:py-10')
    expect(html).toContain('href="/apply"')
    expect(html).not.toContain('<img')
  })

  it('supports edge-to-edge media fill while keeping content contained', () => {
    const html = renderToStaticMarkup(
      createElement(SplitFeatureBlockComponent, {
        ctaMode: 'link',
        contentVerticalAlignment: 'bottom',
        description: 'Train with faculty mentors across clinics, labs, and simulation spaces.',
        image: { alt: 'Simulation lab', url: '/media/sim-lab.jpg' } as never,
        imagePosition: 'bottom',
        layoutMode: 'split',
        linkLabel: 'Explore facilities',
        linkType: 'custom',
        mediaFillMode: 'edgeToEdge',
        mediaPosition: 'left',
        size: 'comfortable',
        title: 'Built for immersive study.',
        url: '/facilities',
      }),
    )

    expect(html).toContain('data-split-feature-layout="split"')
    expect(html).toContain('data-split-feature-position="left"')
    expect(html).toContain('data-split-feature-image-position="bottom"')
    expect(html).toContain('data-split-feature-content-vertical-alignment="bottom"')
    expect(html).toContain('data-split-feature-media-fill="edgeToEdge"')
    expect(html).toContain('data-split-feature-media-frame="edgeToEdge"')
    expect(html).toContain('data-split-feature-size="comfortable"')
    expect(html).toContain('min-h-[30rem]')
    expect(html).toContain('md:min-h-[40rem]')
    expect(html).toContain('relative min-h-full overflow-hidden')
    expect(html).toContain('py-16')
    expect(html).toContain('md:py-16')
    expect(html).toContain('flex min-h-full flex-col justify-end')
    expect(html).toContain('absolute inset-0 size-full object-cover')
    expect(html).toContain('object-[center_bottom]')
    expect(html).not.toContain('rounded-xl border border-border bg-muted/20')
  })

  it('supports contained-fill media while keeping the layout inside the normal container', () => {
    const html = renderToStaticMarkup(
      createElement(SplitFeatureBlockComponent, {
        ctaMode: 'link',
        contentVerticalAlignment: 'top',
        description: 'Train with faculty mentors across clinics, labs, and simulation spaces.',
        image: { alt: 'Simulation lab', url: '/media/sim-lab.jpg' } as never,
        imagePosition: 'center',
        layoutMode: 'split',
        linkLabel: 'Explore facilities',
        linkType: 'custom',
        mediaFillMode: 'containedFill',
        mediaPosition: 'left',
        size: 'comfortable',
        title: 'Built for immersive study.',
        url: '/facilities',
      }),
    )

    expect(html).toContain('data-split-feature-layout="split"')
    expect(html).toContain('data-split-feature-position="left"')
    expect(html).toContain('data-split-feature-image-position="center"')
    expect(html).toContain('data-split-feature-content-vertical-alignment="top"')
    expect(html).toContain('data-split-feature-media-fill="containedFill"')
    expect(html).toContain('data-split-feature-media-frame="containedFill"')
    expect(html).toContain('data-split-feature-size="comfortable"')
    expect(html).toContain('min-h-[30rem]')
    expect(html).toContain('md:min-h-[40rem]')
    expect(html).toContain('relative aspect-[4/3] overflow-hidden md:h-full md:aspect-auto')
    expect(html).toContain('absolute inset-0 size-full object-cover')
    expect(html).toContain('object-[center_center]')
    expect(html).toContain('flex min-h-full flex-col justify-start px-4 py-16 md:px-8 md:py-16 lg:px-12')
    expect(html).not.toContain('rounded-xl border border-border bg-muted/20')
  })
})
