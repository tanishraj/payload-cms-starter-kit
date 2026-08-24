import { readFileSync } from 'node:fs'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { DepartmentProfilesBlockComponent } from '@/blocks/DepartmentProfiles/Component'
import { DepartmentProfilesClient } from '@/blocks/DepartmentProfiles/DepartmentProfilesClient'
import {
  DepartmentProfilesBlock,
  validateDepartmentRows,
  validateProfileDepartment,
} from '@/blocks/DepartmentProfiles/config'
import { getDepartmentOptionsFromFormFields } from '@/blocks/DepartmentProfiles/departmentOptions'
import type { ResolvedDepartmentProfile } from '@/blocks/DepartmentProfiles/types'
import { pageBuilderBlocks, reusableSectionBuilderBlocks } from '@/blocks/blockCatalog'

import { getGeneratedPayloadInterface } from './helpers/generatedPayloadInterface'

type InspectableField = {
  admin?: {
    components?: { Field?: string }
    condition?: (data: unknown, siblingData: Record<string, unknown>) => boolean
  }
  defaultValue?: unknown
  fields?: InspectableField[]
  maxRows?: number
  minRows?: number
  name?: string
  options?: Array<{ label?: string; value: string }>
  relationTo?: string
  required?: boolean
  tabs?: Array<{ fields: InspectableField[]; label: string }>
  type?: string
}

const tabs = (DepartmentProfilesBlock.fields[0] as unknown as InspectableField).tabs ?? []
const contentFields = tabs.find(({ label }) => label === 'Content')?.fields ?? []
const themeFields = tabs.find(({ label }) => label === 'Theme Settings')?.fields ?? []

const findField = (fields: InspectableField[], name: string): InspectableField | undefined => {
  for (const field of fields) {
    if (field.name === name) return field
    const nested = [...(field.fields ?? []), ...(field.tabs ?? []).flatMap((tab) => tab.fields)]
    const found = findField(nested, name)
    if (found) return found
  }
}

const departments = [
  { id: 'medicine', name: 'General Medicine' },
  { id: 'anatomy', name: 'Anatomy' },
  { id: 'empty', name: 'Radiology' },
]

const createProfile = (
  id: number,
  overrides: Partial<ResolvedDepartmentProfile> = {},
): ResolvedDepartmentProfile => ({
  departmentId: 'medicine',
  departmentName: 'General Medicine',
  designation: `Professor ${id}`,
  id,
  image: { alt: `Profile ${id}`, height: 1200, src: '/media/profile.jpg', width: 900 },
  imagePosition: 'center',
  name: `Doctor ${id}`,
  ...overrides,
})

const baseClientProps = {
  allTabLabel: 'All',
  background: 'none' as const,
  cardFrame: 'boxed' as const,
  cardLayout: 'overlay' as const,
  cardSize: 'lg' as const,
  columns: '4' as const,
  departments,
  hasSectionHeading: true,
  loadMoreLabel: 'Load More',
  noResultsMessage: 'No matching profiles found.',
  overlayCoverage: 'full' as const,
  overlayDirection: 'bottomToTop' as const,
  overlayStyle: 'dark' as const,
  profiles: [
    createProfile(1),
    createProfile(2, {
      departmentId: 'anatomy',
      departmentName: 'Anatomy',
      designation: 'Head of Department',
      name: 'Dr. Anjali Verma',
    }),
  ],
  profilesPerLoad: 20 as const,
  searchPlaceholder: 'Search profiles',
  showDepartmentTabs: true,
  showSearch: true,
  tabVariant: 'pill' as const,
  tabWidth: 'content' as const,
  themeMode: 'dark' as const,
}

const renderClient = (overrides: Partial<ComponentProps<typeof DepartmentProfilesClient>> = {}) =>
  renderToStaticMarkup(<DepartmentProfilesClient {...baseClientProps} {...overrides} />)

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(cleanup)

describe('Department Profiles block', () => {
  it('defines the approved schema and independent directory controls', () => {
    expect(DepartmentProfilesBlock).toMatchObject({
      interfaceName: 'DepartmentProfilesBlock',
      slug: 'departmentProfiles',
    })
    expect(tabs.map(({ label }) => label)).toEqual(['Content', 'Theme Settings'])
    expect(findField(contentFields, 'departments')).toMatchObject({
      maxRows: 50,
      minRows: 1,
      required: true,
      type: 'array',
    })
    expect(findField(contentFields, 'profiles')).toMatchObject({
      maxRows: 200,
      minRows: 1,
      required: true,
      type: 'array',
    })
    expect(findField(contentFields, 'image')).toMatchObject({
      relationTo: 'media',
      type: 'upload',
    })
    expect(findField(contentFields, 'image')?.required).not.toBe(true)
    expect(findField(contentFields, 'departmentId')).toMatchObject({
      required: true,
      type: 'text',
    })
    expect(findField(contentFields, 'departmentId')?.admin?.components?.Field).toContain(
      'DepartmentSelectField',
    )
    expect(findField(themeFields, 'showSearch')).toMatchObject({ defaultValue: true })
    expect(findField(themeFields, 'showDepartmentTabs')).toMatchObject({ defaultValue: true })
    expect(findField(themeFields, 'cardLayout')).toMatchObject({
      defaultValue: 'overlay',
      required: true,
    })
    expect(findField(themeFields, 'cardLayout')?.options?.map(({ value }) => value)).toEqual([
      'overlay',
      'inline',
    ])
    expect(findField(themeFields, 'cardSize')).toMatchObject({
      defaultValue: 'lg',
      required: true,
    })
    expect(findField(themeFields, 'cardSize')?.options?.map(({ value }) => value)).toEqual([
      'sm',
      'md',
      'lg',
    ])
    expect(findField(themeFields, 'columns')).toMatchObject({
      defaultValue: '4',
      required: true,
    })
    expect(findField(themeFields, 'columns')?.options?.map(({ value }) => value)).toEqual([
      '2',
      '3',
      '4',
    ])
    expect(findField(themeFields, 'mediumColumns')).toMatchObject({
      defaultValue: '6',
      required: true,
    })
    expect(findField(themeFields, 'mediumColumns')?.options?.map(({ value }) => value)).toEqual([
      '3',
      '4',
      '5',
      '6',
    ])
    expect(findField(themeFields, 'smallColumns')).toMatchObject({
      defaultValue: '8',
      required: true,
    })
    expect(findField(themeFields, 'smallColumns')?.options?.map(({ value }) => value)).toEqual([
      '4',
      '5',
      '6',
      '7',
      '8',
    ])
    expect(findField(themeFields, 'cardFrame')).toMatchObject({
      defaultValue: 'boxed',
      required: true,
    })
    expect(findField(themeFields, 'cardFrame')?.options?.map(({ value }) => value)).toEqual([
      'boxed',
      'framed',
      'open',
    ])
    expect(
      findField(themeFields, 'cardFrame')?.options?.find(({ value }) => value === 'open')?.label,
    ).toBe('Ruled Grid')
    expect(findField(themeFields, 'columns')?.admin?.condition?.({}, {})).toBe(true)
    expect(
      findField(themeFields, 'columns')?.admin?.condition?.(
        {},
        { cardLayout: 'overlay', cardSize: 'lg' },
      ),
    ).toBe(true)
    expect(
      findField(themeFields, 'columns')?.admin?.condition?.(
        {},
        { cardLayout: 'overlay', cardSize: 'md' },
      ),
    ).toBe(false)
    expect(
      findField(themeFields, 'columns')?.admin?.condition?.(
        {},
        { cardLayout: 'inline', cardSize: 'sm' },
      ),
    ).toBe(true)
    expect(
      findField(themeFields, 'mediumColumns')?.admin?.condition?.(
        {},
        { cardLayout: 'overlay', cardSize: 'md' },
      ),
    ).toBe(true)
    expect(
      findField(themeFields, 'mediumColumns')?.admin?.condition?.(
        {},
        { cardLayout: 'inline', cardSize: 'md' },
      ),
    ).toBe(false)
    expect(
      findField(themeFields, 'smallColumns')?.admin?.condition?.(
        {},
        { cardLayout: 'overlay', cardSize: 'sm' },
      ),
    ).toBe(true)
    expect(
      findField(themeFields, 'smallColumns')?.admin?.condition?.(
        {},
        { cardLayout: 'inline', cardSize: 'sm' },
      ),
    ).toBe(false)
    expect(findField(themeFields, 'profilesPerLoad')).toMatchObject({
      defaultValue: '20',
      required: true,
    })
    expect(findField(themeFields, 'profilesPerLoad')?.options?.map(({ value }) => value)).toEqual([
      '12',
      '16',
      '20',
      '24',
    ])
    expect(findField(themeFields, 'tabVariant')?.options?.map(({ value }) => value)).toEqual([
      'pill',
      'underline',
      'contained',
    ])
    const tabWidth = findField(themeFields, 'tabWidth')
    expect(tabWidth).toMatchObject({
      defaultValue: 'content',
      required: true,
      type: 'select',
      options: [
        { label: 'Content Width', value: 'content' },
        { label: 'Centered Auto Width', value: 'centered' },
        { label: 'Equal Full Width', value: 'equal' },
      ],
    })
    expect(tabWidth?.admin?.condition?.({}, { showDepartmentTabs: true })).toBe(true)
    expect(tabWidth?.admin?.condition?.({}, { showDepartmentTabs: false })).toBe(false)
    expect(findField(themeFields, 'themeMode')?.options?.map(({ value }) => value)).toEqual([
      'auto',
      'light',
      'dark',
      'brand',
    ])
    expect(findField(themeFields, 'overlayStyle')?.options?.map(({ value }) => value)).toEqual([
      'light',
      'dark',
      'darker',
    ])
    expect(findField(themeFields, 'overlayDirection')).toMatchObject({
      defaultValue: 'bottomToTop',
      required: true,
    })
    expect(findField(themeFields, 'overlayDirection')?.options?.map(({ value }) => value)).toEqual([
      'vertical',
      'leftToRight',
      'rightToLeft',
      'bottomToTop',
      'topToBottom',
    ])
    expect(findField(themeFields, 'overlayCoverage')).toMatchObject({
      defaultValue: 'full',
      required: true,
    })
    expect(findField(themeFields, 'overlayCoverage')?.options).toContainEqual({
      label: 'Split (50%)',
      value: 'split',
    })
    expect(
      ['themeMode', 'overlayStyle', 'overlayDirection', 'overlayCoverage'].map((name) =>
        themeFields.findIndex((field) => field.name === name),
      ),
    ).toEqual([
      themeFields.findIndex((field) => field.name === 'themeMode'),
      themeFields.findIndex((field) => field.name === 'themeMode') + 1,
      themeFields.findIndex((field) => field.name === 'themeMode') + 2,
      themeFields.findIndex((field) => field.name === 'themeMode') + 3,
    ])
    expect(
      findField(themeFields, 'themeMode')?.admin?.condition?.({}, { cardLayout: 'inline' }),
    ).toBe(false)
    expect(
      findField(themeFields, 'overlayStyle')?.admin?.condition?.({}, { cardLayout: 'overlay' }),
    ).toBe(true)
    expect(
      findField(themeFields, 'overlayDirection')?.admin?.condition?.({}, { cardLayout: 'inline' }),
    ).toBe(false)
    expect(
      findField(themeFields, 'overlayCoverage')?.admin?.condition?.({}, { cardLayout: 'overlay' }),
    ).toBe(true)
  })

  it('validates unique departments and assigned department IDs', () => {
    expect(validateDepartmentRows([{ name: 'Anatomy' }, { name: ' anatomy ' }])).toBe(
      'Department names must be unique.',
    )
    expect(validateDepartmentRows([{ name: 'Anatomy' }, { name: 'Medicine' }])).toBe(true)
    expect(
      validateProfileDepartment('anatomy', {
        blockData: { departments: [{ id: 'anatomy', name: 'Anatomy' }] },
      }),
    ).toBe(true)
    expect(
      validateProfileDepartment('deleted', {
        blockData: { departments: [{ id: 'anatomy', name: 'Anatomy' }] },
      }),
    ).toContain('no longer available')
  })

  it('derives ordered Admin options and preserves invalid saved values', () => {
    const fields = {
      'layout.2.departments.0.id': { value: 'medicine' },
      'layout.2.departments.0.name': { value: ' General Medicine ' },
      'layout.2.departments.1.id': { value: 'anatomy' },
      'layout.2.departments.1.name': { value: 'Anatomy' },
    }

    expect(getDepartmentOptionsFromFormFields(fields, 'layout.2.profiles.0.departmentId')).toEqual([
      { label: 'General Medicine', value: 'medicine' },
      { label: 'Anatomy', value: 'anatomy' },
    ])
    expect(
      getDepartmentOptionsFromFormFields(fields, 'layout.2.profiles.0.departmentId', 'deleted'),
    ).toContainEqual({ label: 'Unavailable department', value: 'deleted' })
  })

  it('normalizes departments and profiles into static portrait cards', () => {
    const html = renderToStaticMarkup(
      <DepartmentProfilesBlockComponent
        departments={departments}
        profiles={[
          {
            departmentId: 'medicine',
            designation: ' Professor & HOD ',
            image: { alt: '', height: 1200, url: '/media/profile.jpg', width: 900 },
            name: ' Dr. Rakesh Kumar Jha ',
          },
          {
            departmentId: 'anatomy',
            designation: 'Associate Professor',
            name: ' Dr. No Portrait ',
          },
          {
            departmentId: 'missing',
            image: { height: 1200, url: '/media/missing.jpg', width: 900 },
            name: 'Invalid profile',
          },
        ]}
        title="Faculty Directory"
      />,
    )

    expect(html).toContain('data-department-profiles="true"')
    expect(html).toContain('data-department-profiles-card-layout="overlay"')
    expect(html).toContain('data-department-profiles-card-size="lg"')
    expect(html).toContain('data-department-profiles-card-frame="boxed"')
    expect(html).toContain('data-department-profiles-columns="4"')
    expect(html).toContain('data-department-profile-card="true"')
    expect(html).toContain('data-department-profile-overlay-coverage="full"')
    expect(html).toContain('data-department-profile-overlay-direction="bottomToTop"')
    expect(html).toContain('aspect-3/4')
    expect(html).toContain('grid-cols-1')
    expect(html).toContain('sm:grid-cols-2')
    expect(html).toContain('lg:grid-cols-4')
    expect(html).toContain('lg:flex-row')
    expect(html).toContain('overflow-x-auto')
    expect(html).toContain('General Medicine')
    expect(html).toContain('Dr. Rakesh Kumar Jha')
    expect(html).toContain('Professor &amp; HOD')
    expect(html).toContain('Dr. No Portrait')
    expect(html).toContain('data-department-profile-placeholder="true"')
    expect(html).not.toContain('Invalid profile')
    expect(html).toContain('alt="Dr. Rakesh Kumar Jha"')

    const inlineHtml = renderToStaticMarkup(
      <DepartmentProfilesBlockComponent
        cardLayout="inline"
        cardSize="sm"
        departments={departments}
        profiles={[{ departmentId: 'medicine', name: 'Doctor Inline' }]}
      />,
    )

    expect(inlineHtml).toContain('data-department-profiles-card-layout="inline"')
    expect(inlineHtml).toContain('data-department-profiles-card-size="sm"')

    const renderBlock = (overrides: Record<string, unknown>) =>
      renderToStaticMarkup(
        <DepartmentProfilesBlockComponent
          {...({
            departments,
            profiles: [{ departmentId: 'medicine', name: 'Doctor Columns' }],
            ...overrides,
          } as Parameters<typeof DepartmentProfilesBlockComponent>[0])}
        />,
      )

    expect(renderBlock({ cardSize: 'md', mediumColumns: '5' })).toContain(
      'data-department-profiles-columns="5"',
    )
    expect(renderBlock({ cardSize: 'sm', smallColumns: '7' })).toContain(
      'data-department-profiles-columns="7"',
    )
    expect(renderBlock({ cardSize: 'md', mediumColumns: '8' })).toContain(
      'data-department-profiles-columns="6"',
    )
    expect(renderBlock({ cardFrame: 'framed' })).toContain(
      'data-department-profiles-card-frame="framed"',
    )
    expect(
      renderBlock({
        cardLayout: 'inline',
        cardSize: 'sm',
        columns: '3',
        smallColumns: '7',
      }),
    ).toContain('data-department-profiles-columns="3"')

    const splitOverlay = renderBlock({
      overlayCoverage: 'split',
      overlayDirection: 'bottomToTop',
      overlayStyle: 'light',
      themeMode: 'light',
    })
    expect(splitOverlay).toContain('data-department-profile-overlay-coverage="split"')
    expect(splitOverlay).toContain('data-department-profile-overlay-direction="bottomToTop"')
    expect(splitOverlay).toContain('data-department-profile-overlay="light"')
    expect(splitOverlay).toContain('data-department-profile-overlay-tone="light"')
    expect(splitOverlay).toContain('h-1/2')
    expect(splitOverlay).toContain('bg-linear-to-t')
    expect(splitOverlay).toContain('text-light-overlay-foreground')

    const evenSplitOverlay = renderBlock({
      overlayCoverage: 'split',
      overlayDirection: 'vertical',
    })
    expect(evenSplitOverlay).toContain('data-department-profile-overlay-coverage="full"')
    expect(evenSplitOverlay).toContain('data-department-profile-overlay-direction="vertical"')

    const invalidOverlay = renderBlock({
      overlayCoverage: 'invalid',
      overlayDirection: 'invalid',
      overlayStyle: 'invalid',
      themeMode: 'invalid',
    })
    expect(invalidOverlay).toContain('data-department-profile-overlay-coverage="full"')
    expect(invalidOverlay).toContain('data-department-profile-overlay-direction="bottomToTop"')
    expect(invalidOverlay).toContain('data-department-profile-overlay="dark"')
    expect(invalidOverlay).toContain('data-department-profile-overlay-tone="dark"')
  })

  it('renders every overlay and inline card size with a missing-image fallback', () => {
    const renderDirectory = (
      cardLayout: 'inline' | 'overlay',
      cardSize: 'lg' | 'md' | 'sm',
      profiles = baseClientProps.profiles,
    ) =>
      renderToStaticMarkup(
        <DepartmentProfilesClient
          {...baseClientProps}
          cardLayout={cardLayout}
          cardSize={cardSize}
          profiles={profiles}
        />,
      )

    const overlayLarge = renderDirectory('overlay', 'lg')
    const overlayMedium = renderDirectory('overlay', 'md')
    const overlaySmall = renderDirectory('overlay', 'sm')

    expect(overlayLarge).toContain('aspect-4/5 sm:aspect-3/4')
    expect(overlayMedium).toContain('aspect-4/5 sm:aspect-3/4')
    expect(overlaySmall).toContain('aspect-4/5 sm:aspect-3/4')
    expect(overlayLarge).not.toContain('aspect-4/3')
    expect(overlayMedium).not.toContain('aspect-square')
    expect(overlaySmall).not.toContain('aspect-5/4')
    expect(overlayLarge).toContain('gap-1 p-5 pt-20')
    expect(overlayMedium).toContain('gap-1 p-4 pt-16')
    expect(overlaySmall).toContain('gap-0.5 p-3.5 pt-12')

    const inlineLarge = renderDirectory('inline', 'lg')
    const inlineMedium = renderDirectory('inline', 'md')
    const inlineSmall = renderDirectory('inline', 'sm')

    expect(inlineLarge).toContain('data-department-profile-size="lg"')
    expect(inlineLarge).toContain('size-24')
    expect(inlineMedium).toContain('data-department-profile-size="md"')
    expect(inlineMedium).toContain('size-20')
    expect(inlineSmall).toContain('data-department-profile-size="sm"')
    expect(inlineSmall).toContain('size-16')
    expect(inlineSmall).not.toContain('max-w-64 sm:max-w-none')
    expect(inlineMedium).toContain('data-department-profile-layout="inline"')
    const firstInlineCard = inlineMedium.slice(
      inlineMedium.indexOf('<article'),
      inlineMedium.indexOf('</article>') + '</article>'.length,
    )
    expect(firstInlineCard.indexOf('Doctor 1')).toBeLessThan(firstInlineCard.indexOf('Professor 1'))
    expect(firstInlineCard.indexOf('Professor 1')).toBeLessThan(
      firstInlineCard.indexOf('General Medicine'),
    )

    const withoutImage = renderDirectory('inline', 'md', [
      createProfile(50, { image: undefined, name: 'Doctor Without Portrait' }),
    ])
    expect(withoutImage).toContain('data-department-profile-placeholder="true"')
    expect(withoutImage).toContain('lucide-user-round')
    const placeholderIndex = withoutImage.indexOf('data-department-profile-placeholder="true"')
    const inlinePlaceholderElement = withoutImage.slice(
      Math.max(0, placeholderIndex - 180),
      placeholderIndex + 80,
    )
    expect(inlinePlaceholderElement).toContain('bg-current/10')
    expect(inlinePlaceholderElement).not.toContain('ring-')
    expect(inlinePlaceholderElement).toContain('text-muted-foreground')
    expect(inlinePlaceholderElement).not.toContain('bg-muted')
    expect(withoutImage).not.toContain('bg-background/60')

    const overlayWithoutImage = renderDirectory('overlay', 'md', [
      createProfile(51, { image: undefined, name: 'Overlay Without Portrait' }),
    ])
    expect(overlayWithoutImage).toContain(
      'items-center justify-center bg-muted text-muted-foreground',
    )
  })

  it('renders responsive density and frame geometry for both card layouts', () => {
    expect(renderClient({ columns: '2' })).toContain('sm:grid-cols-2')
    expect(renderClient({ columns: '3' })).toContain('lg:grid-cols-3')
    expect(renderClient({ columns: '4' })).toContain('lg:grid-cols-4')
    expect(renderClient({ columns: '5' })).toContain('2xl:grid-cols-5')
    expect(renderClient({ columns: '6' })).toContain('2xl:grid-cols-6')
    expect(renderClient({ columns: '7' })).toContain('2xl:grid-cols-7')
    expect(renderClient({ columns: '8' })).toContain('2xl:grid-cols-8')
    expect(renderClient({ cardLayout: 'overlay', cardSize: 'lg' })).toContain(
      'mx-auto w-full max-w-80 sm:max-w-none',
    )
    expect(renderClient({ cardLayout: 'overlay', cardSize: 'md' })).toContain(
      'mx-auto w-full max-w-72 sm:max-w-none',
    )
    expect(renderClient({ cardLayout: 'overlay', cardSize: 'sm' })).toContain(
      'mx-auto w-full max-w-64 sm:max-w-none',
    )

    const boxedInline = renderClient({ cardFrame: 'boxed', cardLayout: 'inline' })
    expect(boxedInline).toContain('data-department-profiles-card-frame="boxed"')
    expect(boxedInline).toContain('grid gap-5 sm:gap-6')
    expect(boxedInline).toContain('rounded-xl border')

    const framedInline = renderClient({
      cardFrame: 'framed',
      cardLayout: 'inline',
      columns: '4',
    })
    expect(framedInline).toContain('data-department-profiles-frame="framed"')
    expect(framedInline).toContain('overflow-hidden border-current/15 border')
    expect(framedInline).toContain('-mb-px -mr-px grid')
    expect(framedInline).toContain('min-w-0 border-r border-b border-current/15')
    expect(framedInline).not.toContain('grid gap-5 sm:gap-6')

    const openOverlay = renderClient({
      cardFrame: 'open',
      cardLayout: 'overlay',
      cardSize: 'sm',
      columns: '8',
    })
    expect(openOverlay).toContain('data-department-profiles-frame="open"')
    expect(openOverlay).toContain('overflow-hidden border-current/15')
    expect(openOverlay).toContain('border-y')
    expect(openOverlay).toContain('mx-auto w-full max-w-64 sm:max-w-none')
    expect(openOverlay).toContain('-mb-px -mr-px grid')
    expect(openOverlay).not.toContain('rounded-xl border border-current/20')
  })

  it.each([
    ['content', ['w-max', 'min-w-full']],
    ['centered', ['mx-auto', 'w-max']],
    ['equal', ['w-full', 'min-w-0']],
  ] as const)('applies the %s department-tab width', (tabWidth, expectedClasses) => {
    render(<DepartmentProfilesClient {...baseClientProps} tabWidth={tabWidth} />)

    const tablist = screen.getByRole('tablist', { name: 'Profile departments' })
    expect(tablist.getAttribute('data-department-profiles-tab-width')).toBe(tabWidth)
    for (const className of expectedClasses) expect(tablist.className).toContain(className)

    for (const tab of screen.getAllByRole('tab')) {
      if (tabWidth === 'equal') {
        expect(tab.className).toContain('w-0')
        expect(tab.className).toContain('flex-1')
        expect(tab.className).toContain('text-ellipsis')
      } else {
        expect(tab.className).not.toContain('w-0')
      }
    }
  })

  it('normalizes missing and invalid tab widths to Content Width', () => {
    const renderBlock = (tabWidth?: string | null) =>
      renderToStaticMarkup(
        <DepartmentProfilesBlockComponent
          departments={departments}
          profiles={[{ departmentId: 'medicine', name: 'Doctor One' }]}
          tabWidth={tabWidth as never}
        />,
      )

    for (const html of [renderBlock(), renderBlock('invalid')]) {
      expect(html).toContain('data-department-profiles-tab-width="content"')
      expect(html).toContain('w-max min-w-full')
    }
  })

  it('filters by department and combines tabs with full-list search', () => {
    const profiles = Array.from({ length: 13 }, (_, index) => createProfile(index + 1))
    profiles[12] = createProfile(13, {
      departmentId: 'anatomy',
      departmentName: 'Anatomy',
      designation: 'Hidden specialist',
      image: undefined,
      name: 'Dr. Hidden Match',
    })

    render(
      <DepartmentProfilesClient {...baseClientProps} profiles={profiles} profilesPerLoad={12} />,
    )

    expect(screen.queryByText('Dr. Hidden Match')).toBeNull()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search profiles' }), {
      target: { value: 'hidden specialist' },
    })
    expect(screen.getByText('Dr. Hidden Match')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'General Medicine' }))
    expect(screen.queryByText('Dr. Hidden Match')).toBeNull()
    expect(screen.getByRole('status').textContent).toContain('0 profiles found')
  })

  it('supports accessible tabs, empty-department omission, and Load More', () => {
    const profiles = Array.from({ length: 21 }, (_, index) => createProfile(index + 1))
    render(<DepartmentProfilesClient {...baseClientProps} profiles={profiles} />)

    expect(screen.getByRole('tab', { name: 'All' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.queryByRole('tab', { name: 'Radiology' })).toBeNull()
    expect(screen.getAllByTestId('department-profile-card')).toHaveLength(20)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    expect(screen.getAllByTestId('department-profile-card')).toHaveLength(21)
    expect(screen.queryByRole('button', { name: 'Load More' })).toBeNull()
  })

  it('hides search and tabs independently without hiding profiles', () => {
    const { rerender } = render(
      <DepartmentProfilesClient {...baseClientProps} showDepartmentTabs={false} />,
    )

    expect(screen.getByRole('searchbox', { name: 'Search profiles' })).toBeTruthy()
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.getAllByTestId('department-profile-card')).toHaveLength(2)

    rerender(
      <DepartmentProfilesClient {...baseClientProps} showDepartmentTabs showSearch={false} />,
    )
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.getByRole('tab', { name: 'All' })).toBeTruthy()
  })

  it('registers production, preview, thumbnail, and generated type contracts', () => {
    const production = readFileSync('src/blocks/renderPageBlocks.tsx', 'utf8')
    const preview = readFileSync('src/blocks/renderLivePreviewPageBlocks.tsx', 'utf8')
    const generated = readFileSync('src/payload-types.ts', 'utf8')
    const generatedDepartmentProfiles = getGeneratedPayloadInterface(
      generated,
      'DepartmentProfilesBlock',
    )

    expect(pageBuilderBlocks.map(({ slug }) => slug)).toContain('departmentProfiles')
    expect(reusableSectionBuilderBlocks.map(({ slug }) => slug)).toContain('departmentProfiles')
    expect(production).toContain("case 'departmentProfiles'")
    expect(preview).toContain("case 'departmentProfiles'")
    expect(generatedDepartmentProfiles).toContain('export interface DepartmentProfilesBlock')
    expect(generatedDepartmentProfiles).toContain("cardLayout: 'overlay' | 'inline'")
    expect(generatedDepartmentProfiles).toContain("cardSize: 'sm' | 'md' | 'lg'")
    expect(generatedDepartmentProfiles).toContain("mediumColumns?: ('3' | '4' | '5' | '6') | null")
    expect(generatedDepartmentProfiles).toContain(
      "smallColumns?: ('4' | '5' | '6' | '7' | '8') | null",
    )
    expect(generatedDepartmentProfiles).toContain("cardFrame: 'boxed' | 'framed' | 'open'")
    expect(generatedDepartmentProfiles).toContain(
      "tabWidth?: ('content' | 'centered' | 'equal') | null",
    )
    expect(generatedDepartmentProfiles).toContain(
      "themeMode?: ('auto' | 'light' | 'dark' | 'brand') | null",
    )
    expect(generatedDepartmentProfiles).toContain(
      "overlayStyle?: ('light' | 'dark' | 'darker') | null",
    )
    expect(generatedDepartmentProfiles).toContain(
      "overlayDirection?: ('vertical' | 'leftToRight' | 'rightToLeft' | 'bottomToTop' | 'topToBottom') | null",
    )
    expect(generatedDepartmentProfiles).toContain("overlayCoverage?: ('full' | 'split') | null")
    expect(generatedDepartmentProfiles).toContain("blockType: 'departmentProfiles'")
  })
})
