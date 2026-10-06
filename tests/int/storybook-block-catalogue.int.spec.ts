import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { describe, expect, it, vi } from 'vitest'
import { blockThumbnailDefinitions } from '@/block-thumbnails/definitions'

const storyPaths = [
  ...fs
    .readdirSync('src/stories/blocks')
    .filter((file) => file.endsWith('.stories.tsx'))
    .map((file) => path.join('src/stories/blocks', file)),
  'src/stories/revamp/GenericForm.stories.tsx',
]
const stories = storyPaths.map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }))

describe('existing block Storybook catalogue', () => {
  it('lists every block once, including the template-only content block', () => {
    const slugs = stories.map(({ source }) => source.match(/blockSlug: '([^']+)'/)?.[1])
    expect(slugs.sort()).toEqual(
      [...blockThumbnailDefinitions.map(({ slug }) => slug), 'newsEventsContent'].sort(),
    )
    const titles = stories.map(
      ({ source }) => source.match(/title: ['"](Blocks\/[^'"\n]+)['"]/)?.[1],
    )
    expect(new Set(titles).size).toBe(stories.length)
    expect(titles.every((title) => title?.startsWith('Blocks/'))).toBe(true)
    for (const { source } of stories) {
      expect(source).toContain("tags: ['autodocs']")
      expect(source).toContain('export const Default: Story')
    }
  })

  it('keeps fixture stories out of the CMS configuration and server loaders', () => {
    for (const { source } of stories) {
      expect(source).not.toMatch(/from ['"](?:@payload-config|payload|.*\.server)['"]|getPayload\(/)
    }
    expect(fs.readFileSync('.storybook/main.ts', 'utf8')).toContain(
      '../src/stories/blocks/**/*.stories.@(ts|tsx)',
    )
  })

  it('prevents CMS reads and writes while leaving static assets available', async () => {
    const underlyingFetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response('static asset'))
    const window = {
      location: { href: 'http://localhost:6006/iframe.html', origin: 'http://localhost:6006' },
      fetch: underlyingFetch,
    }
    const code = ts.transpileModule(fs.readFileSync('.storybook/network.ts', 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText
    vm.runInNewContext(code, { window, URL, Response })
    for (const [url, method] of [
      ['/api/forms/sample/submit', 'POST'],
      ['/api/calendar-events', 'GET'],
      ['/api/media-download/sample', 'GET'],
    ]) {
      const response = await window.fetch(url, { method })
      expect(response.status).toBe(503)
      expect(await response.json()).toHaveProperty('error')
    }
    expect(underlyingFetch).not.toHaveBeenCalled()
    await window.fetch('/block-thumbnail-assets/brand-mark.svg')
    expect(underlyingFetch).toHaveBeenCalledTimes(1)
  })
})
