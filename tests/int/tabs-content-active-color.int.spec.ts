import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Tabs Content active color', () => {
  it('uses semantic action colors for the active underline label and border', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/blocks/TabsContent/TabsContentClient.tsx'),
      'utf8',
    )

    expect(source).toContain("? 'border-primary text-primary'")
    expect(source).not.toContain("? 'border-primary text-foreground'")
    expect(source).toContain(
      "'border-transparent text-muted-foreground hover:text-foreground hover:border-border'",
    )
    expect(source).toContain("? 'bg-primary text-primary-foreground'")
    expect(source).toContain("? 'bg-background text-foreground shadow-sm'")
  })
})
