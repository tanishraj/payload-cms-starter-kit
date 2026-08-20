import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Field, GroupField, SelectField, TabsField } from 'payload'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'

import { FeeStructureBlockComponent } from '@/blocks/FeeStructure/Component'
import { FeeStructureBlock, validateFeeRows } from '@/blocks/FeeStructure/config'
import {
  isNumericFeeValue,
  normalizeFeeCategories,
} from '@/blocks/FeeStructure/normalizeFeeStructure'
import { renderLivePreviewPageBlocks } from '@/blocks/renderLivePreviewPageBlocks'
import { renderPageBlocks } from '@/blocks/renderPageBlocks'
import type { Media } from '@/payload-types'

afterEach(cleanup)

const findNamedField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field

    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const found = findNamedField(tab.fields, name)
        if (found) return found
      }
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      const found = findNamedField(field.fields, name)
      if (found) return found
    }
  }
}

describe('Fee Structure normalization', () => {
  it('trims authored values, preserves mixed currencies, and aligns cells to valid columns', () => {
    expect(
      normalizeFeeCategories([
        {
          id: 'general',
          label: ' General ',
          caption: ' Official general-category fees ',
          columns: [{ label: ' 1st Year ' }, { label: '   ' }, { label: ' 2nd Year ' }],
          rows: [
            {
              id: 'tuition',
              label: ' Tuition Fee ',
              emphasis: 'unexpected' as never,
              cells: [
                { value: ' Rs. 12,75,000 ' },
                { value: 'must not shift' },
                { value: ' USD 35,000 ' },
                { value: 'ignored extra' },
              ],
            },
            {
              label: ' Total ',
              emphasis: 'total',
              cells: [{ value: ' 17,50,000 ' }],
            },
            { label: '   ', cells: [{ value: 'discarded' }] },
          ],
          notes: [{ text: ' Total package: Rs. 71.75 lakhs ', emphasis: true }, { text: '   ' }],
        },
        { label: 'Invalid', columns: [], rows: [] },
      ]),
    ).toEqual([
      {
        id: 'general-0',
        label: 'General',
        caption: 'Official general-category fees',
        columns: [
          { id: 'column-0-0', label: '1st Year' },
          { id: 'column-0-2', label: '2nd Year' },
        ],
        rows: [
          {
            id: 'tuition-0',
            label: 'Tuition Fee',
            emphasis: 'standard',
            cells: ['Rs. 12,75,000', 'USD 35,000'],
          },
          {
            id: 'row-0-1',
            label: 'Total',
            emphasis: 'total',
            cells: ['17,50,000', '—'],
          },
        ],
        notes: [{ id: 'note-0-0', text: 'Total package: Rs. 71.75 lakhs', emphasis: true }],
      },
    ])
  })

  it('recognizes values containing digits without reinterpreting their currency', () => {
    expect(isNumericFeeValue('Rs. 12,75,000')).toBe(true)
    expect(isNumericFeeValue('USD 35,000')).toBe(true)
    expect(isNumericFeeValue('—')).toBe(false)
    expect(isNumericFeeValue('Not applicable')).toBe(false)
  })
})

describe('FeeStructureBlock schema', () => {
  it('defines the approved identity, tabs, limits, and defaults', () => {
    expect(FeeStructureBlock).toMatchObject({
      slug: 'feeStructure',
      interfaceName: 'FeeStructureBlock',
      labels: { singular: 'Fee Structure', plural: 'Fee Structures' },
    })
    expect(FeeStructureBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Fee Structure block preview',
      url: '/block-thumbnails/fee-structure.jpg',
    })

    const tabs = FeeStructureBlock.fields[0] as TabsField
    expect(tabs.tabs.map(({ label }) => label)).toEqual(['Content', 'Theme Settings'])
    expect(findNamedField(FeeStructureBlock.fields, 'programmeName')).toMatchObject({
      required: true,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'academicSession')).toMatchObject({
      required: true,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'feeCategories')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'columns')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'rows')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 30,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'cells')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'notes')).toMatchObject({
      type: 'array',
      maxRows: 8,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'downloadLabel')).toMatchObject({
      defaultValue: 'Download Fee Structure',
    })
  })

  it('requires row cell counts to match the category column count', async () => {
    expect(
      await validateFeeRows([{ cells: [{ value: '1' }, { value: '2' }] }], {
        siblingData: { columns: [{ label: 'Year 1' }, { label: 'Year 2' }] },
      } as never),
    ).toBe(true)
    expect(
      await validateFeeRows([{ cells: [{ value: '1' }] }], {
        siblingData: { columns: [{ label: 'Year 1' }, { label: 'Year 2' }] },
      } as never),
    ).toBe('Fee row 1 must contain exactly 2 values—one for each academic-period column.')
  })

  it('uses only the approved theme controls and hides tab style for one category', () => {
    const tabStyle = findNamedField(FeeStructureBlock.fields, 'tabStyle') as SelectField
    const tabWidth = findNamedField(FeeStructureBlock.fields, 'tabWidth') as SelectField
    const downloadActionMode = findNamedField(
      FeeStructureBlock.fields,
      'downloadActionMode',
    ) as SelectField
    const downloadButtonVariant = findNamedField(
      FeeStructureBlock.fields,
      'downloadButtonVariant',
    ) as SelectField
    const downloadAppearance = findNamedField(
      FeeStructureBlock.fields,
      'downloadAppearance',
    ) as GroupField

    expect(tabStyle).toMatchObject({
      defaultValue: 'underline',
      required: true,
      options: [
        { label: 'Underline', value: 'underline' },
        { label: 'Pills', value: 'pills' },
        { label: 'Boxed', value: 'boxed' },
      ],
    })
    expect(tabStyle.admin?.condition?.({}, { feeCategories: [{}] }, {} as never)).toBe(false)
    expect(tabStyle.admin?.condition?.({}, { feeCategories: [{}, {}] }, {} as never)).toBe(true)
    expect(tabWidth).toMatchObject({
      defaultValue: 'content',
      required: true,
      options: [
        { label: 'Content Width', value: 'content' },
        { label: 'Equal Full Width', value: 'equal' },
      ],
    })
    expect(tabWidth.admin?.condition?.({}, { feeCategories: [{}] }, {} as never)).toBe(false)
    expect(tabWidth.admin?.condition?.({}, { feeCategories: [{}, {}] }, {} as never)).toBe(true)
    expect(downloadActionMode).toMatchObject({
      defaultValue: 'button',
      required: true,
      options: [
        { label: 'Link', value: 'link' },
        { label: 'Button', value: 'button' },
      ],
    })
    expect(downloadActionMode.admin?.condition?.({}, { feeDocument: null }, {} as never)).toBe(
      false,
    )
    expect(downloadActionMode.admin?.condition?.({}, { feeDocument: 'fees' }, {} as never)).toBe(
      true,
    )
    expect(downloadButtonVariant).toMatchObject({
      defaultValue: 'outline',
      required: true,
    })
    expect(
      downloadButtonVariant.admin?.condition?.(
        {},
        { downloadActionMode: 'link', feeDocument: 'fees' },
        {} as never,
      ),
    ).toBe(false)
    expect(
      downloadButtonVariant.admin?.condition?.(
        {},
        { downloadActionMode: 'button', feeDocument: 'fees' },
        {} as never,
      ),
    ).toBe(true)
    expect(downloadAppearance).toMatchObject({
      label: 'Download Container Appearance',
      type: 'group',
    })
    expect(downloadAppearance.fields).toHaveLength(1)
    expect(findNamedField(downloadAppearance.fields, 'background')).toMatchObject({
      defaultValue: 'none',
      required: true,
    })
    expect(downloadAppearance.admin?.condition?.({}, { feeDocument: null }, {} as never)).toBe(
      false,
    )
    expect(downloadAppearance.admin?.condition?.({}, { feeDocument: 'fees' }, {} as never)).toBe(
      true,
    )
    expect(findNamedField(FeeStructureBlock.fields, 'contentAlignment')).toMatchObject({
      defaultValue: 'left',
      required: true,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'size')).toMatchObject({
      defaultValue: 'default',
      required: true,
    })
    expect(findNamedField(FeeStructureBlock.fields, 'headerLayout')).toBeUndefined()
    expect(findNamedField(FeeStructureBlock.fields, 'bankName')).toBeUndefined()
    expect(findNamedField(FeeStructureBlock.fields, 'accountNumber')).toBeUndefined()
    expect(findNamedField(FeeStructureBlock.fields, 'ifsc')).toBeUndefined()
  })
})

const generalCategory = {
  id: 'general',
  label: 'General',
  caption: 'General category fees for MBBS session 2026-27.',
  columns: [{ label: '1st Year' }, { label: '2nd Year' }],
  rows: [
    {
      label: 'Tuition Fee',
      cells: [{ value: '12,75,000' }, { value: '12,75,000' }],
    },
    {
      label: 'Admission Fee',
      note: 'One time',
      cells: [{ value: '1,00,000' }, { value: '—' }],
    },
    {
      label: 'Total',
      emphasis: 'total' as const,
      cells: [{ value: '17,50,000' }, { value: '15,50,000' }],
    },
  ],
  notes: [{ text: 'Total package for 4.5 years: Rs. 71.75 lakhs.', emphasis: true }],
}

const nriCategory = {
  id: 'nri',
  label: 'NRI',
  columns: [{ label: '1st Year' }, { label: '2nd Year' }],
  rows: [
    {
      label: 'Tuition Fee',
      cells: [{ value: 'USD 35,000' }, { value: 'USD 35,000' }],
    },
    {
      label: 'Admission Fee',
      note: 'One time',
      cells: [{ value: '1,00,000' }, { value: '—' }],
    },
  ],
  notes: [{ text: 'Amounts are displayed exactly as published.' }],
}

describe('FeeStructureBlockComponent', () => {
  it('renders one category directly as a desktop table and mobile period cards', () => {
    const html = renderToStaticMarkup(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory]}
        programmeName="MBBS"
        title="Fee Structure"
      />,
    )

    expect(html).toContain('data-fee-structure="true"')
    expect(html).toContain('<table')
    expect(html).toContain('<caption')
    expect(html).toContain('General category fees for MBBS session 2026-27.')
    expect(html).toContain('data-fee-structure-desktop="true"')
    expect(html).toContain('data-fee-structure-mobile="true"')
    expect(html.match(/data-fee-period-card="true"/g)).toHaveLength(2)
    expect(html).toContain('data-fee-row-emphasis="total"')
    expect(html).toContain('tabular-nums')
    expect(html).not.toContain('role="tablist"')
  })

  it('uses accessible tabs for multiple categories and keeps notes category-owned', () => {
    const { container } = render(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory, nriCategory]}
        programmeName="MBBS"
        tabStyle="pills"
      />,
    )

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['General', 'NRI'])
    expect(screen.getByText('Total package for 4.5 years: Rs. 71.75 lakhs.')).toBeTruthy()

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'NRI' }), {
      button: 0,
      ctrlKey: false,
    })

    expect(screen.getAllByText('USD 35,000').length).toBeGreaterThan(0)
    expect(screen.getByText('Amounts are displayed exactly as published.')).toBeTruthy()
    expect(container.querySelector('[data-fee-tab-style="pills"]')).toBeTruthy()
    expect(container.querySelector('[data-content-tab-variant="pill"]')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'NRI' }).className).toContain('min-h-11')
    expect(screen.getByRole('tab', { name: 'NRI' }).className).toContain('rounded-full')
  })

  it('maps legacy Fee Structure tab values onto the shared content-tab variants', () => {
    const { container } = render(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory, nriCategory]}
        programmeName="MBBS"
        tabStyle="boxed"
      />,
    )

    expect(container.querySelector('[data-fee-tab-style="boxed"]')).toBeTruthy()
    expect(container.querySelector('[data-content-tab-variant="contained"]')).toBeTruthy()
  })

  it('supports equal full-width category tabs at every breakpoint', () => {
    const { container } = render(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory, nriCategory]}
        programmeName="MBBS"
        tabWidth="equal"
      />,
    )

    const rail = container.querySelector('[data-fee-tab-width="equal"]')
    const tabs = screen.getAllByRole('tab')

    expect(rail?.className).toContain('w-full')
    expect(rail?.className).toContain('min-w-0')
    expect(tabs.every((tab) => tab.className.includes('flex-1'))).toBe(true)
    expect(tabs.every((tab) => tab.className.includes('w-0'))).toBe(true)
    expect(tabs.every((tab) => !tab.className.includes('sm:'))).toBe(true)
  })

  it.each([
    ['left', 'self-start'],
    ['center', 'mx-auto'],
  ] as const)(
    'constrains the fee context band when aligned %s',
    (contentAlignment, alignmentClass) => {
      const { container } = render(
        <FeeStructureBlockComponent
          academicSession="2026-27"
          contentAlignment={contentAlignment}
          description="Official programme fees."
          feeCategories={[generalCategory]}
          programmeName="MBBS"
        />,
      )

      const context = container.querySelector('[data-fee-context="true"]')
      expect(context?.className).toContain('w-full')
      expect(context?.className).toContain('max-w-3xl')
      expect(context?.className).toContain(alignmentClass)
    },
  )

  it.each(['none', 'brand'] as const)(
    'keeps header, standard, and total hover states consistent on %s surfaces',
    (background) => {
      const { container } = render(
        <FeeStructureBlockComponent
          academicSession="2026-27"
          appearance={{ background, border: 'none' }}
          feeCategories={[generalCategory]}
          programmeName="MBBS"
        />,
      )

      const header = container.querySelector('[data-fee-table-header-row="true"]')
      const standard = container.querySelector('[data-fee-row-emphasis="standard"]')
      const total = container.querySelector('[data-fee-row-emphasis="total"]')
      const standardLabel = standard?.querySelector('[data-fee-row-label="true"]')
      const totalLabel = total?.querySelector('[data-fee-row-label="true"]')

      expect(header?.className).toContain(
        background === 'brand' ? 'hover:bg-primary-foreground/[0.08]' : 'hover:bg-transparent',
      )
      const expectedStandardSurface =
        background === 'brand'
          ? '[&>*]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_6%)]'
          : '[&>*]:bg-card'
      const expectedStandardHover =
        background === 'brand'
          ? 'hover:[&>*]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_12%)]'
          : 'hover:[&>*]:bg-[color-mix(in_oklch,var(--card),var(--accent)_40%)]'
      const expectedTotalSurface =
        background === 'brand'
          ? '[&>*]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_10%)]'
          : '[&>*]:bg-[color-mix(in_oklch,var(--card),var(--accent)_55%)]'
      const expectedTotalHover =
        background === 'brand'
          ? 'hover:[&>*]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_18%)]'
          : 'hover:[&>*]:bg-[color-mix(in_oklch,var(--card),var(--accent)_75%)]'

      expect(standard?.className).toContain(expectedStandardSurface)
      expect(standard?.className).toContain(expectedStandardHover)
      expect(total?.className).toContain(expectedTotalSurface)
      expect(total?.className).toContain(expectedTotalHover)
      expect(standardLabel?.className).toContain('font-normal')
      expect(standardLabel?.className).not.toContain('font-medium')
      expect(total?.className).toContain('font-bold')
      expect(totalLabel?.className).toContain('font-bold')
      expect(standardLabel?.className).not.toContain('bg-card')
      expect(totalLabel?.className).not.toContain('bg-muted')
    },
  )

  it.each(['brand', 'gradient-brand'] as const)(
    'uses brand-compatible fee surfaces on %s sections',
    (background) => {
      const { container } = render(
        <FeeStructureBlockComponent
          academicSession="2026-27"
          appearance={{ background, border: 'none' }}
          feeCategories={[generalCategory]}
          programmeName="MBBS"
        />,
      )

      const surface = container.querySelector('[data-fee-surface="brand"]')
      expect(surface?.className).toContain('text-primary-foreground')
      expect(surface?.className).toContain('border-primary-foreground/20')
      expect(container.querySelector('[data-fee-table-header="true"]')?.className).toContain(
        'bg-primary-foreground/[0.08]',
      )
      expect(container.querySelector('[data-fee-sticky-head="true"]')?.className).toContain(
        'bg-primary',
      )
      expect(container.querySelector('[data-fee-row-emphasis="total"]')?.className).toContain(
        '[&>*]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_10%)]',
      )
      expect(container.querySelector('[data-fee-period-card="true"]')?.className).toContain(
        'text-primary-foreground',
      )
      expect(container.querySelector('[data-fee-category-notes="true"]')?.className).toContain(
        'text-primary-foreground/75',
      )
    },
  )

  it('retains semantic card colors on light section surfaces', () => {
    const { container } = render(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory]}
        programmeName="MBBS"
      />,
    )

    const surface = container.querySelector('[data-fee-surface="light"]')
    expect(surface?.className).toContain('bg-card')
    expect(surface?.className).toContain('text-card-foreground')
    expect(surface?.className).toContain('border-border')
  })

  it('right-aligns every fee value while reserving tabular numerals for numeric values', () => {
    const { container } = render(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory]}
        programmeName="MBBS"
      />,
    )

    const values = Array.from(container.querySelectorAll('[data-fee-value="true"]'))
    const placeholders = values.filter((element) => element.textContent === '—')
    const numericValues = values.filter((element) => element.textContent === '12,75,000')

    expect(values.length).toBeGreaterThan(0)
    expect(values.every((element) => element.className.includes('text-right'))).toBe(true)
    expect(placeholders.length).toBeGreaterThan(0)
    expect(placeholders.every((element) => !element.className.includes('tabular-nums'))).toBe(true)
    expect(numericValues.every((element) => element.className.includes('tabular-nums'))).toBe(true)
  })

  it('renders a valid Media download after categories and before footer actions', () => {
    const html = renderToStaticMarkup(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        feeCategories={[generalCategory]}
        feeDocument={
          {
            id: 'fees',
            mimeType: 'application/pdf',
            url: '/media/fees.pdf',
          } as Media
        }
        footerActions={[{ label: 'Admissions', linkType: 'custom', url: '/admissions' }]}
        programmeName="MBBS"
      />,
    )

    expect(html).toContain('href="/media/fees.pdf"')
    expect(html).toContain('download=""')
    expect(html).toContain('Download Fee Structure')
    expect(html).toContain('data-fee-download-mode="button"')
    expect(html).toContain('data-variant="outline"')
    expect(html).toContain('data-fee-download-background="none"')
    expect(html.indexOf('data-fee-document="true"')).toBeGreaterThan(
      html.indexOf('data-fee-categories="true"'),
    )
    expect(html.indexOf('data-fee-document="true"')).toBeLessThan(html.indexOf('Admissions'))
  })

  it('renders the uploaded fee document as a configured download link', () => {
    const html = renderToStaticMarkup(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        downloadActionMode="link"
        downloadLabel="Get official fees"
        feeCategories={[generalCategory]}
        feeDocument={{ id: 'fees', url: '/media/fees.pdf' } as Media}
        programmeName="MBBS"
      />,
    )

    expect(html).toContain('data-fee-download-mode="link"')
    expect(html).toContain('href="/media/fees.pdf"')
    expect(html).toContain('download=""')
    expect(html).toContain('Get official fees')
    expect(html).toContain('underline')
    expect(html).not.toContain('data-variant="outline"')
  })

  it.each(['brand', 'gradient-brand'] as const)(
    'applies %s download-container appearance with a readable configured button',
    (background) => {
      const html = renderToStaticMarkup(
        <FeeStructureBlockComponent
          academicSession="2026-27"
          downloadActionMode="button"
          downloadAppearance={{ background, border: 'none' }}
          downloadButtonVariant="whiteOutline"
          feeCategories={[generalCategory]}
          feeDocument={{ id: 'fees', url: '/media/fees.pdf' } as Media}
          programmeName="MBBS"
        />,
      )

      expect(html).toContain(`data-fee-download-background="${background}"`)
      expect(html).toContain(background === 'brand' ? 'bg-brand' : 'bg-gradient-brand')
      expect(html).toContain('text-primary-foreground')
      expect(html).toContain('data-variant="whiteOutline"')
      expect(html).toContain('href="/media/fees.pdf"')
      expect(html).toContain('download=""')
    },
  )

  it('keeps the fallback outline action readable when a transparent download container inherits a brand section', () => {
    const html = renderToStaticMarkup(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        appearance={{ background: 'brand', border: 'none' }}
        feeCategories={[generalCategory]}
        feeDocument={{ id: 'fees', url: '/media/fees.pdf' } as Media}
        programmeName="MBBS"
      />,
    )

    expect(html).toContain('data-fee-download-background="none"')
    expect(html).toContain('data-variant="outline"')
    expect(html).toContain('border-current/70 text-current')
  })

  it('omits invalid downloads and incomplete blocks without inventing content', () => {
    expect(
      renderToStaticMarkup(
        <FeeStructureBlockComponent
          academicSession="2026-27"
          feeCategories={[generalCategory]}
          feeDocument="unpopulated-media-id"
          programmeName="MBBS"
        />,
      ),
    ).not.toContain('data-fee-document="true"')
    expect(
      renderToStaticMarkup(
        <FeeStructureBlockComponent
          academicSession="2026-27"
          feeCategories={[]}
          programmeName="MBBS"
        />,
      ),
    ).toBe('')
    expect(
      renderToStaticMarkup(
        <FeeStructureBlockComponent
          academicSession=" "
          feeCategories={[generalCategory]}
          programmeName="MBBS"
        />,
      ),
    ).toBe('')
  })

  it('applies appearance, alignment, and spacing fallbacks through shared contracts', () => {
    const html = renderToStaticMarkup(
      <FeeStructureBlockComponent
        academicSession="2026-27"
        appearance={{ background: 'brand', border: 'topAndBottom' }}
        contentAlignment="center"
        feeCategories={[generalCategory]}
        programmeName="MBBS"
        size="compact"
      />,
    )

    expect(html).toContain('bg-brand text-primary-foreground border-y border-border')
    expect(html).toContain('py-8 md:py-10')
    expect(html).toContain('data-content-alignment="center"')
  })

  it('renders through production and live-preview pipelines', () => {
    const block = {
      blockType: 'feeStructure',
      academicSession: '2026-27',
      feeCategories: [generalCategory],
      programmeName: 'MBBS',
    } as never
    const production = renderToStaticMarkup(renderPageBlocks([block]))
    const preview = renderToStaticMarkup(
      renderLivePreviewPageBlocks([block], {} as never, {} as never, [], []),
    )

    expect(production).toContain('data-page-block-stack="true"')
    expect(production).toContain('data-fee-structure="true"')
    expect(preview).toContain('data-page-block-stack="true"')
    expect(preview).toContain('data-fee-structure="true"')
  })
})
