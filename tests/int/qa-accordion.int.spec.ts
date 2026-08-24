import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Field, SelectField, Tab } from 'payload'
import { describe, expect, it } from 'vitest'

import { QaAccordionBlockComponent } from '@/blocks/QaAccordion/Component'
import { QaAccordionBlock } from '@/blocks/QaAccordion/config'
import { resolveQaAccordionLayout } from '@/blocks/QaAccordion/layoutContract'
import { regularBlockContainerClasses } from '@/blocks/shared/blockSpacing'

const createRichText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const getTabs = () => {
  const tabsField = QaAccordionBlock.fields[0]

  if (tabsField?.type !== 'tabs' || typeof tabsField.tabs === 'function') {
    throw new Error('Expected Q&A Accordion to use static tabs')
  }

  return tabsField.tabs as Tab[]
}

const getNamedField = (fields: Field[], name: string) => {
  const field = fields.find((candidate) => 'name' in candidate && candidate.name === name)

  if (!field || !('name' in field)) {
    throw new Error(`Expected Q&A Accordion field: ${name}`)
  }

  return field
}

describe('Q&A Accordion layout compatibility', () => {
  it.each([
    ['fullWidth', 'stacked', 'balanced'],
    ['fiftyFifty', 'split', 'balanced'],
    ['oneThird', 'split', 'qaFocus'],
  ] as const)('normalizes legacy %s without rewriting content', (legacy, mode, proportion) => {
    const input = { layoutMode: legacy }

    expect(resolveQaAccordionLayout(input)).toEqual({
      layoutMode: mode,
      sectionVerticalAlignment: 'top',
      splitProportion: proportion,
    })
    expect(input).toEqual({ layoutMode: legacy })
  })

  it('defaults invalid values to Split, Balanced, and Top', () => {
    expect(resolveQaAccordionLayout({ layoutMode: 'invalid' })).toEqual({
      layoutMode: 'split',
      sectionVerticalAlignment: 'top',
      splitProportion: 'balanced',
    })
  })
})

describe('Q&A Accordion block', () => {
  it('describes section-content split controls without changing their stored values', () => {
    const tabs = getTabs()
    const contentTab = tabs.find((tab) => tab.label === 'Content')
    const themeTab = tabs.find((tab) => tab.label === 'Theme Settings')

    if (!contentTab || !themeTab) {
      throw new Error('Expected Q&A Accordion Content and Theme Settings tabs')
    }

    const layoutMode = getNamedField(themeTab.fields, 'layoutMode') as SelectField
    const placement = getNamedField(themeTab.fields, 'accordionPlacement') as SelectField
    const sideColumn = getNamedField(contentTab.fields, 'sideColumn')

    expect(layoutMode.defaultValue).toBe('fiftyFifty')
    expect(layoutMode.options).toEqual([
      { label: '50 / 50', value: 'fiftyFifty' },
      { label: 'One-Third Content / Two-Thirds Q&A', value: 'oneThird' },
      { label: 'Full Width', value: 'fullWidth' },
    ])
    expect(placement.label).toBe('Q&A Placement')
    expect(placement.defaultValue).toBe('right')
    expect(placement.options).toEqual([
      { label: 'Left', value: 'left' },
      { label: 'Right', value: 'right' },
    ])

    const placementCondition = placement.admin?.condition
    const sideColumnCondition = 'admin' in sideColumn ? sideColumn.admin?.condition : undefined

    expect(placementCondition?.({}, { layoutMode: 'fiftyFifty' }, {} as never)).toBe(true)
    expect(placementCondition?.({}, { layoutMode: 'oneThird' }, {} as never)).toBe(true)
    expect(placementCondition?.({}, { layoutMode: 'fullWidth' }, {} as never)).toBe(false)
    expect(sideColumnCondition?.({}, { layoutMode: 'fiftyFifty' }, {} as never)).toBe(true)
    expect(sideColumnCondition?.({}, { layoutMode: 'oneThird' }, {} as never)).toBe(true)
    expect(sideColumnCondition?.({}, { layoutMode: 'fullWidth' }, {} as never)).toBe(false)
  })

  it('renders a one-third layout with the Q&A accordion on the right', () => {
    const html = renderToStaticMarkup(
      createElement(QaAccordionBlockComponent, {
        appearance: {
          background: 'subtle',
          border: 'top',
        },
        defaultOpenFirst: true,
        description: 'Answers to the most common admissions questions.',
        accordionPlacement: 'right',
        title: 'Frequently asked questions',
        items: [
          {
            answer: createRichText('Applications open in August and close in January.'),
            question: 'When does the application cycle open?',
          },
          {
            answer: createRichText('Yes. Need-based aid is available for eligible students.'),
            question: 'Do you offer financial support?',
          },
        ],
        layoutMode: 'oneThird',
        sideColumn: {
          contact: {
            actions: [
              { label: 'Contact admissions', linkType: 'custom', url: '/contact' },
              { label: 'Plan a visit', linkType: 'custom', url: '/visit' },
            ],
            description: 'Reach the admissions team for personalized guidance.',
            title: 'Still have questions?',
          },
          profile: {
            image: { alt: 'Admissions counselor', url: '/media/counselor.jpg' } as never,
            name: 'Sarah Johnson',
            title: 'Admissions Counselor',
          },
        },
        size: 'comfortable',
      }),
    )

    expect(html).toContain('data-qa-accordion-background="subtle"')
    expect(html).toContain('data-qa-accordion-has-side-column="true"')
    expect(html).toContain('data-qa-accordion-side-column="true"')
    expect(html).toContain('data-qa-accordion-layout="oneThird"')
    expect(html).toContain('data-qa-accordion-placement="right"')
    expect(html).toContain('data-qa-accordion-size="comfortable"')
    expect(html).toContain('py-20 md:py-28')
    expect(html).toContain(regularBlockContainerClasses)
    expect(html).toContain('bg-subtle')
    expect(html).toContain('border-t border-border')
    expect(html).toContain('Frequently asked questions')
    expect(html).toContain('Still have questions?')
    expect(html).toContain('Sarah Johnson')
    expect(html).toContain('href="/contact"')
    expect(html).toContain('href="/visit"')
    expect(html).toContain('data-qa-accordion-contact-actions="true"')
    expect(html).toContain('data-action-mode="link"')
    expect(html).toContain('group/button h-auto gap-2 px-0 py-0 text-sm')
    expect(html).toContain('rotate-[-35deg]')
    expect(html).toContain('group-hover/button:translate-x-1')
    expect(html).toContain('Applications open in August and close in January.')
    expect(html).toContain('prose-p:my-2')
    expect(html).toContain('prose-li:my-1')
    expect(html).not.toContain('prose-h2:text-3xl')
    expect(html).toContain('Reach the admissions team for personalized guidance.')
    expect(html).toContain('grid-cols-1 gap-8 lg:grid-cols-3')
    expect(html).toContain('data-qa-accordion-section-content="true"')
    expect(html).toContain('order-1 lg:order-1')
    expect(html).toContain('data-qa-accordion-main="true"')
    expect(html).toContain('order-2 lg:order-2 lg:col-span-2')
    expect(html).toContain('data-qa-accordion-side-column="true"')
    expect(html.indexOf('data-qa-accordion-section-content="true"')).toBeLessThan(
      html.indexOf('<aside'),
    )
    expect(html.indexOf('<aside')).toBeLessThan(html.indexOf('data-qa-accordion-main="true"'))
  })

  it('renders full-width centered content with independent header button actions', () => {
    const html = renderToStaticMarkup(
      createElement(QaAccordionBlockComponent, {
        contentAlignment: 'center',
        defaultOpenFirst: false,
        description: 'Answers for prospective students.',
        title: 'Questions and answers',
        actions: [
          {
            label: 'Admissions guide',
            linkType: 'custom',
            mode: 'button',
            url: '/guide',
            variant: 'default',
          },
          {
            label: 'Contact us',
            linkType: 'custom',
            mode: 'button',
            url: '/contact',
            variant: 'outline',
          },
        ],
        items: [
          {
            answer: createRichText('The curriculum includes early clinical exposure.'),
            question: 'What does the curriculum include?',
          },
        ],
        layoutMode: 'fullWidth',
        sideColumn: {
          contact: {
            description: 'This content must not render in Full Width mode.',
            title: 'Still have questions?',
          },
          profile: {
            name: 'Sarah Johnson',
          },
        },
        size: 'compact',
      }),
    )

    expect(html).toContain('data-qa-accordion-has-side-column="false"')
    expect(html).toContain('data-qa-accordion-side-column="false"')
    expect(html).toContain('data-qa-accordion-layout="fullWidth"')
    expect(html).toContain('data-qa-accordion-content-alignment="center"')
    expect(html).toContain('data-qa-accordion-size="compact"')
    expect(html).toContain('py-8 md:py-10')
    expect(html).toContain('w-full')
    expect(html).toContain('items-center text-center')
    expect(html).toContain('data-qa-accordion-header-actions="true"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-variant="default"')
    expect(html).toContain('data-action-variant="outline"')
    expect(html).toContain('href="/guide"')
    expect(html).toContain('href="/contact"')
    expect(html).toContain('What does the curriculum include?')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('text-left text-base font-semibold')
    expect(html).toContain('data-qa-accordion-section-content="true"')
    expect(html.indexOf('data-qa-accordion-section-content="true"')).toBeLessThan(
      html.indexOf('data-qa-accordion-main="true"'),
    )
    expect(html).not.toContain('data-qa-accordion-side-column="true"')
    expect(html).not.toContain('Sarah Johnson')
    expect(html).not.toContain('Still have questions?')
    expect(html).not.toContain('max-w-4xl')
  })

  it('renders a 50/50 layout with right-aligned header content and left-aligned Q&A rows', () => {
    const html = renderToStaticMarkup(
      createElement(QaAccordionBlockComponent, {
        contentAlignment: 'right',
        description: 'Answers for current students.',
        accordionPlacement: 'left',
        title: 'Student questions',
        items: [
          {
            answer: createRichText('Visit the student services office.'),
            question: 'Where can I get support?',
          },
        ],
        layoutMode: 'fiftyFifty',
        sideColumn: {
          contact: {
            title: 'Student services',
          },
        },
      }),
    )

    expect(html).toContain('data-qa-accordion-layout="fiftyFifty"')
    expect(html).toContain('data-qa-accordion-placement="left"')
    expect(html).toContain('data-qa-accordion-content-alignment="right"')
    expect(html).toContain('grid-cols-1 gap-8 lg:grid-cols-2')
    expect(html).toContain('data-qa-accordion-section-content="true"')
    expect(html).toContain('order-1 lg:order-2')
    expect(html).toContain('data-qa-accordion-main="true"')
    expect(html).toContain('order-2 lg:order-1')
    expect(html).toContain('data-qa-accordion-side-column="true"')
    expect(html).toContain('items-end text-right')
    expect(html).toContain('text-left text-base font-semibold')
  })

  it('keeps an authored 50/50 split when Profile and Contact Prompt are empty', () => {
    const html = renderToStaticMarkup(
      createElement(QaAccordionBlockComponent, {
        accordionPlacement: 'right',
        description: 'Core information remains in the content column.',
        items: [
          {
            answer: createRichText('The Q&A remains in its own column.'),
            question: 'Does the split depend on supporting content?',
          },
        ],
        layoutMode: 'fiftyFifty',
        title: 'Independent split layout',
      }),
    )

    expect(html).toContain('data-qa-accordion-layout="fiftyFifty"')
    expect(html).toContain('data-qa-accordion-has-side-column="false"')
    expect(html).toContain('grid grid-cols-1 gap-8 lg:grid-cols-2')
    expect(html).toContain('data-qa-accordion-section-content="true"')
    expect(html).toContain('data-qa-accordion-main="true"')
    expect(html.indexOf('data-qa-accordion-section-content="true"')).toBeLessThan(
      html.indexOf('data-qa-accordion-main="true"'),
    )
  })
})
