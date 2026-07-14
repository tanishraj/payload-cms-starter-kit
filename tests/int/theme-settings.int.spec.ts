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
    (candidate): candidate is ThemeField =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate &&
      candidate.name === 'themeColor',
  )

  if (!field) {
    throw new Error('Expected themeColor field to exist.')
  }

  return field
}

describe('website theme registry', () => {
  it('exports the supported website themes and helpers', () => {
    expect(defaultWebsiteTheme).toBe('default')
    expect(websiteThemeValues).toEqual(['default', 'blue', 'sera'])
    expect(websiteThemeOptions).toEqual([
      { label: 'Default', value: 'default' },
      { label: 'Blue', value: 'blue' },
      { label: 'Sera', value: 'sera' },
    ])
    expect(isWebsiteTheme('default')).toBe(true)
    expect(isWebsiteTheme('blue')).toBe(true)
    expect(isWebsiteTheme('sera')).toBe(true)
    expect(isWebsiteTheme('amber')).toBe(false)
  })

  it('drives the Theme Settings select field from the shared registry', () => {
    const themeField = getThemeField()

    expect(themeField.defaultValue).toBe(defaultWebsiteTheme)
    expect(themeField.options).toEqual(websiteThemeOptions)
  })

  it('wires the frontend layout to the shared registry and default fallback', () => {
    const layoutSource = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(frontend)/layout.tsx'), 'utf8')

    expect(layoutSource).toContain("from '@/lib/themes/websiteThemes'")
    expect(layoutSource).toContain('defaultWebsiteTheme')
    expect(layoutSource).toContain('isWebsiteTheme')
    expect(layoutSource).toContain(
      'const themeColor = isWebsiteTheme(savedThemeColor) ? savedThemeColor : defaultWebsiteTheme',
    )
    expect(layoutSource).not.toContain("const validThemeColors = new Set(['default', 'blue', 'sera'])")
  })
})
