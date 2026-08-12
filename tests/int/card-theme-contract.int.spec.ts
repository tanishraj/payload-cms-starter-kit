import { describe, expect, it } from 'vitest'

import { resolveCardSurface } from '@/blocks/shared/cardSurface'
import {
  cardSurfaceValues,
  createCardBackgroundField,
  createCardTabs,
} from '@/blocks/shared/cardThemeFields'

describe('card theme contract', () => {
  it('exposes one semantic background vocabulary', () => {
    expect(cardSurfaceValues).toEqual(['default', 'primary', 'secondary', 'muted', 'accent'])
    expect(createCardBackgroundField()).toMatchObject({
      name: 'cardBackground',
      label: 'Background',
      type: 'select',
      defaultValue: 'default',
      required: true,
      options: [
        { label: 'Default Card', value: 'default' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Muted', value: 'muted' },
        { label: 'Accent', value: 'accent' },
      ],
    })
  })

  it('creates fresh unnamed Content and Theme Settings tabs', () => {
    const first = createCardTabs({
      contentFields: [{ name: 'title', type: 'text' }],
      themeFields: [{ name: 'emphasis', type: 'checkbox' }],
    })
    const second = createCardTabs({ contentFields: [{ name: 'title', type: 'text' }] })

    expect(first).toMatchObject({
      type: 'tabs',
      tabs: [
        { label: 'Content', fields: [{ name: 'title' }] },
        {
          label: 'Theme Settings',
          fields: [{ name: 'emphasis' }, { name: 'cardBackground' }],
        },
      ],
    })
    expect(second).not.toBe(first)
  })

  it('can reuse a legacy semantic background field without creating a duplicate', () => {
    const tabs = createCardTabs({
      contentFields: [{ name: 'title', type: 'text' }],
      includeBackground: false,
      themeFields: [{ name: 'accentColor', type: 'select', options: [] }],
    })

    expect(tabs.tabs[1]?.fields).toEqual([{ name: 'accentColor', type: 'select', options: [] }])
  })

  it.each([
    ['default', 'bg-card text-card-foreground', 'text-muted-foreground'],
    ['primary', 'bg-primary text-primary-foreground', 'text-primary-foreground/75'],
    ['secondary', 'bg-secondary text-secondary-foreground', 'text-secondary-foreground/70'],
    ['muted', 'bg-muted text-foreground', 'text-muted-foreground'],
    ['accent', 'bg-accent text-accent-foreground', 'text-accent-foreground/70'],
  ] as const)('resolves the %s card surface', (value, className, secondary) => {
    expect(resolveCardSurface(value)).toMatchObject({ className, secondary })
  })

  it('falls back safely and inverses matching filled buttons', () => {
    expect(resolveCardSurface('unknown').value).toBe('default')
    expect(resolveCardSurface(null).value).toBe('default')
    expect(resolveCardSurface('primary').button.default).toContain('bg-primary-foreground')
    expect(resolveCardSurface('secondary').button.secondary).toContain('bg-secondary-foreground')
  })
})
