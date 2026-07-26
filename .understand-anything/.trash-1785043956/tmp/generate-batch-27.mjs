import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-27.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const scan = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/scan-result.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 27)

if (!batch || !extraction.scriptCompleted) {
  throw new Error('Batch 27 inputs are incomplete')
}

const summaries = {
  '.npmrc': 'Reserved npm configuration file; currently empty.',
  '.pnpmfile.mjs': 'Exports the repository-level pnpm hook object used to preserve the package-manager startup contract.',
  '.yarnrc': 'Configures Yarn to ignore package engine constraints during installation.',
  'docs/architecture/content-model-map.md':
    'Maps the CMS collections, globals, ownership boundaries, relationships, and editorial workflows.',
  'docs/guides/users.md':
    'Operator guide to user roles, capabilities, account administration, and safe access changes.',
  'docs/guides/work-queue.md':
    'Operator guide to work-queue types, priorities, source links, resolution behavior, and audit coupling.',
  'docs/superpowers/plans/2026-07-20-regular-block-responsive-spacing.md':
    'Implementation plan for consistent responsive spacing across regular content blocks.',
  'docs/superpowers/plans/2026-07-21-content-highlights-layouts.md':
    'Implementation plan for Content Highlights layouts, split controls, schema conditions, rendering, and tests.',
  'docs/superpowers/reviews/2026-07-07-cms-foundation-audit.md':
    'Audit of the CMS foundation covering architecture, content models, editorial safety, marketing features, and priorities.',
  'eslint.config.mjs': 'Defines flat ESLint rules and ignores for the TypeScript and Next.js codebase.',
  'next.config.ts':
    'Configures Payload-aware Next.js builds, media image paths, extension aliases, and the Turbopack root.',
  'playwright.config.ts':
    'Configures serialized Chromium end-to-end tests, CI retries, tracing, reporting, and development-server readiness.',
  'postcss.config.mjs': 'Configures the PostCSS processing plugins used by the frontend stylesheet build.',
  'public/block-thumbnails/README.md':
    'Documents generated block-thumbnail assets, fixtures, capture behavior, regeneration, and focused verification.',
  'src/app/(payload)/custom.scss': 'Reserved stylesheet entry point for Payload admin customizations; currently empty.',
  'src/styles/custom.css':
    'Defines focused Feature Matrix motion and Image Mosaic hover behavior with reduced-motion and input-aware fallbacks.',
  'src/styles/globals.css':
    'Defines global Tailwind, shadcn, theme, typography, color, layout, and component utility styles for the frontend.',
  'tests/helpers/server-only.ts': 'Provides the server-only module stub used by the integration-test environment.',
  'tests/int/admin-documentation.int.spec.ts':
    'Verifies that administration documentation remains aligned with the registered CMS surfaces.',
  'tests/int/content-taxonomy.int.spec.ts':
    'Integration coverage for category and tag relationships, archive behavior, and content taxonomy invariants.',
  'tests/int/live-preview-import-boundary.int.spec.ts':
    'Checks the reachable module graph for live-preview client boundaries and rejects server-only runtime bindings.',
  'tests/int/page-routing.int.spec.ts':
    'Integration coverage for homepage, nested page, system-page, and not-found routing behavior.',
  'tests/int/provider-selection.int.spec.ts':
    'Integration coverage for runtime database, email, and storage provider selection.',
  'tests/int/review-submission.int.spec.ts':
    'Integration coverage for public review submission, validation, moderation intake, promotion, and notifications.',
  'tests/int/sitemap.int.spec.ts':
    'Integration coverage for sitemap inclusion, canonical routes, taxonomy archives, and excluded content.',
}

const functionSummaries = {
  resolveLocalImport: 'Resolves a relative module specifier to an existing local source file.',
  hasRuntimeBinding: 'Determines whether an import declaration creates a runtime binding.',
  collectReachableRuntimeModules: 'Traverses local runtime imports to collect every module reachable from an entry point.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function nodePrefix(file) {
  if (file.fileCategory === 'docs') return 'document'
  if (file.fileCategory === 'config') return 'config'
  if (file.fileCategory === 'infra') return 'service'
  return 'file'
}

function tagsFor(file) {
  if (file.fileCategory === 'docs') {
    if (file.path.includes('/guides/')) return ['documentation', 'operator-guide', 'cms']
    if (file.path.includes('/plans/')) return ['documentation', 'implementation-plan', 'frontend']
    if (file.path.includes('/reviews/')) return ['documentation', 'audit', 'cms-architecture']
    return ['documentation', 'architecture', 'content-model']
  }
  if (file.path.startsWith('tests/int/')) return ['test', 'integration-test', 'regression']
  if (file.fileCategory === 'markup') return ['stylesheet', 'css', 'frontend']
  if (file.path.endsWith('.config.ts') || file.path.endsWith('.config.mjs'))
    return ['configuration', 'build-system', 'tooling']
  return ['configuration', 'tooling', 'repository']
}

const resultsByPath = new Map(extraction.results.map((result) => [result.path, result]))
const nodes = []
const edges = []

for (const file of batch.files) {
  const result = resultsByPath.get(file.path)
  const nodeID = `${nodePrefix(file)}:${file.path}`
  const nonEmptyLines = result?.nonEmptyLines ?? file.sizeLines
  nodes.push({
    id: nodeID,
    type: file.fileCategory === 'docs' ? 'document' : 'file',
    name: path.basename(file.path),
    filePath: file.path,
    summary: summaries[file.path],
    tags: tagsFor(file),
    complexity: complexity(nonEmptyLines),
  })

  const exported = new Set((result?.exports ?? []).map((item) => item.name))
  for (const fn of result?.functions ?? []) {
    const lines = fn.endLine - fn.startLine + 1
    if (lines < 10 && !exported.has(fn.name)) continue
    const functionID = `function:${file.path}:${fn.name}`
    nodes.push({
      id: functionID,
      type: 'function',
      name: fn.name,
      filePath: file.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: functionSummaries[fn.name] ?? `Implements ${fn.name} for the integration boundary check.`,
      tags: ['test-helper', 'module-graph', 'validation'],
      complexity: complexity(lines),
    })
    edges.push({
      source: nodeID,
      target: functionID,
      type: 'contains',
      direction: 'forward',
      weight: 1,
    })
  }
}

const candidateFiles = scan.files.filter(
  (file) => !batch.files.some((batchFile) => batchFile.path === file.path),
)
for (const file of batch.files.filter((candidate) => candidate.fileCategory === 'docs')) {
  const content = fs.readFileSync(file.path, 'utf8')
  const explicitTargets = candidateFiles
    .filter((candidate) => content.includes(candidate.path))
    .map((candidate) => ({ candidate, index: content.indexOf(candidate.path) }))
    .sort((a, b) => a.index - b.index)
    .slice(0, 3)

  for (const { candidate } of explicitTargets) {
    edges.push({
      source: `document:${file.path}`,
      target: `${nodePrefix(candidate)}:${candidate.path}`,
      type: 'documents',
      direction: 'forward',
      weight: 0.5,
    })
  }
}

for (const targetPath of [
  'src/styles/themes/theme-default.css',
  'src/styles/themes/theme-sunset.css',
  'src/styles/themes/theme-blue.css',
  'src/styles/themes/theme-kodama.css',
  'src/styles/custom.css',
]) {
  edges.push({
    source: 'file:src/styles/globals.css',
    target: `file:${targetPath}`,
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  })
}

for (const [sourcePath, targets] of Object.entries(batch.batchImportData)) {
  for (const targetPath of targets) {
    edges.push({
      source: `file:${sourcePath}`,
      target: `file:${targetPath}`,
      type: 'imports',
      direction: 'forward',
      weight: 0.7,
    })
  }
}

fs.writeFileSync(
  '.understand-anything/intermediate/batch-27.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
