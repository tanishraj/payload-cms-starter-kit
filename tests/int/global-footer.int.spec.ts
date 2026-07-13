import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { renderFooterBlocks } from '@/blocks/renderFooterBlocks'
import { GlobalFooter } from '@/components/global/GlobalFooter'

describe('global footer wiring', () => {
  it('renders nothing without a configured footer layout', () => {
    expect(renderToStaticMarkup(createElement(GlobalFooter, { footer: null }))).toBe('')
    expect(
      renderToStaticMarkup(
        createElement(GlobalFooter, {
          footer: {
            layout: [],
          },
        }),
      ),
    ).toBe('')
  })

  it('renders footer blocks through the shared renderer', () => {
    const html = renderToStaticMarkup(
      createElement(
        'div',
        null,
        renderFooterBlocks(
          [
            {
              backgroundStyle: 'inverse',
              blockType: 'footer56',
              bottomLinks: [{ label: 'Privacy Policy', linkType: 'custom', url: '/privacy' }],
              copyrightText: '© 2026 Acme Institute. All rights reserved.',
              ctaButtons: [{ label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'outline' }],
              description: 'Preparing students for decisive practice and public service.',
              linkGroups: [
                {
                  links: [{ label: 'Programs', linkType: 'custom', url: '/programs' }],
                  title: 'Academics',
                },
              ],
              logoMode: 'siteDefault',
              socialLinks: [{ platform: 'linkedin', url: 'https://example.com/linkedin' }],
            },
          ] as never,
          { siteLogo: null, siteName: 'Acme Institute' },
        ),
      ),
    )

    expect(html).toContain('data-footer56-background="inverse"')
    expect(html).toContain('Acme Institute')
    expect(html).toContain('Programs')
    expect(html).toContain('Privacy Policy')
    expect(html).toContain('Apply now')
    expect(html).toContain('© 2026 Acme Institute. All rights reserved.')
    expect(html).toContain('linkedin')
  })

  it('renders the active footer preset inside the global footer shell', () => {
    const html = renderToStaticMarkup(
      createElement(GlobalFooter, {
        footer: {
          layout: [
            {
              backgroundStyle: 'muted',
              blockType: 'footer56',
              ctaButtons: [{ label: 'Contact', linkType: 'custom', url: '/contact', variant: 'outline' }],
              description: 'A quieter institutional footer for public-facing pages.',
              linkGroups: [
                {
                  links: [{ label: 'About', linkType: 'custom', url: '/about' }],
                  title: 'Institute',
                },
              ],
              logoMode: 'siteDefault',
            },
          ],
        } as never,
        siteLogo: null,
        siteName: 'Acme Institute',
      }),
    )

    expect(html).toContain('data-global-footer="true"')
    expect(html).toContain('data-footer56-background="muted"')
    expect(html).toContain('Acme Institute')
    expect(html).toContain('Contact')
    expect(html).toContain('About')
  })
})
