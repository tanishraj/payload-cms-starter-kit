import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { PageContent } from '@/app/(frontend)/PageContent'
import { AnnouncementBlock } from '@/blocks/Announcement/config'
import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { Pages } from '@/collections/Pages'
import { SiteSettings } from '@/globals/SiteSettings'

const getLayoutField = () => {
  const tabsField = Pages.fields.find(
    (field) => typeof field === 'object' && field !== null && 'tabs' in field,
  ) as { tabs: Array<{ label: string; fields: unknown[] }> } | undefined

  const contentTab = tabsField?.tabs.find((tab) => tab.label === 'Content')

  return contentTab?.fields.find(
    (field) =>
      typeof field === 'object' && field !== null && 'name' in field && field.name === 'layout',
  ) as { blocks?: Array<{ slug: string }>; type?: string } | undefined
}

const getNamedField = <T>(fields: unknown[], fieldName: string) =>
  fields.find(
    (field) =>
      typeof field === 'object' && field !== null && 'name' in field && field.name === fieldName,
  ) as T | undefined

const expectContentActionsFieldSet = (
  contentFields: unknown[],
  layoutFields: unknown[],
  {
    actionsName = 'actions',
    modeName = 'actionMode',
  }: { actionsName?: string; modeName?: string } = {},
) => {
  const actionPresentationField = getNamedField<{
    defaultValue?: string
    name?: string
    options?: Array<{ value: string }>
    type?: string
  }>(contentFields, 'actionPresentation')
  const actionModeInContent = getNamedField<{ name?: string; type?: string }>(
    contentFields,
    modeName,
  )
  const actionModeField = getNamedField<{
    defaultValue?: string
    name?: string
    options?: Array<{ value: string }>
    type?: string
  }>(layoutFields, modeName)
  const actionsField = getNamedField<{
    fields?: unknown[]
    maxRows?: number
    name?: string
    type?: string
  }>(contentFields, actionsName)
  const actionTabsField = actionsField?.fields?.[0] as
    | {
        tabs?: Array<{ fields: unknown[]; label: string }>
        type?: string
      }
    | undefined
  const actionContentTab = actionTabsField?.tabs?.find((tab) => tab.label === 'Content')
  const actionLayoutTab = actionTabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')
  const variantField = getNamedField<{
    defaultValue?: string
    name?: string
    options?: Array<{ value: string }>
    type?: string
  }>(actionLayoutTab?.fields ?? [], 'variant')

  expect(actionPresentationField).toBeUndefined()
  expect(actionModeInContent).toBeUndefined()
  expect(actionModeField?.type).toBe('select')
  expect(actionModeField?.defaultValue).toBe('link')
  expect(actionModeField?.options?.map((option) => option.value)).toEqual(['link', 'button'])
  expect(actionsField?.type).toBe('array')
  expect(actionsField?.maxRows).toBe(2)
  expect(actionTabsField?.type).toBe('tabs')
  expect(actionTabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
  expect(
    actionContentTab?.fields.map((field) =>
      typeof field === 'object' && field !== null && 'name' in field ? field.name : undefined,
    ),
  ).toEqual(['label', 'linkType', 'page', 'url', 'openInNewTab'])
  expect(variantField?.type).toBe('select')
  expect(variantField?.defaultValue).toBe('default')
  expect(variantField?.options?.map((option) => option.value)).toEqual([
    'default',
    'secondary',
    'outline',
  ])
}

describe('page block pipeline', () => {
  it('defines the shared block appearance schema defaults and options', () => {
    const appearanceField = createBlockAppearanceFields()
    const appearanceFields = ('fields' in appearanceField ? appearanceField.fields : []) as Array<{
      defaultValue?: unknown
      name?: string
      options?: Array<{ value: string }>
    }>

    const appearanceBackgroundField = appearanceFields.find((field) => field.name === 'background')
    const appearanceTextColorField = appearanceFields.find((field) => field.name === 'textColor')
    const appearanceBorderField = appearanceFields.find((field) => field.name === 'border')

    expect(appearanceField?.type).toBe('group')
    expect(appearanceBackgroundField?.defaultValue).toBe('none')
    expect(appearanceTextColorField?.defaultValue).toBe('auto')
    expect(appearanceBorderField?.defaultValue).toBe('none')
    expect(appearanceBackgroundField?.options?.map((option) => option.value)).toEqual([
      'none',
      'primary',
      'secondary',
      'muted',
      'accent',
    ])
    expect(appearanceTextColorField?.options?.map((option) => option.value)).toEqual([
      'auto',
      'default',
      'inverse',
    ])
    expect(appearanceBorderField?.options?.map((option) => option.value)).toEqual([
      'none',
      'top',
      'bottom',
      'topAndBottom',
    ])
  })

  it('resolves shared block appearance classes from semantic appearance values', () => {
    expect(resolveBlockAppearanceClasses()).toEqual({
      backgroundClassName: '',
      textClassName: '',
      borderClassName: '',
      className: '',
    })

    expect(
      resolveBlockAppearanceClasses({
        background: 'primary',
        textColor: 'auto',
        border: 'topAndBottom',
      }),
    ).toEqual({
      backgroundClassName: 'bg-primary',
      textClassName: 'text-primary-foreground',
      borderClassName: 'border-y border-border',
      className: 'bg-primary text-primary-foreground border-y border-border',
    })
  })

  it('registers a general layout blocks field on Pages', () => {
    const layoutField = getLayoutField()

    expect(layoutField?.type).toBe('blocks')
    expect(layoutField?.blocks?.map((block) => block.slug)).toEqual([
      'announcement',
      'cta39',
      'heroBanner',
      'featureSpotlight',
      'featureMatrix',
      'contentHighlights',
      'newsEventsHighlights',
      'profileCarousel',
      'galleryShowcase',
      'imageMosaic',
      'statsStrip',
      'qaAccordion',
      'ratingSpotlight',
      'reviewFeed',
      'reviewSubmission',
      'contact33',
      'teamShowcase',
      'services21',
    ])
    expect(layoutField?.blocks?.map((block) => block.slug)).not.toContain('feature166')
  })

  it('defines the statsStrip schema with metric items, background, and animation fields', async () => {
    const { StatsStripBlock } = await import('@/blocks/StatsStrip/config')
    const tabsField = StatsStripBlock.fields[0] as
      { tabs?: Array<{ fields: unknown[]; label: string }>; type?: string } | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')

    const itemsField = getNamedField<{
      fields?: Array<{ name?: string; type?: string }>
      minRows?: number
      type?: string
    }>(contentTab?.fields ?? [], 'items')
    const appearanceField = getNamedField<{
      fields?: Array<{ name?: string; type?: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'appearance')

    const animationEnabledField = getNamedField<{ defaultValue?: boolean; type?: string }>(
      layoutTab?.fields ?? [],
      'animationEnabled',
    )

    const animationDurationField = getNamedField<{ defaultValue?: number; type?: string }>(
      layoutTab?.fields ?? [],
      'animationDuration',
    )

    const triggerOnceField = getNamedField<{ defaultValue?: boolean; type?: string }>(
      layoutTab?.fields ?? [],
      'triggerOnce',
    )

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(itemsField?.type).toBe('array')
    expect(itemsField?.minRows).toBe(1)
    expect(itemsField?.fields?.map((field) => field.name).filter((name) => name !== 'id')).toEqual([
      'prefix',
      'value',
      'suffix',
      'label',
    ])
    expect(appearanceField?.type).toBe('group')
    expect(animationEnabledField?.type).toBe('checkbox')
    expect(animationEnabledField?.defaultValue).toBe(true)
    expect(animationDurationField?.type).toBe('number')
    expect(animationDurationField?.defaultValue).toBe(1200)
    expect(triggerOnceField?.type).toBe('checkbox')
    expect(triggerOnceField?.defaultValue).toBe(true)
  })

  it('defines the heroBanner schema with image, overlay, alignment, and CTA fields', async () => {
    const { HeroBannerBlock } = await import('@/blocks/HeroBanner/config')

    const tabsField = HeroBannerBlock.fields[0] as
      | {
          tabs?: Array<{ fields: unknown[]; label: string }>
          type?: string
        }
      | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')

    const appearanceField = getNamedField<{ type?: string }>(layoutTab?.fields ?? [], 'appearance')
    const backgroundImageField = getNamedField<{
      relationTo?: string
      required?: boolean
      type?: string
    }>(contentTab?.fields ?? [], 'backgroundImage')

    const titleField = getNamedField<{ required?: boolean; type?: string }>(
      contentTab?.fields ?? [],
      'title',
    )

    const overlayStyleField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'overlayStyle')
    const themeModeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'themeMode')

    const horizontalAlignmentField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'horizontalAlignment')

    const verticalAlignmentField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'verticalAlignment')

    const buttonsField = getNamedField<{ fields?: unknown[]; maxRows?: number; type?: string }>(
      contentTab?.fields ?? [],
      'buttons',
    )
    const buttonTabsField = buttonsField?.fields?.[0] as
      | {
          tabs?: Array<{ fields: unknown[]; label: string }>
          type?: string
        }
      | undefined
    const buttonContentTab = buttonTabsField?.tabs?.find((tab) => tab.label === 'Content')
    const buttonLayoutTab = buttonTabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')
    const buttonLabelField = getNamedField<{ required?: boolean; type?: string }>(
      buttonContentTab?.fields ?? [],
      'label',
    )
    const buttonVariantField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(buttonLayoutTab?.fields ?? [], 'variant')

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(appearanceField?.type).toBe('group')
    expect(backgroundImageField?.type).toBe('upload')
    expect(backgroundImageField?.relationTo).toBe('media')
    expect(backgroundImageField?.required).toBe(true)
    expect(titleField?.type).toBe('text')
    expect(titleField?.required).toBe(true)
    expect(overlayStyleField?.type).toBe('select')
    expect(overlayStyleField?.defaultValue).toBe('dark')
    expect(overlayStyleField?.options?.map((option) => option.value)).toEqual([
      'light',
      'dark',
      'darker',
    ])
    expect(themeModeField?.type).toBe('select')
    expect(themeModeField?.defaultValue).toBe('auto')
    expect(themeModeField?.options?.map((option) => option.value)).toEqual([
      'auto',
      'light',
      'dark',
    ])
    expect(horizontalAlignmentField?.options?.map((option) => option.value)).toEqual([
      'left',
      'center',
      'right',
    ])
    expect(verticalAlignmentField?.options?.map((option) => option.value)).toEqual([
      'top',
      'center',
      'bottom',
    ])
    const heightField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'height')

    const contentWidthField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'contentWidth')

    expect(contentWidthField?.type).toBe('select')
    expect(contentWidthField?.defaultValue).toBe('default')
    expect(contentWidthField?.options?.map((option) => option.value)).toEqual([
      'narrow',
      'default',
      'wide',
    ])
    expect(heightField?.type).toBe('select')
    expect(heightField?.defaultValue).toBe('default')
    expect(heightField?.options?.map((option) => option.value)).toEqual([
      'compact',
      'default',
      'immersive',
    ])
    expect(buttonsField?.type).toBe('array')
    expect(buttonsField?.maxRows).toBe(2)
    expect(buttonTabsField?.type).toBe('tabs')
    expect(buttonTabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(buttonLabelField?.type).toBe('text')
    expect(buttonLabelField?.required).toBe(true)
    expect(buttonVariantField?.defaultValue).toBe('default')
    expect(buttonVariantField?.options?.map((option) => option.value)).toEqual([
      'default',
      'outline',
      'secondary',
      'link',
    ])
  })

  it('defines the footer56 schema with branding, link groups, utilities, and shared appearance', async () => {
    const { Footer56Block } = await import('@/blocks/Footer56/config')
    const tabsField = Footer56Block.fields[0] as
      { tabs?: Array<{ fields: unknown[]; label: string }>; type?: string } | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')

    const logoModeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(contentTab?.fields ?? [], 'logoMode')

    const linkGroupsField = getNamedField<{ maxRows?: number; minRows?: number; type?: string }>(
      contentTab?.fields ?? [],
      'linkGroups',
    )

    const ctaButtonsField = getNamedField<{ maxRows?: number; type?: string }>(
      contentTab?.fields ?? [],
      'ctaButtons',
    )

    const logoHeightField = getNamedField<{ min?: number; type?: string }>(
      contentTab?.fields ?? [],
      'logoHeight',
    )

    const socialLinksField = (contentTab?.fields ?? []).find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'socialLinks',
    ) as { type?: string } | undefined

    const appearanceField = getNamedField<{ fields?: Array<{ name?: string }>; type?: string }>(
      layoutTab?.fields ?? [],
      'appearance',
    )

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(logoModeField?.type).toBe('select')
    expect(logoModeField?.defaultValue).toBe('siteDefault')
    expect(logoModeField?.options?.map((option) => option.value)).toEqual([
      'siteDefault',
      'customLogo',
    ])
    expect(linkGroupsField?.type).toBe('array')
    expect(linkGroupsField?.minRows).toBe(1)
    expect(linkGroupsField?.maxRows).toBe(4)
    expect(ctaButtonsField?.type).toBe('array')
    expect(ctaButtonsField?.maxRows).toBe(2)
    expect(logoHeightField?.type).toBe('number')
    expect(logoHeightField?.min).toBe(20)
    expect(socialLinksField).toBeUndefined()
    expect(appearanceField?.type).toBe('group')
    expect(appearanceField?.fields?.map((field) => field.name)).toEqual(['background', 'border'])
  })

  it('defines the site settings legal schema with privacy policy and terms relationships', () => {
    const siteSettingsTabs = SiteSettings.fields.find(
      (field) => typeof field === 'object' && field !== null && 'tabs' in field,
    ) as { tabs: Array<{ fields: unknown[]; label: string }> } | undefined

    const contactTab = siteSettingsTabs?.tabs.find((tab) => tab.label === 'Contact')
    const legalTab = siteSettingsTabs?.tabs.find((tab) => tab.label === 'Legal')

    const privacyPolicyField = legalTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'privacyPolicyPage',
    ) as { relationTo?: string; type?: string } | undefined

    const termsField = legalTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'termsAndConditionsPage',
    ) as { relationTo?: string; type?: string } | undefined

    const contactPrivacyField = contactTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'privacyPolicyPage',
    )

    expect(privacyPolicyField?.type).toBe('relationship')
    expect(privacyPolicyField?.relationTo).toBe('pages')
    expect(termsField?.type).toBe('relationship')
    expect(termsField?.relationTo).toBe('pages')
    expect(contactPrivacyField).toBeUndefined()
  })

  it('defines site settings social links as validated external URLs', () => {
    const siteSettingsTabs = SiteSettings.fields.find(
      (field) => typeof field === 'object' && field !== null && 'tabs' in field,
    ) as { tabs: Array<{ fields: unknown[]; label: string }> } | undefined

    const socialLinksTab = siteSettingsTabs?.tabs.find((tab) => tab.label === 'Social Links')
    const socialLinksGroup = socialLinksTab?.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'socialLinks',
    ) as
      | {
          fields?: Array<{
            admin?: { description?: string }
            label?: string
            name?: string
            validate?: (value: unknown) => true | string
          }>
        }
      | undefined

    const facebookField = socialLinksGroup?.fields?.find((field) => field.name === 'facebook')

    expect(facebookField?.label).toBe('Facebook External URL')
    expect(facebookField?.admin?.description).toContain('full external URL')
    expect(facebookField?.validate?.('https://facebook.com/example')).toBe(true)
    expect(facebookField?.validate?.('facebook.com/example')).toBe(
      'Enter a valid external URL starting with http:// or https://.',
    )
    expect(facebookField?.validate?.('mailto:test@example.com')).toBe(
      'Enter a full external URL starting with http:// or https://.',
    )
  })

  it('renders nothing for a normal page without layout blocks', () => {
    const result = PageContent({
      page: {
        id: 'page-1',
        slug: 'home',
        title: 'Home',
      } as never,
    })

    expect(result).toBeNull()
  })

  it('defines the page announcement block schema with mode, timing, and rotating items', () => {
    const tabsField = AnnouncementBlock.fields[0] as
      { tabs?: Array<{ fields: unknown[]; label: string }>; type?: string } | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')
    const appearanceField = getNamedField<{ type?: string }>(layoutTab?.fields ?? [], 'appearance')
    const displayModeField = getNamedField<{
      defaultValue?: string
      label?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'displayMode')
    const labelField = getNamedField<{ label?: string; type?: string }>(
      contentTab?.fields ?? [],
      'label',
    )
    const intervalField = getNamedField<{ defaultValue?: number; type?: string }>(
      layoutTab?.fields ?? [],
      'intervalMs',
    )
    const marqueeDurationField = getNamedField<{ defaultValue?: number; type?: string }>(
      layoutTab?.fields ?? [],
      'marqueeDurationMs',
    )
    const itemsField = getNamedField<{ minRows?: number; type?: string }>(
      contentTab?.fields ?? [],
      'items',
    )

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(appearanceField?.type).toBe('group')
    expect(displayModeField?.type).toBe('select')
    expect(displayModeField?.label).toBe('Animation Mode')
    expect(displayModeField?.defaultValue).toBe('vertical')
    expect(displayModeField?.options?.map((option) => option.value)).toEqual([
      'vertical',
      'horizontal',
      'marquee',
    ])
    expect(labelField?.type).toBe('text')
    expect(labelField?.label).toBe('Announcement Label')
    expect(intervalField?.type).toBe('number')
    expect(intervalField?.defaultValue).toBe(4000)
    expect(marqueeDurationField?.type).toBe('number')
    expect(marqueeDurationField?.defaultValue).toBe(18000)
    expect(itemsField?.type).toBe('array')
    expect(itemsField?.minRows).toBe(1)
  })

  it('renders the first announcement item for a page announcement block', () => {
    const result = PageContent({
      page: {
        id: 'page-2',
        layout: [
          {
            appearance: {
              background: 'secondary',
              border: 'topAndBottom',
              textColor: 'auto',
            },
            blockType: 'announcement',
            intervalMs: 4000,
            id: 'block-1',
            label: 'Urgent Notice',
            items: [
              {
                description: 'Scheduled tonight at 10:00 PM.',
                url: '/maintenance',
              },
              {
                description: 'The second item should not be visible in server markup.',
                title: 'Ignored in static render',
              },
            ],
          },
        ],
        slug: 'updates',
        title: 'Updates',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('lucide-megaphone')
    expect(html).toContain('Urgent Notice')
    expect(html).toContain('Scheduled tonight at 10:00 PM.')
    expect(html).toContain('href="/maintenance"')
    expect(html).toContain('data-announcement-background="secondary"')
    expect(html).toContain('bg-secondary')
    expect(html).toContain('text-secondary-foreground')
    expect(html).toContain('border-y border-border')
  })

  it('defines the Call to Action schema with title, description, and shared actions', async () => {
    const { Cta39Block } = await import('@/blocks/Cta39/config')
    const tabsField = Cta39Block.fields[0] as
      | {
          tabs?: Array<{ fields: unknown[]; label: string }>
          type?: string
        }
      | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')
    const titleField = getNamedField<{ required?: boolean; type?: string }>(
      contentTab?.fields ?? [],
      'title',
    )
    const descriptionField = getNamedField<{ type?: string }>(contentTab?.fields ?? [], 'description')
    const sizeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'size')
    const contentAlignmentField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'contentAlignment')

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(titleField?.type).toBe('text')
    expect(titleField?.required).toBe(true)
    expect(descriptionField?.type).toBe('textarea')
    expectContentActionsFieldSet(contentTab?.fields ?? [], layoutTab?.fields ?? [])
    expect(sizeField?.type).toBe('select')
    expect(sizeField?.defaultValue).toBe('default')
    expect(sizeField?.options?.map((option) => option.value)).toEqual([
      'compact',
      'default',
      'comfortable',
    ])
    expect(contentAlignmentField?.type).toBe('select')
    expect(contentAlignmentField?.defaultValue).toBe('center')
    expect(contentAlignmentField?.options?.map((option) => option.value)).toEqual([
      'left',
      'center',
      'right',
    ])
  })

  it('renders a cta39 page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-cta-1',
        layout: [
          {
            actionMode: 'button',
            appearance: {
              background: 'accent',
              border: 'topAndBottom',
              textColor: 'auto',
            },
            actions: [{ label: 'Get started', linkType: 'custom', url: '/start', variant: 'default' }],
            blockType: 'cta39',
            description: 'Everything you need to launch your next website block.',
            size: 'compact',
            title: 'Ship better experiences faster.',
          },
        ],
        slug: 'cta',
        title: 'Call to Action',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('Ship better experiences faster.')
    expect(html).toContain('Everything you need to launch your next website block.')
    expect(html).toContain('href="/start"')
    expect(html).toContain('Get started')
    expect(html).toContain('data-cta39-background="accent"')
  })

  it('renders a heroBanner page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-hero-1',
        layout: [
          {
            appearance: {
              background: 'primary',
              border: 'top',
              textColor: 'auto',
            },
            backgroundImage: {
              alt: 'Main hall',
              url: '/media/main-hall.jpg',
            },
            blockType: 'heroBanner',
            buttons: [
              { label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'default' },
            ],
            description: 'Train for the work that follows.',
            eyebrow: 'Admissions',
            height: 'default',
            horizontalAlignment: 'left',
            overlayStyle: 'dark',
            title: 'Practice begins before the clinic.',
            verticalAlignment: 'center',
          },
        ],
        slug: 'admissions',
        title: 'Admissions',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('Practice begins before the clinic.')
    expect(html).toContain('Admissions')
    expect(html).toContain('href="/apply"')
    expect(html).toContain('data-hero-banner-background="primary"')
    expect(html).toContain('bg-primary')
    expect(html).toContain('text-primary-foreground')
    expect(html).toContain('border-t border-border')
  })

  it('defines the featureSpotlight schema with image, layout, and shared actions', async () => {
    const { FeatureSpotlightBlock } = await import('@/blocks/FeatureSpotlight/config')
    const tabsField = FeatureSpotlightBlock.fields[0] as
      { tabs?: Array<{ fields: unknown[]; label: string }>; type?: string } | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')

    const appearanceField = getNamedField<{ type?: string }>(layoutTab?.fields ?? [], 'appearance')
    const imageField = getNamedField<{ relationTo?: string; required?: boolean; type?: string }>(
      contentTab?.fields ?? [],
      'image',
    )
    const titleField = getNamedField<{ required?: boolean; type?: string }>(
      contentTab?.fields ?? [],
      'title',
    )
    const layoutModeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'layoutMode')
    const mediaPositionField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'mediaPosition')
    const imagePositionField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'imagePosition')
    const mediaFillModeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'mediaFillMode')
    const contentVerticalAlignmentField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'contentVerticalAlignment')
    const sizeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'size')
    const backgroundStyleField = (layoutTab?.fields ?? []).find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'backgroundStyle',
    ) as { type?: string } | undefined

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(appearanceField?.type).toBe('group')
    expect(imageField?.type).toBe('upload')
    expect(imageField?.relationTo).toBe('media')
    expect(imageField?.required).not.toBe(true)
    expect(titleField?.type).toBe('text')
    expect(titleField?.required).toBe(true)
    expect(layoutModeField?.type).toBe('select')
    expect(layoutModeField?.defaultValue).toBe('split')
    expect(layoutModeField?.options?.map((option) => option.value)).toEqual([
      'split',
      'contentOnly',
    ])
    expect(mediaPositionField?.type).toBe('select')
    expect(mediaPositionField?.defaultValue).toBe('left')
    expect(mediaPositionField?.options?.map((option) => option.value)).toEqual(['left', 'right'])
    expect(imagePositionField?.type).toBe('select')
    expect(imagePositionField?.defaultValue).toBe('center')
    expect(imagePositionField?.options?.map((option) => option.value)).toEqual([
      'center',
      'top',
      'bottom',
      'left',
      'right',
    ])
    expect(mediaFillModeField?.type).toBe('select')
    expect(mediaFillModeField?.defaultValue).toBe('contained')
    expect(mediaFillModeField?.options?.map((option) => option.value)).toEqual([
      'contained',
      'containedFill',
      'edgeToEdge',
    ])
    expect(contentVerticalAlignmentField?.type).toBe('select')
    expect(contentVerticalAlignmentField?.defaultValue).toBe('center')
    expect(contentVerticalAlignmentField?.options?.map((option) => option.value)).toEqual([
      'top',
      'center',
      'bottom',
    ])
    expect(sizeField?.type).toBe('select')
    expect(sizeField?.defaultValue).toBe('default')
    expect(sizeField?.options?.map((option) => option.value)).toEqual([
      'compact',
      'default',
      'comfortable',
    ])
    expect(backgroundStyleField).toBeUndefined()
    expect(getNamedField(contentTab?.fields ?? [], 'ctaMode')).toBeUndefined()
    expect(getNamedField(contentTab?.fields ?? [], 'links')).toBeUndefined()
    expect(getNamedField(contentTab?.fields ?? [], 'buttons')).toBeUndefined()
    expectContentActionsFieldSet(contentTab?.fields ?? [], layoutTab?.fields ?? [])
  })

  it('defines the qaAccordion schema with rich-text items, optional side column, and shared appearance', async () => {
    const { QaAccordionBlock } = await import('@/blocks/QaAccordion/config')
    const tabsField = QaAccordionBlock.fields[0] as
      { tabs?: Array<{ fields: unknown[]; label: string }>; type?: string } | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')

    const headingField = getNamedField<{ required?: boolean; type?: string }>(
      contentTab?.fields ?? [],
      'heading',
    )
    const itemsField = getNamedField<{
      fields?: Array<{ name?: string; type?: string }>
      minRows?: number
      type?: string
    }>(contentTab?.fields ?? [], 'items')
    const sideColumnEnabledField = getNamedField<{ defaultValue?: boolean; type?: string }>(
      contentTab?.fields ?? [],
      'sideColumnEnabled',
    )
    const sideColumnField = getNamedField<{
      admin?: { condition?: unknown }
      fields?: Array<{ name?: string; type?: string }>
      type?: string
    }>(contentTab?.fields ?? [], 'sideColumn')
    const contactField = getNamedField<{
      fields?: unknown[]
      type?: string
    }>(sideColumnField?.fields ?? [], 'contact')
    const sizeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'size')
    const defaultOpenFirstField = getNamedField<{ defaultValue?: boolean; type?: string }>(
      layoutTab?.fields ?? [],
      'defaultOpenFirst',
    )
    const appearanceField = getNamedField<{ type?: string }>(layoutTab?.fields ?? [], 'appearance')
    const contentAlignmentField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'contentAlignment')
    const layoutModeField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'layoutMode')
    const accordionPlacementField = getNamedField<{
      admin?: { condition?: unknown }
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'accordionPlacement')
    const sideActionModeField = getNamedField<{
      admin?: { condition?: unknown }
      defaultValue?: string
      type?: string
    }>(layoutTab?.fields ?? [], 'sideActionMode')

    expect(tabsField?.type).toBe('tabs')
    expect(tabsField?.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Layout & Theme'])
    expect(
      contentTab?.fields.map((field) =>
        typeof field === 'object' && field !== null && 'name' in field ? field.name : undefined,
      ),
    ).toEqual(['heading', 'description', 'headerActions', 'items', 'sideColumn'])
    expect(headingField?.type).toBe('text')
    expect(headingField?.required).toBe(true)
    expect(itemsField?.type).toBe('array')
    expect(itemsField?.minRows).toBe(1)
    expect(itemsField?.fields?.map((field) => field.name).filter((name) => name !== 'id')).toEqual([
      'question',
      'answer',
    ])
    expect(
      itemsField?.fields?.filter((field) => field.name !== 'id').map((field) => field.type),
    ).toEqual(['text', 'richText'])
    expect(sideColumnEnabledField).toBeUndefined()
    expect(sideColumnField?.type).toBe('group')
    expect(sideColumnField?.admin?.condition).toBeTypeOf('function')
    expect(sideColumnField?.fields?.map((field) => field.name)).toEqual(['profile', 'contact'])
    expect(getNamedField(contactField?.fields ?? [], 'links')).toBeUndefined()
    expectContentActionsFieldSet(contentTab?.fields ?? [], layoutTab?.fields ?? [], {
      actionsName: 'headerActions',
      modeName: 'headerActionMode',
    })
    expectContentActionsFieldSet(contactField?.fields ?? [], layoutTab?.fields ?? [], {
      modeName: 'sideActionMode',
    })
    expect(appearanceField?.type).toBe('group')
    expect(contentAlignmentField?.type).toBe('select')
    expect(contentAlignmentField?.defaultValue).toBe('left')
    expect(contentAlignmentField?.options?.map((option) => option.value)).toEqual([
      'left',
      'center',
      'right',
    ])
    expect(layoutModeField?.type).toBe('select')
    expect(layoutModeField?.defaultValue).toBe('fiftyFifty')
    expect(layoutModeField?.options?.map((option) => option.value)).toEqual([
      'fiftyFifty',
      'oneThird',
      'fullWidth',
    ])
    expect(accordionPlacementField?.type).toBe('select')
    expect(accordionPlacementField?.defaultValue).toBe('right')
    expect(accordionPlacementField?.options?.map((option) => option.value)).toEqual([
      'left',
      'right',
    ])
    expect(accordionPlacementField?.admin?.condition).toBeTypeOf('function')
    expect(sideActionModeField?.defaultValue).toBe('link')
    expect(sideActionModeField?.admin?.condition).toBeTypeOf('function')
    expect(sizeField?.type).toBe('select')
    expect(sizeField?.defaultValue).toBe('default')
    expect(sizeField?.options?.map((option) => option.value)).toEqual([
      'compact',
      'default',
      'comfortable',
    ])
    expect(defaultOpenFirstField?.type).toBe('checkbox')
    expect(defaultOpenFirstField?.defaultValue).toBe(true)
  })

  it('defines Review Submission alignment and shared content actions', async () => {
    const { ReviewSubmissionBlock } = await import('@/blocks/ReviewSubmission/config')

    const tabsField = ReviewSubmissionBlock.fields[0] as
      | {
          tabs?: Array<{ fields: unknown[]; label: string }>
          type?: string
        }
      | undefined
    const contentTab = tabsField?.tabs?.find((tab) => tab.label === 'Content')
    const layoutTab = tabsField?.tabs?.find((tab) => tab.label === 'Layout & Theme')
    const contentAlignmentField = getNamedField<{
      defaultValue?: string
      options?: Array<{ value: string }>
      type?: string
    }>(layoutTab?.fields ?? [], 'contentAlignment')

    expect(contentAlignmentField?.type).toBe('select')
    expect(contentAlignmentField?.defaultValue).toBe('left')
    expect(contentAlignmentField?.options?.map((option) => option.value)).toEqual([
      'left',
      'center',
      'right',
    ])
    expect(getNamedField(contentTab?.fields ?? [], 'links')).toBeUndefined()
    expectContentActionsFieldSet(contentTab?.fields ?? [], layoutTab?.fields ?? [])
  })

  it('renders a featureSpotlight page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-spotlight-1',
        layout: [
          {
            appearance: {
              background: 'muted',
              border: 'bottom',
              textColor: 'auto',
            },
            actionMode: 'link',
            actions: [{ label: 'See all programs', linkType: 'custom', url: '/programs' }],
            blockType: 'featureSpotlight',
            description: 'Choose from MD, MD-PhD, and specialized tracks.',
            eyebrow: 'Programs',
            image: {
              alt: 'Students in clinic',
              url: '/media/programs.jpg',
            },
            layoutMode: 'split',
            imagePosition: 'right',
            mediaPosition: 'right',
            title: 'Four years. Six pathways. One physician.',
          },
        ],
        slug: 'programs',
        title: 'Programs',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('data-page-block-stack="true"')
    expect(html).toContain('flex flex-col gap-4 md:gap-0')
    expect(html).toContain('data-feature-spotlight-position="right"')
    expect(html).toContain('data-feature-spotlight-image-position="right"')
    expect(html).toContain('data-feature-spotlight-layout="split"')
    expect(html).toContain('data-feature-spotlight-background="muted"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('See all programs')
    expect(html).toContain('border-b border-border')
  })

  it('renders a statsStrip page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-stats-1',
        layout: [
          {
            animationDuration: 1200,
            animationEnabled: true,
            appearance: {
              background: 'accent',
              border: 'top',
              textColor: 'auto',
            },
            blockType: 'statsStrip',
            id: 'stats-block-1',
            items: [
              { label: 'Years of training physicians', value: 112 },
              { label: 'Student-to-faculty ratio', suffix: ':1', value: 9 },
              { label: 'Annual research funding', prefix: '$', suffix: 'M', value: 186 },
              { label: 'Residency match rate', suffix: '%', value: 96 },
              { label: 'Clinical sites', value: 14 },
            ],
            triggerOnce: true,
          },
        ],
        slug: 'stats',
        title: 'Stats',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('data-stats-strip-background="accent"')
    expect(html).toContain('bg-accent')
    expect(html).toContain('text-accent-foreground')
    expect(html).toContain('border-t border-border')
    expect(html).toContain('data-stats-strip-row="0"')
    expect(html).toContain('data-stats-strip-row="1"')
    expect(html).toContain('data-stats-strip-row-size="4"')
    expect(html).toContain('data-stats-strip-row-size="1"')
    expect(html).toContain('Years of training physicians')
    expect(html).toContain('Student-to-faculty ratio')
    expect(html).toContain('$0M')
    expect(html).toContain('0%')
  })

  it('renders a contact33 page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-contact-1',
        layout: [
          {
            appearance: {
              background: 'muted',
              border: 'topAndBottom',
              textColor: 'auto',
            },
            blockType: 'contact33',
            contentAlignment: 'left',
            description: 'Our advisors are ready to help.',
            eyebrow: 'Contact',
            form: {
              fields: [
                {
                  label: 'Name',
                  name: 'name',
                  required: true,
                  type: 'text',
                },
                {
                  label: 'Email',
                  name: 'email',
                  required: true,
                  type: 'email',
                },
                {
                  label: 'Subject',
                  name: 'subject',
                  options: [{ label: 'General', value: 'general' }],
                  required: false,
                  type: 'select',
                },
                {
                  label: 'Message',
                  name: 'message',
                  required: true,
                  type: 'textarea',
                },
              ],
              slug: 'contact',
              submitButtonLabel: 'Send',
              successMessage: 'Thanks.',
              title: 'Contact',
            },
            image: {
              alt: 'Advisor',
              height: 900,
              url: '/contact.jpg',
              width: 1200,
            },
            imageAlt: 'An advisor speaking with a visitor',
            imagePosition: 'right',
            size: 'default',
            title: 'Start a conversation',
          },
        ],
        slug: 'contact',
        title: 'Contact',
      } as never,
    })
    const html = renderToStaticMarkup(result)

    expect(html).toContain('data-page-block-stack="true"')
    expect(html).toContain('data-contact33-image-position="right"')
    expect(html).toContain('data-contact33-background="muted"')
    expect(html).toContain('Start a conversation')
    expect(html).toContain('border-y border-border')
  })

  it('registers contact33 in live preview rendering', () => {
    const source = readFileSync(
      'src/blocks/renderLivePreviewPageBlocks.tsx',
      'utf8',
    )

    expect(source).toContain(
      "import { Contact33BlockComponent } from './Contact33/Component'",
    )
    expect(source).toContain("case 'contact33':")
  })
})
