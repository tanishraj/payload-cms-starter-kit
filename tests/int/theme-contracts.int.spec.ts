import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { contrastRatio, parseOklch } from '../helpers/oklchContrast'

const themes = ['default', 'sunset', 'blue', 'kodama', 'snmih'] as const
const contrastPairs = [
  ['background', 'foreground'],
  ['card', 'card-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['accent', 'accent-foreground'],
  ['primary', 'background'],
] as const

type ThemeMode = 'dark' | 'light'

const readTheme = (theme: (typeof themes)[number]) =>
  fs
    .readFileSync(path.resolve(process.cwd(), `src/styles/themes/theme-${theme}.css`), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')

const readTokenBlocks = (source: string) =>
  [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    declarations: match[2],
    selector: match[1].trim(),
  }))

const getModeTokens = (
  theme: (typeof themes)[number],
  mode: ThemeMode,
): Record<string, string> => {
  const expectedSelector = `data-theme-color='${theme}'`
  const block = readTokenBlocks(readTheme(theme)).find(({ selector }) => {
    const isDark = selector.includes('.dark')

    return selector.includes(expectedSelector) && (mode === 'dark' ? isDark : !isDark)
  })

  if (!block) {
    throw new Error(`Missing ${mode} token block for ${theme}.`)
  }

  return Object.fromEntries(
    [...block.declarations.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  )
}

describe('website theme contracts', () => {
  it.each(themes)('isolates the %s theme tokens to its root selector', (theme) => {
    const source = readTheme(theme)
    const tokenBlocks = readTokenBlocks(source).filter(({ declarations }) =>
      declarations.includes('--background:'),
    )

    expect(tokenBlocks).toHaveLength(2)

    for (const { selector } of tokenBlocks) {
      const selectors = selector.split(',').map((item) => item.trim())

      if (theme === 'default') {
        for (const item of selectors) {
          expect(item).toMatch(
            /data-theme-color='default'|:root:not\(\[data-theme-color\]\)/,
          )
        }
      } else {
        for (const item of selectors) {
          expect(item).toContain(`data-theme-color='${theme}'`)
          expect(item).not.toMatch(/^:root\s*(?:\.dark)?$/)
        }
      }
    }
  })

  it.each(themes)('meets semantic color contrast in the %s theme', (theme) => {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = getModeTokens(theme, mode)

      for (const [surface, content] of contrastPairs) {
        expect(tokens[surface], `${theme} ${mode} is missing --${surface}`).toBeDefined()
        expect(tokens[content], `${theme} ${mode} is missing --${content}`).toBeDefined()

        const ratio = contrastRatio(parseOklch(tokens[surface]), parseOklch(tokens[content]))

        expect(
          ratio,
          `${theme} ${mode} --${surface}/--${content} contrast is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('uses primary as the only brand action token and a zero-safe radius scale', () => {
    const globalsSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/styles/globals.css'),
      'utf8',
    )

    expect(globalsSource).not.toContain('--color-link:')
    expect(globalsSource).toContain('--radius-xs: calc(var(--radius) * 0.25);')
    expect(globalsSource).toContain('--radius-sm: calc(var(--radius) * 0.5);')
    expect(globalsSource).toContain('--radius-md: calc(var(--radius) * 0.75);')
    expect(globalsSource).toContain('--radius-xl: calc(var(--radius) * 1.5);')
    expect(globalsSource).toContain('--radius-2xl: calc(var(--radius) * 1.8);')
    expect(globalsSource).toContain('--radius-3xl: calc(var(--radius) * 2.2);')
    expect(globalsSource).toContain('--radius-4xl: calc(var(--radius) * 2.6);')
    expect(globalsSource).not.toMatch(/--radius-(?:xs|sm|md|xl):\s*calc\(var\(--radius\)\s*[+-]/)
  })

  it('uses the semantic link, radius, and filled-action hover contracts', () => {
    const buttonSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/button.tsx'),
      'utf8',
    )
    const checkboxSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/checkbox.tsx'),
      'utf8',
    )
    const tabsSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/blocks/TabsContent/TabsContentClient.tsx'),
      'utf8',
    )

    expect(buttonSource).toContain(
      'hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_8%)]',
    )
    expect(buttonSource).toContain("link: 'text-primary underline-offset-4 hover:underline'")
    expect(checkboxSource).toContain('rounded-sm')
    expect(checkboxSource).not.toContain('rounded-[5px]')
    expect(tabsSource).toContain("? 'border-primary text-primary'")
  })
})
