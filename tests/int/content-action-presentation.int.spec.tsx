import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { Footer56Block } from '@/blocks/Footer56/config'
import { HeaderNavbar12Block } from '@/blocks/HeaderNavbar12/config'
import { HeroBannerBlock } from '@/blocks/HeroBanner/config'
import { HeroCarouselBlock } from '@/blocks/HeroCarousel/config'
import { ContentActions } from '@/components/ContentActions'
import { ContentLink } from '@/components/ContentLink'
import { resolveCmsActions } from '@/lib/cmsLinks'

type TestField = {
  admin?: { condition?: unknown }
  defaultValue?: unknown
  label?: string
  name?: string
  tabs?: Array<{ fields: TestField[]; label: string }>
  type?: string
}

const getActionTabs = (includeDisplayMode = false) => {
  const field = createContentActionsField({ includeDisplayMode })
  return ((field.fields[0] as TestField).tabs ?? [])
}

const findFieldsByName = (value: unknown, name: string): TestField[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => findFieldsByName(item, name))
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const field = value as TestField & Record<string, unknown>
  const matches = field.name === name ? [field] : []

  return [
    ...matches,
    ...Object.values(field).flatMap((item) => findFieldsByName(item, name)),
  ]
}

describe('content action presentation', () => {
  it('defines an opt-in button arrow in shared action theme settings', () => {
    const themeFields =
      getActionTabs().find((tab) => tab.label === 'Theme Settings')?.fields ?? []

    expect(themeFields.find((field) => field.name === 'showArrow')).toMatchObject({
      defaultValue: false,
      label: 'Show arrow',
      type: 'checkbox',
    })
  })

  it('only exposes the row arrow control for button display mode', () => {
    const themeFields =
      getActionTabs(true).find((tab) => tab.label === 'Theme Settings')?.fields ?? []
    const field = themeFields.find((item) => item.name === 'showArrow')
    const condition = field?.admin?.condition as
      | ((_data: unknown, siblings: { mode?: string }) => boolean)
      | undefined

    expect(condition?.({}, { mode: 'button' })).toBe(true)
    expect(condition?.({}, { mode: 'link' })).toBe(false)
  })

  it.each([
    ['Hero Banner', HeroBannerBlock],
    ['Hero Carousel', HeroCarouselBlock],
    ['Header Navbar', HeaderNavbar12Block],
    ['Footer', Footer56Block],
  ] as const)('defines the opt-in arrow for %s CTAs', (_label, block) => {
    expect(findFieldsByName(block.fields, 'showArrow')).toContainEqual(
      expect.objectContaining({
        defaultValue: false,
        label: 'Show arrow',
        type: 'checkbox',
      }),
    )
  })

  it('defaults missing arrows to false and preserves explicit arrows', () => {
    expect(
      resolveCmsActions([
        { label: 'Plain', linkType: 'custom', url: '/plain' },
        { label: 'Arrow', linkType: 'custom', showArrow: true, url: '/arrow' },
      ]),
    ).toEqual([
      expect.objectContaining({ href: '/plain', showArrow: false }),
      expect.objectContaining({ href: '/arrow', showArrow: true }),
    ])
  })

  it('underlines the editorial label without underlining its icon', () => {
    const html = renderToStaticMarkup(
      createElement(ContentLink, { href: '/programs', label: 'Explore programs' }),
    )

    expect(html).toContain('data-content-link="true"')
    expect(html).toContain('data-content-link-label="true"')
    expect(html).toContain('underline-offset-4')
    expect(html).toContain('data-content-link-arrow="true"')
  })

  it('renders a decorative arrow only for opted-in buttons', () => {
    const html = renderToStaticMarkup(
      createElement(ContentActions, {
        actions: [
          { href: '/plain', label: 'Plain', showArrow: false, variant: 'default' },
          { href: '/arrow', label: 'Arrow', showArrow: true, variant: 'outline' },
        ],
        mode: 'button',
      }),
    )

    expect((html.match(/data-action-arrow="true"/g) ?? [])).toHaveLength(1)
    expect(html).toContain('aria-hidden="true"')
  })

  it('keeps link-style CTAs editorial and ignores their button arrow', () => {
    const html = renderToStaticMarkup(
      createElement(ContentActions, {
        actions: [{ href: '/read', label: 'Read more', showArrow: true, variant: 'link' }],
        mode: 'button',
      }),
    )

    expect(html).toContain('data-content-link="true"')
    expect(html).not.toContain('data-action-arrow="true"')
  })

  it.each([
    'src/blocks/MediaCarousel/MediaCarouselClient.tsx',
    'src/blocks/Services21/Component.tsx',
  ])('uses the shared button-arrow primitive in %s', (file) => {
    const source = readFileSync(file, 'utf8')

    expect(source).toContain('ActionButtonContent')
    expect(source).toContain('showArrow=')
  })
})
