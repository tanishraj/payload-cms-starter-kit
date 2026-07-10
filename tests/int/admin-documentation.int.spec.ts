import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('admin documentation vocabulary', () => {
  it('uses the approved operator-facing IA terms', () => {
    const guideIndex = readFileSync('docs/guides/README.md', 'utf8')
    const readme = readFileSync('README.md', 'utf8')
    const linksGuide = readFileSync('docs/guides/links.md', 'utf8')
    const siteDefaultsGuide = readFileSync('docs/guides/site-defaults.md', 'utf8')
    const systemModesGuide = readFileSync('docs/guides/system-modes.md', 'utf8')
    const auditGuide = readFileSync('docs/guides/operational-audit-events.md', 'utf8')
    const workQueueGuide = readFileSync('docs/guides/work-queue.md', 'utf8')

    expect(guideIndex).toContain('### Website Content')
    expect(guideIndex).toContain('### Website Structure')
    expect(guideIndex).toContain('### Lead Capture')
    expect(guideIndex).toContain('### Site Settings')
    expect(guideIndex).toContain('### Operations')
    expect(guideIndex).toContain('[Navigation Links](./links.md)')
    expect(guideIndex).toContain('[Website Defaults](./site-defaults.md)')
    expect(guideIndex).toContain('[Website Modes](./system-modes.md)')
    expect(guideIndex).toContain('[Activity Log](./operational-audit-events.md)')
    expect(guideIndex).toContain('[Action Queue](./work-queue.md)')

    expect(linksGuide).toContain('# Navigation Links Guide')
    expect(siteDefaultsGuide).toContain('# Website Defaults Guide')
    expect(systemModesGuide).toContain('# Website Modes Guide')
    expect(auditGuide).toContain('# Activity Log Guide')
    expect(workQueueGuide).toContain('# Action Queue Guide')

    expect(readme).toContain('## Admin Information Architecture')
    expect(readme).toContain('- `Website Content`')
    expect(readme).toContain('- `Website Structure`')
    expect(readme).toContain('- `Lead Capture`')
    expect(readme).toContain('- `Site Settings`')
    expect(readme).toContain('- `Operations`')
  })
})
