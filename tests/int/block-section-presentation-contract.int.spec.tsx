import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SectionIntro } from '@/blocks/shared/SectionIntro'
import { SectionShell } from '@/blocks/shared/SectionShell'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'

const resolvedAction: ResolvedCmsAction = {
  href: '/apply',
  label: 'Apply now',
  mode: 'link',
  showArrow: false,
  variant: 'default',
}

describe('block section presentation contract', () => {
  it.each([
    ['left', 'items-start text-left', 'justify-start'],
    ['center', 'mx-auto items-center text-center', 'justify-center'],
    ['right', 'ml-auto items-end text-right', 'justify-end'],
  ] as const)('aligns %s introductions and their actions together', (alignment, intro, actions) => {
    const html = renderToStaticMarkup(
      <SectionIntro
        actions={[resolvedAction]}
        alignment={alignment}
        description="Supporting copy"
        eyebrow="Admissions"
        surface="none"
        title="Apply now"
      />,
    )

    expect(html).toContain('data-section-intro="true"')
    expect(html).toContain(intro)
    expect(html).toContain(actions)
    expect(html.indexOf('Admissions')).toBeLessThan(html.indexOf('Apply now'))
    expect(html.indexOf('Apply now')).toBeLessThan(html.indexOf('Supporting copy'))
  })

  it('omits an empty introduction', () => {
    expect(renderToStaticMarkup(<SectionIntro />)).toBe('')
  })

  it('renders a server-safe section shell with shared spacing and appearance', () => {
    const html = renderToStaticMarkup(
      <SectionShell appearance={{ background: 'subtle', border: 'top' }} size="compact">
        <p>Section content</p>
      </SectionShell>,
    )

    expect(html).toContain('py-8 md:py-10')
    expect(html).toContain('bg-subtle')
    expect(html).toContain('max-w-screen-2xl')
  })

  it('requires every footer action call site to choose an explicit alignment', () => {
    const blockRoot = path.resolve(process.cwd(), 'src/blocks')
    const sources = fs
      .readdirSync(blockRoot, { recursive: true })
      .filter((entry): entry is string => typeof entry === 'string' && /\.(?:ts|tsx)$/.test(entry))
      .map((entry) => ({
        entry,
        source: fs.readFileSync(path.join(blockRoot, entry), 'utf8'),
      }))
    const implicitCalls = sources.flatMap(({ entry, source }) =>
      [...source.matchAll(/<BlockFooterActions\b[^>]*>/g)]
        .filter(([call]) => !/\balignment=/.test(call))
        .map(() => entry),
    )

    expect(implicitCalls).toEqual([])
  })
})
