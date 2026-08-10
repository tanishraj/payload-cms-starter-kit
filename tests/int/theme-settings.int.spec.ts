import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { ThemeSettings } from '@/globals/ThemeSettings'
import {
  defaultWebsiteTheme,
  isWebsiteTheme,
  websiteThemeOptions,
  websiteThemeValues,
} from '@/lib/themes/websiteThemes'

type ThemeField = {
  defaultValue?: unknown
  name: string
  options?: Array<{ label: string; value: string }>
}

const getThemeField = () => {
  const field = ThemeSettings.fields.find(
    (candidate) =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate &&
      candidate.name === 'themeColor',
  ) as ThemeField | undefined

  if (!field) {
    throw new Error('Expected themeColor field to exist.')
  }

  return field
}

describe('website theme registry', () => {
  it('exports the supported website themes and helpers', () => {
    expect(defaultWebsiteTheme).toBe('default')
    expect(websiteThemeValues).toEqual(['default', 'sunset', 'blue', 'kodama', 'snmih'])
    expect(websiteThemeOptions).toEqual([
      { label: 'Default', value: 'default' },
      { label: 'Sunset', value: 'sunset' },
      { label: 'Blue', value: 'blue' },
      { label: 'Kodama', value: 'kodama' },
      { label: 'SNMIH', value: 'snmih' },
    ])
    expect(isWebsiteTheme('default')).toBe(true)
    expect(isWebsiteTheme('sunset')).toBe(true)
    expect(isWebsiteTheme('blue')).toBe(true)
    expect(isWebsiteTheme('kodama')).toBe(true)
    expect(isWebsiteTheme('snmih')).toBe(true)
    expect(isWebsiteTheme('sera')).toBe(false)
    expect(isWebsiteTheme('amber')).toBe(false)
  })

  it('loads the isolated SNMIH token preset', () => {
    const globalsSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/styles/globals.css'),
      'utf8',
    )
    const themeSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/styles/themes/theme-snmih.css'),
      'utf8',
    )

    expect(globalsSource).toContain("@import './themes/theme-snmih.css';")
    expect(themeSource).toContain(":root[data-theme-color='snmih'] {")
    expect(themeSource).toContain(":root[data-theme-color='snmih'].dark {")
    expect(themeSource).not.toMatch(/^:root\s*\{/m)
    expect(themeSource).not.toMatch(/^\.dark\s*\{/m)
    expect(themeSource).toContain('--primary: oklch(0.488 0.243 264.376);')
    expect(themeSource).toContain('--primary: oklch(0.72 0.16 264);')
    expect(themeSource).toContain('--radius: 0;')
  })

  it('drives the Theme Settings select field from the shared registry', () => {
    const themeField = getThemeField()

    expect(themeField.defaultValue).toBe(defaultWebsiteTheme)
    expect(themeField.options).toEqual(websiteThemeOptions)
  })

  it('wires the frontend layout to the shared registry and default fallback', () => {
    const layoutSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/(frontend)/layout.tsx'),
      'utf8',
    )

    expect(layoutSource).toContain("from '@/lib/themes/websiteThemes'")
    expect(layoutSource).toContain('defaultWebsiteTheme')
    expect(layoutSource).toContain('isWebsiteTheme')
    expect(layoutSource).toContain(
      'const themeColor = isWebsiteTheme(savedThemeColor) ? savedThemeColor : defaultWebsiteTheme',
    )
    expect(layoutSource).not.toContain(
      "const validThemeColors = new Set(['default', 'blue', 'sera'])",
    )
  })
})
