import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HeroInstitutionalBlockComponent } from '@/blocks/HeroInstitutional/Component'

describe('hero institutional block', () => {
  it('renders image, eyebrow, title, description, and two CTA buttons', () => {
    const html = renderToStaticMarkup(
      createElement(HeroInstitutionalBlockComponent, {
        appearance: {
          background: 'primary',
          border: 'topAndBottom',
          textColor: 'auto',
        },
        backgroundImage: { alt: 'Campus facade', url: '/media/campus.jpg' } as never,
        buttons: [
          { label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'default' },
          { label: 'Explore programs', linkType: 'custom', url: '/programs', variant: 'secondary' },
        ] as never,
        contentWidth: 'wide',
        description: 'Train across four rigorous years of science, practice, and reflection.',
        eyebrow: 'Est. 1912 · Cambridge Heights',
        height: 'immersive',
        horizontalAlignment: 'left',
        overlayStyle: 'darker',
        title: 'Medicine, practiced with rigor and mercy.',
        verticalAlignment: 'center',
      }),
    )

    expect(html).toContain('Campus facade')
    expect(html).toContain('Est. 1912 · Cambridge Heights')
    expect(html).toContain('Medicine, practiced with rigor and mercy.')
    expect(html).toContain('Train across four rigorous years of science, practice, and reflection.')
    expect(html).toContain('href="/apply"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('data-hero-content-width="wide"')
    expect(html).toContain('data-hero-height="immersive"')
    expect(html).toContain('data-hero-background="primary"')
    expect(html).toContain('bg-primary')
    expect(html).toContain('text-primary-foreground')
    expect(html).toContain('border-y border-border')
  })

  it('maps overlay and alignment presets into deterministic class hooks', () => {
    const html = renderToStaticMarkup(
      createElement(HeroInstitutionalBlockComponent, {
        backgroundImage: { alt: 'Library exterior', url: '/media/library.jpg' } as never,
        height: 'compact',
        horizontalAlignment: 'right',
        overlayStyle: 'dark',
        title: 'A precise place to begin.',
        verticalAlignment: 'bottom',
      }),
    )

    expect(html).toContain('data-hero-overlay="dark"')
    expect(html).toContain('data-hero-horizontal="right"')
    expect(html).toContain('data-hero-vertical="bottom"')
    expect(html).toContain('data-hero-height="compact"')
  })

  it('collapses optional content cleanly when eyebrow, description, and buttons are omitted', () => {
    const html = renderToStaticMarkup(
      createElement(HeroInstitutionalBlockComponent, {
        backgroundImage: { alt: 'Clinic hall', url: '/media/clinic.jpg' } as never,
        title: 'Built for decisive practice.',
      }),
    )

    expect(html).toContain('Built for decisive practice.')
    expect(html).not.toContain('data-hero-eyebrow')
    expect(html).not.toContain('data-hero-description')
    expect(html).not.toContain('data-hero-actions')
  })
})
