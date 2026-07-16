import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FaqBlockComponent } from '@/blocks/Faq/Component'

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

describe('faq block', () => {
  it('renders the FAQ with an optional side column', () => {
    const html = renderToStaticMarkup(
      createElement(FaqBlockComponent, {
        appearance: {
          background: 'muted',
          border: 'top',
          textColor: 'auto',
        },
        defaultOpenFirst: true,
        description: 'Answers to the most common admissions questions.',
        heading: 'Frequently asked questions',
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
        sideColumn: {
          contact: {
            description: 'Reach the admissions team for personalized guidance.',
            linkLabel: 'Contact admissions',
            linkType: 'custom',
            title: 'Still have questions?',
            url: '/contact',
          },
          profile: {
            image: { alt: 'Admissions counselor', url: '/media/counselor.jpg' } as never,
            name: 'Sarah Johnson',
            title: 'Admissions Counselor',
          },
        },
        sideColumnEnabled: true,
        size: 'comfortable',
      }),
    )

    expect(html).toContain('data-faq-background="muted"')
    expect(html).toContain('data-faq-has-side-column="true"')
    expect(html).toContain('data-faq-size="comfortable"')
    expect(html).toContain('bg-muted')
    expect(html).toContain('border-t border-border')
    expect(html).toContain('Frequently asked questions')
    expect(html).toContain('Still have questions?')
    expect(html).toContain('Sarah Johnson')
    expect(html).toContain('href="/contact"')
    expect(html).toContain('data-faq-contact-cta="true"')
    expect(html).toContain('group/button h-auto justify-start gap-2 px-0 py-0 text-left text-sm')
    expect(html).toContain('rotate-[-35deg]')
    expect(html).toContain('group-hover/button:translate-x-1')
    expect(html).toContain('Applications open in August and close in January.')
    expect(html).toContain('Reach the admissions team for personalized guidance.')
    expect(html).toContain('grid-cols-1 gap-8 lg:grid-cols-5')
  })

  it('renders a single-column FAQ when the side column is disabled', () => {
    const html = renderToStaticMarkup(
      createElement(FaqBlockComponent, {
        defaultOpenFirst: false,
        heading: 'FAQ',
        items: [
          {
            answer: createRichText('The curriculum includes early clinical exposure.'),
            question: 'What does the curriculum include?',
          },
        ],
        sideColumnEnabled: false,
        size: 'compact',
      }),
    )

    expect(html).toContain('data-faq-has-side-column="false"')
    expect(html).toContain('data-faq-size="compact"')
    expect(html).toContain('w-full')
    expect(html).toContain('What does the curriculum include?')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('max-w-4xl')
  })
})
