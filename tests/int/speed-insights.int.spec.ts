import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const layoutSource = readFileSync('src/app/(frontend)/layout.tsx', 'utf8')
const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies?: Record<string, string>
}
const analyticsGuide = readFileSync('docs/guides/analytics.md', 'utf8')
const featureInventory = readFileSync('docs/architecture/feature-inventory.md', 'utf8')

describe('Vercel Speed Insights integration', () => {
  it('installs and imports the framework-specific package', () => {
    expect(packageJSON.dependencies?.['@vercel/speed-insights']).toBeTruthy()
    expect(packageJSON.dependencies?.['@next/third-parties']).toBe('16.2.10')
    expect(layoutSource).toContain("import { SpeedInsights } from '@vercel/speed-insights/next'")
    expect(layoutSource).toContain("import { GoogleTagManager } from '@next/third-parties/google'")
  })

  it('mounts Speed Insights only through the existing analytics consent boundary', () => {
    expect(layoutSource).toContain("const hasAnalyticsConsent = analyticsConsent === 'granted'")
    expect(layoutSource).toMatch(/\{hasAnalyticsConsent\s*\?\s*<SpeedInsights\s*\/>\s*:\s*null\}/)
    expect(layoutSource).not.toMatch(/^\s*<SpeedInsights\s*\/>\s*$/m)
  })

  it('mounts Google Tag Manager only through the analytics consent boundary', () => {
    expect(layoutSource).toMatch(
      /hasAnalyticsConsent\s*&&\s*analyticsSettings\?\.gtmEnabled\s*&&\s*analyticsSettings\.gtmContainerId\s*\?\s*\(\s*<GoogleTagManager/,
    )
    expect(layoutSource).toContain('<GoogleTagManager gtmId={analyticsSettings.gtmContainerId} />')
    expect(layoutSource).not.toContain('googletagmanager.com/gtm.js?id=')
  })

  it('documents deployment setup and consent-gated collection', () => {
    expect(analyticsGuide).toContain('## Vercel Speed Insights')
    expect(analyticsGuide).toContain('analytics_consent=granted')
    expect(analyticsGuide).toContain('Enable Speed Insights')
    expect(featureInventory).toContain(
      'Vercel Speed Insights collects public-route Web Vitals only after analytics consent.',
    )
  })
})
