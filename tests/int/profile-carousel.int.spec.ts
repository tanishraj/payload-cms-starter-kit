import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ProfileCarouselBlockComponent } from '@/blocks/ProfileCarousel/Component'
import { ProfileCarouselBlock } from '@/blocks/ProfileCarousel/config'
import { renderPageBlocks } from '@/blocks/renderPageBlocks'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { Pages } from '@/collections/Pages'
import { ProfileCarousel, type ProfileCarouselProfile } from '@/components/profile-carousel'

type TestField = {
  defaultValue?: unknown
  fields?: TestField[]
  label?: string
  maxRows?: number
  minRows?: number
  name?: string
  options?: Array<{ value: string }>
  relationTo?: string
  required?: boolean
  type?: string
}

type TestTab = {
  fields: TestField[]
  label: string
}

const getField = (fields: TestField[], name: string) => fields.find((field) => field.name === name)

const profiles: ProfileCarouselProfile[] = [
  {
    image: { alt: 'Alex Morgan portrait', src: '/media/alex.jpg' },
    name: 'Alex Morgan',
    role: 'Program Director',
  },
  {
    image: { alt: 'Jordan Lee portrait', src: '/media/jordan.jpg' },
    imagePosition: 'top',
    name: 'Jordan Lee',
    role: 'Student Experience Lead',
  },
  {
    image: { alt: 'Sam Rivera portrait', src: '/media/sam.jpg' },
    imagePosition: 'bottom',
    name: 'Sam Rivera',
    role: 'Faculty Advisor',
  },
  {
    image: { alt: 'Taylor Chen portrait', src: '/media/taylor.jpg' },
    imagePosition: 'left',
    name: 'Taylor Chen',
    role: 'Research Coordinator',
  },
  {
    image: { alt: 'Jamie Patel portrait', src: '/media/jamie.jpg' },
    imagePosition: 'right',
    name: 'Jamie Patel',
    role: 'Community Partner',
  },
]

describe('Profile Carousel', () => {
  it('defines the canonical schema and preserves the shared two-action default', () => {
    expect(ProfileCarouselBlock.slug).toBe('profileCarousel')
    expect(ProfileCarouselBlock.interfaceName).toBe('ProfileCarouselBlock')
    expect(ProfileCarouselBlock.labels).toEqual({
      plural: 'Profile Carousels',
      singular: 'Profile Carousel',
    })

    const tabsField = ProfileCarouselBlock.fields[0] as unknown as {
      tabs: TestTab[]
      type: string
    }
    const contentTab = tabsField.tabs.find(({ label }) => label === 'Content')
    const layoutTab = tabsField.tabs.find(({ label }) => label === 'Layout & Theme')
    const actionsField = getField(contentTab?.fields ?? [], 'actions')
    const profilesField = getField(contentTab?.fields ?? [], 'profiles')
    const imageField = getField(profilesField?.fields ?? [], 'image')
    const nameField = getField(profilesField?.fields ?? [], 'name')
    const roleField = getField(profilesField?.fields ?? [], 'role')
    const imagePositionField = getField(profilesField?.fields ?? [], 'imagePosition')
    const appearanceField = getField(layoutTab?.fields ?? [], 'appearance')
    const actionModeField = getField(layoutTab?.fields ?? [], 'actionMode')
    const contentAlignmentField = getField(layoutTab?.fields ?? [], 'contentAlignment')
    const sizeField = getField(layoutTab?.fields ?? [], 'size')
    const cardVariantField = getField(layoutTab?.fields ?? [], 'cardVariant')
    const overlayAlignmentField = getField(layoutTab?.fields ?? [], 'overlayAlignment')

    expect(tabsField.type).toBe('tabs')
    expect(tabsField.tabs.map(({ label }) => label)).toEqual(['Content', 'Layout & Theme'])
    expect(getField(contentTab?.fields ?? [], 'eyebrow')?.type).toBe('text')
    expect(getField(contentTab?.fields ?? [], 'title')?.required).toBe(true)
    expect(actionsField?.maxRows).toBe(1)
    expect(createContentActionsField().maxRows).toBe(2)
    expect(profilesField).toMatchObject({ maxRows: 12, minRows: 1, type: 'array' })
    expect(imageField).toMatchObject({ relationTo: 'media', required: true, type: 'upload' })
    expect(nameField).toMatchObject({ required: true, type: 'text' })
    expect(roleField?.type).toBe('text')
    expect(imagePositionField).toMatchObject({
      defaultValue: 'center',
      required: true,
      type: 'select',
    })
    expect(imagePositionField?.options?.map(({ value }) => value)).toEqual([
      'center',
      'top',
      'bottom',
      'left',
      'right',
    ])
    expect(appearanceField?.type).toBe('group')
    expect(actionModeField?.defaultValue).toBe('link')
    expect(contentAlignmentField?.defaultValue).toBe('left')
    expect(sizeField?.defaultValue).toBe('default')
    expect(sizeField?.options?.map(({ value }) => value)).toEqual([
      'compact',
      'default',
      'comfortable',
    ])
    expect(cardVariantField?.defaultValue).toBe('stacked')
    expect(cardVariantField?.options?.map(({ value }) => value)).toEqual(['stacked', 'overlay'])
    expect(overlayAlignmentField?.defaultValue).toBe('left')
    expect(overlayAlignmentField?.options?.map(({ value }) => value)).toEqual([
      'left',
      'center',
      'right',
    ])
  })

  it('renders one through four profiles as a fixed responsive grid without controls', () => {
    const html = renderToStaticMarkup(
      ProfileCarousel({
        actions: 'Meet our team',
        alignment: 'left',
        appearance: { background: 'muted', border: 'topAndBottom' },
        description: 'The people supporting every part of the experience.',
        eyebrow: 'Our people',
        profiles: profiles.slice(0, 3),
        size: 'compact',
        title: 'People behind the work',
      }),
    )

    expect(html).toContain('data-profile-carousel="true"')
    expect(html).toContain('data-profile-carousel-mode="static"')
    expect(html).toContain('data-profile-carousel-size="compact"')
    expect(html).toContain('py-10')
    expect(html).toContain('grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4')
    expect(html).toContain(
      'text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl',
    )
    expect(html).toContain('text-base leading-7 text-balance text-current/70')
    expect(html).not.toContain('aria-label="Previous profile"')
    expect(html).not.toContain('aria-label="Next profile"')
    expect(html).toContain('Meet our team')
    expect(html).toContain('Our people')
    expect(html).toContain(
      'font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70',
    )
    expect(html).not.toMatch(/<h3[^>]*>Alex Morgan<\/h3>/)
    expect(html.match(/flex flex-col gap-0\.5/g)).toHaveLength(3)
    expect(html).toContain('data-profile-carousel-card-variant="stacked"')
    expect(html.match(/data-profile-carousel-media-frame="true"/g)).toHaveLength(3)
    expect(html).toContain('h-64 sm:h-72 md:h-80')
    expect(html).toContain('block h-full w-full object-cover')
    expect(html).toContain('object-[center_center]')
    expect(html).toContain('object-[center_top]')
  })

  it('activates the looping one/two/four carousel only at five profiles', () => {
    const html = renderToStaticMarkup(ProfileCarousel({ profiles, title: 'Meet the team' }))

    expect(html).toContain('data-profile-carousel-mode="carousel"')
    expect(html.match(/md:basis-1\/2 lg:basis-1\/4/g)).toHaveLength(5)
    expect(html).toContain('-ml-5')
    expect(html.match(/pl-5 md:basis-1\/2 lg:basis-1\/4/g)).toHaveLength(5)
    expect(html).toContain('aria-label="Previous profile"')
    expect(html).toContain('aria-label="Next profile"')
    expect(html).toContain('data-carousel-loop="true"')
    expect(html).toContain('h-72 sm:h-80 md:h-96')
  })

  it('renders a theme-aware image overlay with one alignment for every profile', () => {
    const html = renderToStaticMarkup(
      ProfileCarousel({
        cardVariant: 'overlay',
        overlayAlignment: 'center',
        profiles: profiles.slice(0, 4),
        size: 'comfortable',
        title: 'Our people',
      }),
    )

    expect(html.match(/<article[^>]*data-profile-carousel-card-variant="overlay"/g)).toHaveLength(4)
    expect(html.match(/data-profile-carousel-overlay-alignment="center"/g)).toHaveLength(4)
    expect(
      html.match(/bg-linear-to-t from-background\/95 via-background\/70 to-transparent/g),
    ).toHaveLength(4)
    expect(html.match(/items-center text-center/g)).toHaveLength(4)
    expect(html.match(/h-80 sm:h-96 md:h-\[28rem\]/g)).toHaveLength(4)
  })

  it.each([
    ['compact', 'h-64 sm:h-72 md:h-80'],
    ['default', 'h-72 sm:h-80 md:h-96'],
    ['comfortable', 'h-80 sm:h-96 md:h-[28rem]'],
  ] as const)('applies the %s image height to every profile', (size, classes) => {
    const html = renderToStaticMarkup(
      ProfileCarousel({ profiles: profiles.slice(0, 4), size, title: 'Our team' }),
    )

    expect(html.split(classes)).toHaveLength(5)
  })

  it('resolves Payload media, alignment, appearance, and the one shared action', () => {
    const html = renderToStaticMarkup(
      ProfileCarouselBlockComponent({
        actionMode: 'button',
        actions: [
          {
            label: 'Meet everyone',
            linkType: 'custom',
            url: '/team',
            variant: 'outline',
          },
        ],
        appearance: { background: 'accent', border: 'top' },
        cardVariant: 'overlay',
        contentAlignment: 'right',
        description: 'A multidisciplinary group working together.',
        eyebrow: 'Leadership',
        overlayAlignment: 'right',
        profiles: profiles.map((profile, index) => ({
          image: { alt: profile.image.alt, id: index + 1, url: profile.image.src },
          imagePosition: profile.imagePosition,
          name: profile.name,
          role: profile.role,
        })),
        size: 'comfortable',
        title: 'Our people',
      }),
    )

    expect(html).toContain('data-profile-carousel-alignment="right"')
    expect(html).toContain('data-profile-carousel-card-variant="overlay"')
    expect(html).toContain('data-profile-carousel-overlay-alignment="right"')
    expect(html).toContain('Leadership')
    expect(html).toContain('bg-accent')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-variant="outline"')
    expect(html).toContain('href="/team"')
    expect(html).toContain('/media/alex.jpg')
    expect(html).toContain('object-[right_center]')
  })

  it('omits malformed profiles and renders nothing without valid profiles', () => {
    const partialHtml = renderToStaticMarkup(
      ProfileCarouselBlockComponent({
        profiles: [
          { image: { alt: 'Valid profile', id: 1, url: '/valid.jpg' }, name: 'Valid Name' },
          { image: null, name: 'Missing image' },
          { image: { alt: 'Missing name', id: 2, url: '/missing-name.jpg' }, name: '  ' },
        ],
        title: 'Profiles',
      }),
    )

    expect(partialHtml).toContain('Valid Name')
    expect(partialHtml).not.toContain('Missing image')
    expect(partialHtml).not.toContain('/missing-name.jpg')

    expect(
      renderToStaticMarkup(ProfileCarouselBlockComponent({ profiles: [], title: 'Profiles' })),
    ).toBe('')
  })

  it('registers and renders through the page block pipeline', () => {
    const tabsField = Pages.fields.find((field) => field.type === 'tabs')
    const contentTab = tabsField?.type === 'tabs' ? tabsField.tabs[0] : undefined
    const layoutField = contentTab?.fields.find(
      (field) => 'name' in field && field.name === 'layout',
    )
    const registeredSlugs =
      layoutField?.type === 'blocks' ? layoutField.blocks.map(({ slug }) => slug) : []

    expect(registeredSlugs).toContain('profileCarousel')
    expect(registeredSlugs).not.toContain('gallery27')

    const html = renderToStaticMarkup(
      renderPageBlocks([
        {
          blockType: 'profileCarousel',
          profiles: [
            {
              image: { alt: 'Alex Morgan', id: 1, url: '/media/alex.jpg' },
              name: 'Alex Morgan',
              role: 'Program Director',
            },
          ],
          title: 'Meet the team',
        } as never,
      ]),
    )

    expect(html).toContain('data-profile-carousel="true"')
    expect(html).toContain('Meet the team')
  })
})
