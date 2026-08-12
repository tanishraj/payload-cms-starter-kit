import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ProgramMatrixBlockComponent } from '@/blocks/ProgramMatrix/Component'
import { SectionEyebrow } from '@/components/SectionEyebrow'

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), 'utf8')

const regularSectionEyebrowFiles = [
  'src/blocks/AboutSection/Component.tsx',
  'src/blocks/AwardsList/Component.tsx',
  'src/blocks/BentoGrid/Component.tsx',
  'src/blocks/DownloadList/Component.tsx',
  'src/blocks/FeatureSpotlight/Component.tsx',
  'src/blocks/GalleryCoverflow/Component.tsx',
  'src/blocks/IconGrid/Component.tsx',
  'src/blocks/LogoStrip/Component.tsx',
  'src/blocks/MediaCarousel/MediaCarouselClient.tsx',
  'src/blocks/NumberedSteps/Component.tsx',
  'src/blocks/ProgramGrid/ProgramGridClient.tsx',
  'src/blocks/ProgramMatrix/Component.tsx',
  'src/blocks/QuoteBlock/Component.tsx',
  'src/blocks/ReviewSubmission/Component.tsx',
  'src/blocks/TabsContent/Component.tsx',
  'src/blocks/TabsContent/TabsContentClient.tsx',
  'src/blocks/TestimonialGrid/Component.tsx',
  'src/blocks/Timeline/Component.tsx',
  'src/blocks/VideoEmbed/Component.tsx',
  'src/components/contact24.tsx',
  'src/components/contact33.tsx',
  'src/components/content-highlights.tsx',
  'src/components/event-gallery.tsx',
  'src/components/feature-matrix.tsx',
  'src/components/gallery-showcase.tsx',
  'src/components/image-mosaic.tsx',
  'src/components/news-events/NewsEventsFeed.tsx',
  'src/components/news-events/NewsEventsHighlights.tsx',
  'src/components/profile-carousel.tsx',
  'src/components/rating-spotlight.tsx',
  'src/components/review-feed.tsx',
  'src/components/services21.tsx',
] as const

describe('SNMIH section eyebrows', () => {
  it.each([
    'none',
    'primary',
    'secondary',
    'muted',
    'accent',
    'darkOverlay',
  ] as const)('renders the %s surface contract with the inherited fallback', (surface) => {
    const html = renderToStaticMarkup(
      <SectionEyebrow className="mb-2" surface={surface}>
        Academics
      </SectionEyebrow>,
    )

    expect(html).toContain('data-section-eyebrow="true"')
    expect(html).toContain(`data-section-eyebrow-surface="${surface}"`)
    expect(html).toContain(
      'font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70 mb-2',
    )
    expect(html).toContain('>Academics</p>')
  })

  it('scopes direct eyebrow colors to SNMIH without defining another token', () => {
    const css = read('src/styles/themes/theme-snmih.css')

    expect(css).toContain("[data-theme-color='snmih']")
    expect(css).toContain("[data-section-eyebrow-surface='none']")
    expect(css).toContain("[data-section-eyebrow-surface='primary']")
    expect(css).toContain("[data-section-eyebrow-surface='darkOverlay']")
    expect(css).toContain('color: #2b833f;')
    expect(css).toContain('color: #9dd4a6;')
    expect(css).not.toMatch(/--(?:section-)?eyebrow/)
    expect(css).not.toMatch(/--section-accent/)
  })

  it('keeps the SNMIH dark-mode primary surface on inherited foreground', () => {
    const css = read('src/styles/themes/theme-snmih.css')
    const darkPrimaryRule =
      /:root\[data-theme-color='snmih'\]\.dark[^{}]*\[data-section-eyebrow-surface='primary'\][^{]*\{[^}]*color:/

    expect(css).not.toMatch(darkPrimaryRule)
  })

  it.each(regularSectionEyebrowFiles)('%s consumes the shared section eyebrow', (file) => {
    expect(read(file)).toContain('SectionEyebrow')
  })

  it('does not convert metadata labels into section eyebrows', () => {
    expect(read('src/blocks/ProgramGrid/ProgramGridClient.tsx')).toContain(
      'font-mono text-xs font-semibold uppercase tracking-[0.24em]',
    )
    expect(read('src/blocks/PageHeader/Component.tsx')).toContain('{fact.label!.trim()}')
    expect(read('src/components/contact24.tsx')).toContain('{office.region}')
  })

  it('passes a regular section background to the eyebrow', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        appearance={{ background: 'primary' }}
        eyebrow="Academics"
        items={[{ title: 'MBBS' }]}
        title="Programmes offered"
      />,
    )

    expect(html).toContain('data-section-eyebrow="true"')
    expect(html).toContain('data-section-eyebrow-surface="primary"')
  })

  it('marks Hero Carousel eyebrows as dark-overlay content', () => {
    const source = read('src/blocks/HeroCarousel/HeroCarouselClient.tsx')

    expect(source).toContain('SectionEyebrow')
    expect(source).toContain('surface="darkOverlay"')
  })
})
