import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HeroBannerBlockComponent } from '@/blocks/HeroBanner/Component'

describe('Hero Banner block', () => {
  it('renders image, eyebrow, title, description, and two CTA buttons', () => {
    const html = renderToStaticMarkup(
      createElement(HeroBannerBlockComponent, {
        appearance: {
          background: 'primary',
          border: 'topAndBottom',
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
    expect(html).toContain('data-hero-banner-content-width="wide"')
    expect(html).toContain('data-hero-banner-height="immersive"')
    expect(html).toContain('data-hero-banner-background="primary"')
    expect(html).toContain('data-hero-banner-theme="auto"')
    expect(html).toContain('data-section-eyebrow-surface="none"')
    expect(html).toContain('bg-primary')
    expect(html).toContain('text-primary-foreground')
    expect(html).toContain(
      'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
    )
    expect(html).toContain('border-y border-border')
    expect(html).toContain('from-background/90')
    expect(html).toContain('flex w-full flex-col gap-8 max-w-5xl')
    expect(html).toContain('flex flex-col gap-6')
    expect(html).toContain('text-balance')
    expect(html).toContain('text-foreground/84')
    expect(html).toContain('lg:text-xl')
    expect(html).toContain('h-12 w-full sm:w-auto')
  })

  it('supports explicit light and dark hero theme overrides', () => {
    const darkHtml = renderToStaticMarkup(
      createElement(HeroBannerBlockComponent, {
        backgroundImage: { alt: 'Lecture hall', url: '/media/lecture.jpg' } as never,
        buttons: [
          { label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'default' },
          { label: 'Compare programs', linkType: 'custom', url: '/programs', variant: 'outline' },
        ] as never,
        description: 'Deliberate contrast regardless of site theme.',
        eyebrow: 'Admissions',
        overlayStyle: 'dark',
        themeMode: 'dark',
        title: 'Dark hero tone.',
      }),
    )

    const lightHtml = renderToStaticMarkup(
      createElement(HeroBannerBlockComponent, {
        backgroundImage: { alt: 'Quad', url: '/media/quad.jpg' } as never,
        buttons: [
          { label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'default' },
          { label: 'Learn more', linkType: 'custom', url: '/learn', variant: 'outline' },
        ] as never,
        description: 'Readable content on a lighter surface treatment.',
        eyebrow: 'Admissions',
        overlayStyle: 'light',
        themeMode: 'light',
        title: 'Light hero tone.',
      }),
    )

    expect(darkHtml).toContain('data-hero-banner-theme="dark"')
    expect(darkHtml).toContain('data-section-eyebrow-surface="darkOverlay"')
    expect(darkHtml).toContain('from-black/68')
    expect(darkHtml).toContain('text-white')
    expect(darkHtml).toContain('text-white/84')
    expect(darkHtml).toContain(
      'bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_8%)]',
    )
    expect(darkHtml).toContain(
      'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
    )

    expect(lightHtml).toContain('data-hero-banner-theme="light"')
    expect(lightHtml).toContain('data-section-eyebrow-surface="none"')
    expect(lightHtml).toContain('from-background/72')
    expect(lightHtml).toContain('text-foreground')
    expect(lightHtml).toContain('text-foreground/84')
    expect(lightHtml).toContain(
      'bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_8%)]',
    )
    expect(lightHtml).toContain(
      'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
    )
  })

  it('maps overlay and alignment presets into deterministic class hooks', () => {
    const html = renderToStaticMarkup(
      createElement(HeroBannerBlockComponent, {
        backgroundImage: { alt: 'Library exterior', url: '/media/library.jpg' } as never,
        height: 'compact',
        horizontalAlignment: 'right',
        overlayStyle: 'dark',
        title: 'A precise place to begin.',
        verticalAlignment: 'bottom',
      }),
    )

    expect(html).toContain('data-hero-banner-overlay="dark"')
    expect(html).toContain('data-hero-banner-horizontal="right"')
    expect(html).toContain('data-hero-banner-vertical="bottom"')
    expect(html).toContain('data-hero-banner-height="compact"')
    expect(html).toContain('text-3xl sm:text-4xl md:text-5xl')
  })

  it('collapses optional content cleanly when eyebrow, description, and buttons are omitted', () => {
    const html = renderToStaticMarkup(
      createElement(HeroBannerBlockComponent, {
        backgroundImage: { alt: 'Clinic hall', url: '/media/clinic.jpg' } as never,
        title: 'Built for decisive practice.',
      }),
    )

    expect(html).toContain('Built for decisive practice.')
    expect(html).not.toContain('data-hero-banner-eyebrow')
    expect(html).not.toContain('data-hero-banner-description')
    expect(html).not.toContain('data-hero-banner-actions')
  })

  it('renders arrows only for opted-in button CTAs and keeps link CTAs editorial', () => {
    const html = renderToStaticMarkup(
      createElement(HeroBannerBlockComponent, {
        backgroundImage: { alt: 'Campus', url: '/media/campus.jpg' } as never,
        buttons: [
          {
            label: 'Apply now',
            linkType: 'custom',
            showArrow: true,
            url: '/apply',
            variant: 'default',
          },
          {
            label: 'Read more',
            linkType: 'custom',
            showArrow: true,
            url: '/read',
            variant: 'link',
          },
        ] as never,
        title: 'Study medicine.',
      }),
    )

    expect((html.match(/data-action-arrow="true"/g) ?? [])).toHaveLength(1)
    expect(html).toContain('data-content-link="true"')
  })

  it.each([
    ['left', 'justify-start', 'mr-auto'],
    ['center', 'justify-center', 'mx-auto'],
    ['right', 'justify-end', 'ml-auto'],
  ] as const)(
    'aligns the complete Hero Banner content axis to %s',
    (horizontalAlignment, shellClass, constrainedItemClass) => {
      const html = renderToStaticMarkup(
        createElement(HeroBannerBlockComponent, {
          backgroundImage: { alt: 'Campus', url: '/media/campus.jpg' } as never,
          buttons: [
            { label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'default' },
          ] as never,
          contentWidth: 'wide',
          description: 'A deliberately constrained description.',
          eyebrow: 'Admissions',
          horizontalAlignment,
          title: 'A deliberately constrained title.',
        }),
      )

      expect(html).toContain(`data-hero-banner-horizontal="${horizontalAlignment}"`)
      expect(html).toContain(shellClass)
      expect(html).toContain('flex w-full flex-col gap-8 max-w-5xl')
      expect(html).toMatch(new RegExp(`<h1 class="[^"]*${constrainedItemClass}`))
      expect(html).toMatch(
        new RegExp(
          `<p class="[^"]*${constrainedItemClass}[^"]*" data-hero-banner-description="true"`,
        ),
      )
      expect(html).toMatch(
        new RegExp(`<div class="[^"]*${shellClass}[^"]*" data-hero-banner-actions="true"`),
      )
    },
  )
})
