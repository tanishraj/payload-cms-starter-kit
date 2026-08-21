import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AcademicProgrammesBlockComponent } from '@/blocks/AcademicProgrammes/Component'
import { AcademicProgrammesBlock } from '@/blocks/AcademicProgrammes/config'

type NamedField = {
  defaultValue?: unknown
  fields?: NamedField[]
  name?: string
  options?: Array<{ value: string }>
  required?: boolean
  tabs?: Array<{ fields: NamedField[]; label: string }>
  type?: string
}

const findNamedField = (fields: NamedField[], name: string): NamedField | undefined => {
  for (const field of fields) {
    if (field.name === name) return field

    const nested = field.fields ?? field.tabs?.flatMap((tab) => tab.fields) ?? []
    const match = findNamedField(nested, name)
    if (match) return match
  }

  return undefined
}

describe('Academic Programmes block', () => {
  it('keeps content and theme controls aligned with editorial blocks', () => {
    const tabs = AcademicProgrammesBlock.fields[0] as NamedField
    const fields = tabs.tabs?.flatMap((tab) => tab.fields) ?? []

    expect(AcademicProgrammesBlock).toMatchObject({
      interfaceName: 'AcademicProgrammesBlock',
      slug: 'academicProgrammes',
    })
    expect(tabs.tabs?.map((tab) => tab.label)).toEqual(['Content', 'Theme Settings'])
    expect(findNamedField(fields, 'programmes')).toMatchObject({
      minRows: 1,
      required: true,
      type: 'array',
    })
    expect(findNamedField(fields, 'headerLayout')).toMatchObject({
      defaultValue: 'split',
      required: true,
      type: 'select',
    })
    expect(findNamedField(fields, 'contentAlignment')).toMatchObject({
      defaultValue: 'left',
      required: true,
      type: 'select',
    })
    expect(
      findNamedField(fields, 'contentAlignment')?.options?.map((option) => option.value),
    ).toEqual(['left', 'center', 'right'])
    expect(findNamedField(fields, 'columns')?.options?.map((option) => option.value)).toEqual([
      '2',
      '3',
      '4',
    ])
    expect(findNamedField(fields, 'featureFirstProgramme')).toBeUndefined()
    expect(findNamedField(fields, 'descriptionPosition')).toMatchObject({
      defaultValue: 'side',
      required: true,
      type: 'select',
    })
    expect(findNamedField(fields, 'sideContentAlignment')).toMatchObject({
      defaultValue: 'bottom',
      required: true,
      type: 'select',
    })
  })

  it('renders the editorial cards with shared typography, tall media, and ruled links', () => {
    const html = renderToStaticMarkup(
      <AcademicProgrammesBlockComponent
        accentTitle="in medicine."
        appearance={{ background: 'subtle', border: 'none' }}
        description="Programmes designed for clinical confidence."
        eyebrow="Academic programmes"
        programmes={[
          {
            ctaLabel: 'Explore MBBS',
            description: 'Competency-based education and clinical exposure.',
            eyebrow: 'Undergraduate',
            image: { alt: 'Anatomy teaching model', url: '/media/anatomy.jpg' },
            linkType: 'custom',
            title: 'MBBS',
            url: '/programmes/mbbs',
          },
        ]}
        title="Begin your journey"
      />,
    )

    expect(html).toContain('data-academic-programmes="true"')
    expect(html).toContain('data-academic-programmes-header="split"')
    const splitHeaderClasses =
      html
        .match(/<header class="([^"]+)" data-academic-programmes-header="split">/)?.[1]
        ?.split(' ') ?? []
    expect(splitHeaderClasses).toContain('lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]')
    expect(splitHeaderClasses).not.toContain('w-full')
    expect(splitHeaderClasses).not.toContain('max-w-3xl')
    expect(splitHeaderClasses).not.toContain('mr-auto')
    expect(splitHeaderClasses).not.toContain('mx-auto')
    expect(splitHeaderClasses).not.toContain('ml-auto')
    expect(html).toContain('Begin your journey')
    expect(html).toContain('in medicine.')
    expect(html).toContain('href="/programmes/mbbs"')
    expect(html).toContain('text-3xl')
    expect(html).toContain('h-64')
    expect(html).toContain('data-section-eyebrow="true"')
    expect(html).toContain('border-t')
    expect(html).toContain('data-academic-programme-link="true"')
    expect(html).toContain('w-full justify-between')
    expect(html.match(/<a /g)).toHaveLength(1)
    expect(html).toContain('motion-safe:transition-transform')
    expect(html).not.toContain('text-success')
  })

  it.each([
    ['left', 'mr-auto'],
    ['center', 'mx-auto'],
    ['right', 'ml-auto'],
  ] as const)(
    'positions a %s-aligned stacked header across the full container',
    (alignment, outerClass) => {
      const html = renderToStaticMarkup(
        <AcademicProgrammesBlockComponent
          contentAlignment={alignment}
          description="Programmes designed for clinical confidence."
          headerLayout="stacked"
          programmes={[
            {
              image: { alt: 'Anatomy teaching model', url: '/media/anatomy.jpg' },
              title: 'MBBS',
            },
          ]}
          title="Begin your journey"
        />,
      )
      const headerClasses =
        html
          .match(/<header class="([^"]+)" data-academic-programmes-header="stacked">/)?.[1]
          ?.split(' ') ?? []

      expect(headerClasses).toEqual(
        expect.arrayContaining(['grid', 'gap-6', 'w-full', 'max-w-3xl', outerClass]),
      )
      expect(html).toContain(`data-content-alignment="${alignment}"`)
      if (alignment === 'center') {
        expect(html).toContain('mx-auto items-center text-center')
      }
    },
  )

  it('moves the description under the title and aligns right-column actions', () => {
    const html = renderToStaticMarkup(
      <AcademicProgrammesBlockComponent
        actions={[
          {
            label: 'View all programmes',
            linkType: 'custom',
            url: '/programmes',
          },
        ]}
        description="Programmes designed for clinical confidence."
        descriptionPosition="underTitle"
        programmes={[
          {
            image: { alt: 'Anatomy teaching model', url: '/media/anatomy.jpg' },
            title: 'MBBS',
          },
        ]}
        sideContentAlignment="top"
        title="Begin your journey"
      />,
    )

    expect(html).toContain('data-academic-programmes-side-alignment="top"')
    expect(html).toContain('View all programmes')
    expect(html).toContain('lg:self-start')
    expect(html).toContain('ml-auto w-full items-end text-right')
  })

  it('aligns section and footer actions inside the padded container', () => {
    const html = renderToStaticMarkup(
      <AcademicProgrammesBlockComponent
        contentAlignment="right"
        footerActions={[
          {
            label: 'View all programmes',
            linkType: 'custom',
            url: '/programmes',
          },
        ]}
        programmes={[
          {
            image: { alt: 'Anatomy teaching model', url: '/media/anatomy.jpg' },
            title: 'MBBS',
          },
        ]}
        title="Begin your journey"
      />,
    )

    expect(html).toContain('data-content-alignment="right"')
    expect(html).toContain('data-academic-programmes-footer-actions="true"')
    expect(html).toContain('items-end')
    expect(html).toContain('justify-center')
    expect(html.indexOf('data-academic-programmes-footer-actions')).toBeLessThan(
      html.indexOf('</section>'),
    )
  })

  it('does not render without a title or usable programme image', () => {
    expect(
      renderToStaticMarkup(
        <AcademicProgrammesBlockComponent programmes={[]} title="Academic programmes" />,
      ),
    ).toBe('')
    expect(
      renderToStaticMarkup(
        <AcademicProgrammesBlockComponent
          programmes={[{ title: 'MBBS' }]}
          title="Academic programmes"
        />,
      ),
    ).toBe('')
  })
})
