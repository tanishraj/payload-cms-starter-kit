import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('admin documentation vocabulary', () => {
  it('uses the current operator-facing IA terms and covers every admin surface', () => {
    const guideIndex = readFileSync('docs/guides/README.md', 'utf8')
    const readme = readFileSync('README.md', 'utf8')

    for (const group of [
      'Content',
      'Taxonomy',
      'Navigation',
      'Site Structure',
      'Media',
      'Forms',
      'Settings',
      'Configuration',
      'Administration',
    ]) {
      expect(guideIndex).toContain(`### ${group}`)
      expect(readme).toContain(`- \`${group}\``)
    }

    for (const guide of [
      '[News & Events](./news-events.md)',
      '[News & Events Settings](./news-events-settings.md)',
      '[Gallery Albums](./gallery-albums.md)',
      '[Office Locations](./office-locations.md)',
      '[Cookie Consent Banner](./cookie-consent.md)',
      '[Layout Defaults](./site-defaults.md)',
      '[Site Identity](./site-settings.md)',
      '[Appearance](./theme-settings.md)',
      '[SEO & Metadata](./seo-settings.md)',
      '[Analytics & Tracking](./analytics.md)',
      '[Maintenance & Modes](./system-modes.md)',
      '[Audit Log](./operational-audit-events.md)',
      '[Action Queue](./work-queue.md)',
      '[Page Blocks](./blocks.md)',
      '[Trash and Recovery](./trash-and-recovery.md)',
    ]) {
      expect(guideIndex).toContain(guide)
    }
  })
})
