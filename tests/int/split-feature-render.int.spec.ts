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
        ctaMode: 'link',
        description: 'Choose from MD, MD-PhD, and specialized tracks.',
        eyebrow: 'Programs',
        image: { alt: 'Students in clinic', url: '/media/programs.jpg' } as never,
        layoutMode: 'split',
        linkLabel: 'See all programs',
        linkType: 'custom',
        mediaPosition: 'right',
        title: 'Four years. Six pathways. One physician.',
        url: '/programs',
      }),
    )

    expect(html).toContain('data-split-feature-position="right"')
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
  })

  it('renders centered content-only layout without an image', () => {
    const html = renderToStaticMarkup(
      createElement(SplitFeatureBlockComponent, {
        ctaMode: 'link',
        description: 'Applications for the Class of 2030 open August 1.',
        layoutMode: 'contentOnly',
        linkLabel: 'Start your application',
        linkType: 'custom',
        title: 'Ready to begin?',
        url: '/apply',
      }),
    )

    expect(html).toContain('data-split-feature-layout="contentOnly"')
    expect(html).toContain('data-split-feature-position="contentOnly"')
    expect(html).toContain('href="/apply"')
    expect(html).not.toContain('<img')
  })
})
