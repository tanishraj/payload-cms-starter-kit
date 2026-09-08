import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { pageBuilderBlocks } from '@/blocks/blockCatalog'
import { LogoStripBlockComponent } from '@/blocks/LogoStrip/Component'
import { MediaCarouselBlockComponent } from '@/blocks/MediaCarousel/Component'
import { TestimonialSpotlightBlockComponent } from '@/blocks/TestimonialSpotlight/Component'
import {
  preferCanonicalActions,
  resolveSectionAlignment,
} from '@/blocks/shared/legacySectionFields'

const media = { alt: 'Campus', id: 1, url: '/campus.jpg' }
const customAction = (label: string, url: string) => ({
  label,
  linkType: 'custom' as const,
  url,
})

describe('section field compatibility', () => {
  const contentFieldsFor = (slug: string) => {
    const block = pageBuilderBlocks.find((candidate) => candidate.slug === slug)
    const tabs = block?.fields.find((field) => field.type === 'tabs')
    const content = tabs?.tabs.find((tab) => tab.label === 'Content')

    return content?.fields ?? []
  }

  const themeFieldsFor = (slug: string) => {
    const block = pageBuilderBlocks.find((candidate) => candidate.slug === slug)
    const tabs = block?.fields.find((field) => field.type === 'tabs')
    const theme = tabs?.tabs.find((tab) => tab.label === 'Theme Settings')

    return theme?.fields ?? []
  }

  it('prefers populated canonical actions and falls back to legacy actions', () => {
    expect(preferCanonicalActions([{ label: 'New' }], [{ label: 'Old' }])).toEqual([
      { label: 'New' },
    ])
    expect(preferCanonicalActions([], [{ label: 'Old' }])).toEqual([{ label: 'Old' }])
    expect(preferCanonicalActions(undefined, undefined)).toEqual([])
  })

  it('resolves canonical alignment before legacy alignment and fallback', () => {
    expect(resolveSectionAlignment(undefined, 'right', 'center')).toBe('right')
    expect(resolveSectionAlignment('left', 'right', 'center')).toBe('left')
    expect(resolveSectionAlignment(undefined, undefined, 'center')).toBe('center')
  })

  it('keeps legacy Media Carousel section actions readable', () => {
    const html = renderToStaticMarkup(
      <MediaCarouselBlockComponent
        items={[{ media, title: 'Campus life' }]}
        sectionActions={[customAction('Legacy gallery action', '/legacy-gallery')]}
        title="Gallery"
      />,
    )

    expect(html).toContain('Legacy gallery action')
    expect(html).toContain('href="/legacy-gallery"')
  })

  it('hides the Media Carousel alias while retaining it in the registered schema', () => {
    const legacyActions = contentFieldsFor('mediaCarousel').find(
      (field) => 'name' in field && field.name === 'sectionActions',
    )

    expect(legacyActions).toMatchObject({
      admin: { hidden: true },
      label: 'Legacy Section Actions',
      name: 'sectionActions',
    })
  })

  it('keeps Testimonial Spotlight alignment on its established storage path', () => {
    const themeFields = themeFieldsFor('testimonialSpotlight')
    const fieldNames = themeFields.flatMap((field) => ('name' in field ? [field.name] : []))
    const alignment = themeFields.find(
      (field) => 'name' in field && field.name === 'sectionContentAlignment',
    )

    expect(fieldNames).not.toContain('contentAlignment')
    expect(alignment).toMatchObject({
      name: 'sectionContentAlignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      required: true,
    })
  })

  it('prefers canonical Media Carousel introduction actions', () => {
    const html = renderToStaticMarkup(
      <MediaCarouselBlockComponent
        actions={[customAction('Current gallery action', '/gallery')]}
        items={[{ media, title: 'Campus life' }]}
        sectionActions={[customAction('Legacy gallery action', '/legacy-gallery')]}
        title="Gallery"
      />,
    )

    expect(html).toContain('Current gallery action')
    expect(html).not.toContain('Legacy gallery action')
  })

  it('preserves right-aligned Testimonial Spotlight introductions', () => {
    const html = renderToStaticMarkup(
      <TestimonialSpotlightBlockComponent
        actions={[customAction('Meet leadership', '/leadership')]}
        image={media}
        personName="Dr Example"
        sectionContentAlignment="right"
        sectionTitle="Leadership voices"
        title="A message"
      />,
    )

    expect(html).toContain('data-testimonial-spotlight-section-alignment="right"')
    expect(html).toContain('ml-auto items-end text-right')
    expect(html).toContain('justify-end')
  })

  it('renders the new Logo Strip footer action after the logo content', () => {
    const html = renderToStaticMarkup(
      <LogoStripBlockComponent
        footerActions={[customAction('View accreditations', '/accreditations')]}
        logos={[{ image: media, label: 'Accreditor' }]}
      />,
    )

    expect(html.indexOf('Accreditor')).toBeLessThan(html.indexOf('View accreditations'))
  })
})
