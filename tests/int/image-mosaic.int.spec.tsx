import { existsSync, readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ImageMosaicBlockComponent } from '@/blocks/ImageMosaic/Component'
import { ImageMosaicBlock } from '@/blocks/ImageMosaic/config'
import { renderPageBlocks } from '@/blocks/renderPageBlocks'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { Pages } from '@/collections/Pages'
import { ImageMosaic, type ImageMosaicItem } from '@/components/image-mosaic'

type TestField = {
  admin?: { condition?: unknown }
  defaultValue?: unknown
  fields?: TestField[]
  label?: string
  maxRows?: number
  minRows?: number
  name?: string
  options?: Array<{ value: string }>
  relationTo?: string
  required?: boolean
  tabs?: TestTab[]
  type?: string
}

type TestTab = {
  fields: TestField[]
  label: string
}

const getField = (fields: TestField[], name: string) => fields.find((field) => field.name === name)

const imagePositions = ['center', 'top', 'bottom', 'left', 'right'] as const

const mosaicItems: ImageMosaicItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  image: {
    alt: `Mosaic image ${index + 1}`,
    height: 900,
    src: `/media/mosaic-${index + 1}.jpg`,
    width: 1200,
  },
  imagePosition: imagePositions[index % imagePositions.length],
  action: {
    href: `/stories/${index + 1}`,
    label: 'Explore',
    mode: 'link',
    showArrow: false,
    variant: 'default',
  },
  title: `Story ${index + 1}`,
}))

describe('Image Mosaic', () => {
  it('includes the per-action display mode field by default, with an opt-out', () => {
    const defaultField = createContentActionsField()
    const imageActionField = createContentActionsField({
      label: 'Action',
      maxRows: 1,
      name: 'action',
    })
    const noModeField = createContentActionsField({
      includeDisplayMode: false,
      label: 'Action',
      maxRows: 1,
      name: 'action',
    })

    const getLayoutNames = (field: typeof defaultField) => {
      const tabsField = field.fields[0]

      if (tabsField.type !== 'tabs') {
        return []
      }

      return (
        tabsField.tabs
          .find(({ label }) => label === 'Theme Settings')
          ?.fields.flatMap((item) => ('name' in item ? [item.name] : [])) ?? []
      )
    }

    expect(getLayoutNames(defaultField)).toEqual(['mode', 'variant', 'showArrow'])
    expect(getLayoutNames(imageActionField)).toEqual(['mode', 'variant', 'showArrow'])
    expect(getLayoutNames(noModeField)).toEqual(['variant', 'showArrow'])

    const tabsField = imageActionField.fields[0]

    if (tabsField.type !== 'tabs') {
      throw new Error('Expected action tabs')
    }

    const layoutFields =
      tabsField.tabs.find(({ label }) => label === 'Theme Settings')?.fields ?? []
    const modeField = layoutFields.find((field) => 'name' in field && field.name === 'mode')
    const variantField = layoutFields.find((field) => 'name' in field && field.name === 'variant')

    expect(imageActionField).toMatchObject({ maxRows: 1, name: 'action', type: 'array' })
    expect(modeField).toMatchObject({
      defaultValue: 'link',
      label: 'Display As',
      required: false,
      type: 'select',
    })
    expect(variantField).toMatchObject({
      admin: { condition: expect.any(Function) },
      type: 'select',
    })
  })

  it('defines the approved one-to-eight-item Payload schema', () => {
    expect(ImageMosaicBlock).toMatchObject({
      interfaceName: 'ImageMosaicBlock',
      labels: {
        plural: 'Image Mosaics',
        singular: 'Image Mosaic',
      },
      slug: 'imageMosaic',
    })

    const tabsField = ImageMosaicBlock.fields[0] as unknown as {
      tabs: TestTab[]
      type: string
    }
    const contentTab = tabsField.tabs.find(({ label }) => label === 'Content')
    const layoutTab = tabsField.tabs.find(({ label }) => label === 'Theme Settings')
    const itemsField = getField(contentTab?.fields ?? [], 'items')

    expect(tabsField.type).toBe('tabs')
    expect(tabsField.tabs.map(({ label }) => label)).toEqual(['Content', 'Theme Settings'])
    expect(getField(contentTab?.fields ?? [], 'title')).toMatchObject({
      type: 'text',
    })
    expect(getField(contentTab?.fields ?? [], 'actions')?.maxRows).toBe(2)
    expect(itemsField).toMatchObject({
      maxRows: 8,
      minRows: 1,
      required: true,
      type: 'array',
    })
    expect(getField(itemsField?.fields ?? [], 'image')).toMatchObject({
      relationTo: 'media',
      required: true,
      type: 'upload',
    })
    expect(getField(itemsField?.fields ?? [], 'imagePosition')).toMatchObject({
      defaultValue: 'center',
      required: true,
      type: 'select',
    })
    expect(
      getField(itemsField?.fields ?? [], 'imagePosition')?.options?.map(({ value }) => value),
    ).toEqual(['center', 'top', 'bottom', 'left', 'right'])
    expect(
      itemsField?.fields?.flatMap(({ name }) => (name && name !== 'id' ? [name] : [])),
    ).toEqual(['image', 'imagePosition', 'title', 'action'])
    expect(getField(itemsField?.fields ?? [], 'action')).toMatchObject({
      maxRows: 1,
      type: 'array',
    })
    expect(getField(itemsField?.fields ?? [], 'action')?.minRows).toBeUndefined()
    expect(getField(itemsField?.fields ?? [], 'linkType')).toBeUndefined()
    expect(getField(itemsField?.fields ?? [], 'linkLabel')).toBeUndefined()
    expect(getField(layoutTab?.fields ?? [], 'appearance')?.type).toBe('group')
    const actionsField = getField(contentTab?.fields ?? [], 'actions')
    const actionsTabsField = actionsField?.fields?.[0]
    const actionsThemeTab =
      actionsTabsField?.type === 'tabs'
        ? actionsTabsField.tabs?.find(({ label }) => label === 'Theme Settings')
        : undefined
    expect(getField(actionsThemeTab?.fields ?? [], 'mode')).toMatchObject({
      defaultValue: 'link',
      label: 'Display As',
      required: false,
      type: 'select',
    })
    expect(getField(layoutTab?.fields ?? [], 'contentAlignment')?.defaultValue).toBe('center')
    expect(getField(layoutTab?.fields ?? [], 'size')?.defaultValue).toBe('default')
    expect(getField(layoutTab?.fields ?? [], 'showImageOverlays')).toMatchObject({
      defaultValue: true,
      type: 'checkbox',
    })
  })

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('renders %i items without horizontal overflow', (count) => {
    const html = renderToStaticMarkup(
      <ImageMosaic items={mosaicItems.slice(0, count)} title="Campus perspectives" />,
    )

    expect(html).toContain(`data-image-mosaic-count="${count}"`)
    expect(html).toContain('grid-flow-dense')
    expect(html).toContain('grid-cols-1')
    expect(html).toContain('md:grid-cols-2')
    expect(html).toContain('overflow-hidden')
    expect(html.match(/data-image-mosaic-item=/g)).toHaveLength(count)
  })

  it('uses shared typography, spacing, appearance, sizing, and alignment', () => {
    const html = renderToStaticMarkup(
      <ImageMosaic
        actions="Explore the collection"
        alignment="right"
        appearance={{ background: 'subtle', border: 'topAndBottom' }}
        description="A closer look at the people and places in our community."
        eyebrow="Gallery"
        items={mosaicItems.slice(0, 5)}
        size="compact"
        title="Campus perspectives"
      />,
    )

    expect(html).toContain('data-image-mosaic-alignment="right"')
    expect(html).toContain('data-image-mosaic-size="compact"')
    expect(html).toContain('bg-subtle')
    expect(html).toContain('border-y border-border')
    expect(html).toContain('py-8 md:py-10')
    expect(html).toContain('mx-auto w-full max-w-screen-2xl px-4')
    expect(html).toContain(
      'text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl',
    )
    expect(html).toContain('text-base leading-7 text-balance text-current/70')
    expect(html).toContain('ml-auto items-end text-right')
    expect(html).toContain('Explore the collection')
  })

  it('renders explicit text links only while overlays are enabled', () => {
    const enabledHtml = renderToStaticMarkup(
      <ImageMosaic items={mosaicItems.slice(0, 1)} showImageOverlays title="Gallery" />,
    )
    const disabledHtml = renderToStaticMarkup(
      <ImageMosaic items={mosaicItems.slice(0, 1)} showImageOverlays={false} title="Gallery" />,
    )

    expect(enabledHtml).toContain('data-image-mosaic-overlay="true"')
    expect(enabledHtml).toContain('group/image-mosaic')
    expect(enabledHtml).toContain('image-mosaic-image')
    expect(enabledHtml).toContain('href="/stories/1"')
    expect(enabledHtml).toContain('Story 1')
    expect(disabledHtml).toContain('data-image-mosaic-overlays="hidden"')
    expect(disabledHtml).not.toContain('group/image-mosaic')
    expect(disabledHtml).not.toContain('image-mosaic-image')
    expect(disabledHtml).not.toContain('data-image-mosaic-overlay="true"')
    expect(disabledHtml).not.toContain('href="/stories/1"')
    expect(disabledHtml).not.toContain('Story 1')
  })

  it('renders image actions through the shared link and button behavior', () => {
    const html = renderToStaticMarkup(
      <ImageMosaic
        items={[
          mosaicItems[0],
          {
            ...mosaicItems[1],
            action: {
              href: '/apply',
              label: 'Apply now',
              mode: 'button',
              showArrow: false,
              variant: 'outline',
            },
          },
          { ...mosaicItems[2], action: undefined },
        ]}
        title="Gallery"
      />,
    )

    expect(html).toContain('data-action-mode="link"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-variant="outline"')
    expect(html).toContain('href="/apply"')
    expect(html.match(/data-image-mosaic-item-action=/g)).toHaveLength(2)
  })

  it('uses CSS-only zoom and fade with mobile and reduced-motion support', () => {
    const serverSource = readFileSync('src/components/image-mosaic.tsx', 'utf8')
    const customCss = readFileSync('src/styles/custom.css', 'utf8')
    const obsoleteClientPath = 'src/components/ui/direction-aware-hover.tsx'
    const imageRuleStart = customCss.indexOf('.image-mosaic-image')
    const overlayRuleStart = customCss.indexOf('.image-mosaic-overlay')
    const desktopOverlayMediaStart = customCss.indexOf(
      '@media (min-width: 64rem) and (hover: hover) and (pointer: fine)',
    )
    const reducedMotionMediaStart = customCss.indexOf(
      '@media (prefers-reduced-motion: reduce)',
      desktopOverlayMediaStart,
    )
    const baseImageRules = customCss.slice(imageRuleStart, overlayRuleStart)
    const baseOverlayRules = customCss.slice(overlayRuleStart, desktopOverlayMediaStart)
    const desktopHoverRules = customCss.slice(desktopOverlayMediaStart, reducedMotionMediaStart)

    expect(serverSource).not.toContain("'use client'")
    expect(serverSource).not.toContain("from 'framer-motion'")
    expect(serverSource).not.toContain('DirectionAwareHover')
    expect(existsSync(obsoleteClientPath)).toBe(false)
    expect(imageRuleStart).toBeGreaterThan(-1)
    expect(desktopOverlayMediaStart).toBeGreaterThan(overlayRuleStart)
    expect(baseImageRules).toContain('transform: scale(1)')
    expect(baseImageRules).toContain('transition: transform 200ms ease-out')
    expect(baseOverlayRules).toContain('pointer-events: auto')
    expect(baseOverlayRules).toContain('opacity: 1')
    expect(baseOverlayRules).toContain('transition: opacity 200ms ease-out')
    expect(desktopHoverRules).toContain('pointer-events: none')
    expect(desktopHoverRules).toContain('opacity: 0')
    expect(desktopHoverRules).toContain('transform: scale(1.05)')
    expect(customCss).not.toContain('data-image-mosaic-direction')
    expect(customCss).not.toContain('translate3d')
    expect(customCss).not.toContain('@media (hover: none), (pointer: coarse)')
    expect(customCss).toContain('@media (prefers-reduced-motion: reduce)')
    expect(customCss).toContain('.image-mosaic-overlay')
  })

  it('resolves Payload media, item actions, section actions, and image positions', () => {
    const html = renderToStaticMarkup(
      <ImageMosaicBlockComponent
        actions={[
          {
            label: 'View all',
            linkType: 'custom',
            mode: 'button',
            url: '/gallery',
            variant: 'outline',
          },
        ]}
        appearance={{ background: 'subtle', border: 'top' }}
        contentAlignment="left"
        items={[
          {
            image: {
              alt: 'Learning space',
              height: 900,
              id: 10,
              url: '/media/space.jpg',
              width: 1200,
            },
            action: [
              {
                label: 'Explore the space',
                linkType: 'custom',
                mode: 'button',
                url: '/spaces',
                variant: 'outline',
              },
            ],
            imagePosition: 'top',
            title: 'Learning spaces',
          },
          {
            action: [
              {
                label: 'Incomplete action',
                linkType: 'custom',
                mode: 'link',
              },
            ],
            image: {
              alt: 'Community',
              height: 900,
              id: 11,
              url: '/media/community.jpg',
              width: 1200,
            },
            title: 'Community',
          },
          {
            image: {
              alt: 'No action',
              height: 900,
              id: 12,
              url: '/media/no-action.jpg',
              width: 1200,
            },
            title: 'No action',
          },
        ]}
        size="comfortable"
        title="Inside our community"
      />,
    )

    expect(html).toContain('data-image-mosaic="true"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-variant="outline"')
    expect(html).toContain('href="/gallery"')
    expect(html).toContain('href="/spaces"')
    expect(html).not.toContain('Incomplete action</a>')
    expect(html.match(/data-image-mosaic-item-action=/g)).toHaveLength(1)
    expect(html).toContain('object-[center_top]')
    expect(html).toContain('width="1200"')
    expect(html).toContain('height="900"')
  })

  it('omits invalid images and renders nothing without a title or valid image', () => {
    const oneValid = renderToStaticMarkup(
      <ImageMosaicBlockComponent
        items={[
          { image: null, title: 'Invalid' },
          {
            image: {
              alt: 'Valid',
              height: 900,
              id: 1,
              url: '/media/valid.jpg',
              width: 1200,
            },
            title: 'Valid',
          },
        ]}
        title="Gallery"
      />,
    )

    expect(oneValid.match(/data-image-mosaic-item=/g)).toHaveLength(1)
    expect(renderToStaticMarkup(<ImageMosaicBlockComponent items={[]} title="Gallery" />)).toBe('')
    expect(
      renderToStaticMarkup(
        <ImageMosaicBlockComponent items={[{ image: { id: 1, url: '/image.jpg' } }]} title="  " />,
      ),
    ).toBe('')
  })

  it('registers and renders through the page block pipeline', () => {
    const tabsField = Pages.fields.find((field) => field.type === 'tabs')
    const contentTab = tabsField?.type === 'tabs' ? tabsField.tabs[0] : undefined
    const layoutField = contentTab?.fields.find(
      (field) => 'name' in field && field.name === 'layout',
    )
    const slugs = layoutField?.type === 'blocks' ? layoutField.blocks.map(({ slug }) => slug) : []

    expect(slugs).toContain('imageMosaic')

    const html = renderToStaticMarkup(
      renderPageBlocks([
        {
          blockType: 'imageMosaic',
          items: [
            {
              image: {
                alt: 'Pipeline image',
                height: 900,
                id: 1,
                url: '/pipeline.jpg',
                width: 1200,
              },
            },
          ],
          title: 'Pipeline mosaic',
        } as never,
      ]),
    )

    expect(html).toContain('data-image-mosaic="true"')
    expect(html).toContain('Pipeline mosaic')
  })
})
