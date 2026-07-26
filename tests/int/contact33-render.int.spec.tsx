import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Contact33BlockComponent } from '@/blocks/Contact33/Component'

const contactForm = {
  fields: [
    {
      label: 'Full name',
      name: 'name',
      placeholder: 'Jane Doe',
      required: true,
      type: 'text',
    },
    {
      label: 'Work email',
      name: 'email',
      placeholder: 'jane@example.com',
      required: true,
      type: 'email',
    },
    {
      label: 'Topic',
      name: 'subject',
      options: [
        { label: 'Admissions', value: 'admissions' },
        { label: 'Partnerships', value: 'partnerships' },
      ],
      required: false,
      type: 'select',
    },
    {
      label: 'Your message',
      name: 'message',
      placeholder: 'Tell us more',
      required: true,
      type: 'textarea',
    },
  ],
  slug: 'contact',
  submitButtonLabel: 'Send inquiry',
  successMessage: 'Thanks. We will reply soon.',
  title: 'Contact',
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('contact33 block', () => {
  it.each(['compact', 'default', 'comfortable'] as const)(
    'uses shared outer spacing for %s size',
    (size) => {
      const html = renderToStaticMarkup(
        createElement(Contact33BlockComponent, {
          form: contactForm,
          image: {
            alt: 'Campus team',
            height: 900,
            url: '/contact.jpg',
            width: 1200,
          },
          imageAlt: 'An advisor welcoming a visitor',
          size,
          title: 'Start a conversation',
        } as never),
      )

      expect(html).toContain(`data-contact33-size="${size}"`)
      expect(html).toContain('py-12 md:py-16')
      expect(html).toContain('mx-auto w-full max-w-screen-2xl px-4')
    },
  )

  it('uses project typography, editor copy, media alt, and form metadata', () => {
    const html = renderToStaticMarkup(
      createElement(Contact33BlockComponent, {
        contentAlignment: 'center',
        description: 'Our advisors are ready to help.',
        eyebrow: 'Contact',
        form: contactForm,
        image: {
          alt: 'Ignored media alt',
          height: 900,
          url: '/contact.jpg',
          width: 1200,
        },
        imageAlt: 'An advisor welcoming a visitor',
        title: 'Start a conversation',
      } as never),
    )

    expect(html).toContain('font-mono text-xs font-semibold uppercase')
    expect(html).toContain('text-3xl font-semibold tracking-tight text-balance')
    expect(html).toContain('text-base leading-7')
    expect(html).toContain('Full name')
    expect(html).toContain('Work email')
    expect(html).toContain('Topic')
    expect(html).toContain('What can we help with?')
    expect(html).toContain('Your message')
    expect(html).toContain('Send inquiry')
    expect(html).toContain('alt="An advisor welcoming a visitor"')
    expect(html).toContain('data-contact33-content-alignment="center"')
    expect(html).toContain('items-center text-center')
  })

  it('keeps the form first on mobile and reverses only desktop placement', () => {
    const left = renderToStaticMarkup(
      createElement(Contact33BlockComponent, {
        form: contactForm,
        image: { alt: 'Contact', url: '/contact.jpg' },
        imageAlt: 'Contact team',
        imagePosition: 'left',
        title: 'Contact us',
      } as never),
    )
    const right = renderToStaticMarkup(
      createElement(Contact33BlockComponent, {
        form: contactForm,
        image: { alt: 'Contact', url: '/contact.jpg' },
        imageAlt: 'Contact team',
        imagePosition: 'right',
        title: 'Contact us',
      } as never),
    )

    expect(left).toContain('data-contact33-image-position="left"')
    expect(left).toContain('lg:order-first')
    expect(right).toContain('data-contact33-image-position="right"')
    expect(right).not.toContain('lg:order-first')
    expect(left).toContain('min-h-72')
    expect(left).toContain('lg:min-h-[42rem]')
  })

  it('renders an unavailable message for an unpopulated form relationship', () => {
    const html = renderToStaticMarkup(
      createElement(Contact33BlockComponent, {
        form: 'form-id',
        image: { alt: 'Contact', url: '/contact.jpg' },
        imageAlt: 'Contact team',
        title: 'Contact us',
      } as never),
    )

    expect(html).toContain('This contact form is currently unavailable.')
    expect(html).not.toContain('<form')
  })
})
