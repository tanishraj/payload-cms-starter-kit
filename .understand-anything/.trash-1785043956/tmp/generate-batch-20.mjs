import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-20.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const scan = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/scan-result.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 20)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 20 inputs are incomplete')
}

const summaries = {
  'docs/superpowers/plans/2026-07-07-cms-foundation-audit.md':
    'Implementation plan for auditing the CMS foundation across platform structure, content modeling, editorial controls, marketing capabilities, reuse, and remediation priorities.',
  'docs/superpowers/plans/2026-07-07-cms-foundation-remediation-plan.md':
    'Remediation plan for productizing documentation, separating runtime providers, raising test coverage, hardening system modes, and adding a lead-handling seam.',
  'docs/superpowers/plans/2026-07-08-articles-reviews-implementation-plan.md':
    'Implementation plan for article and review collections, editorial permissions, routed public pages, reusable layouts, and public review submission.',
  'docs/superpowers/plans/2026-07-08-editorial-governance-plan.md':
    'Implementation plan for editorial roles, capability boundaries, system-wide settings, workflow guardrails, audit events, and operational verification.',
  'docs/superpowers/plans/2026-07-08-review-intake-promotion.md':
    'Focused plan for separating review-intake schemas and helpers, refactoring submission routing, and verifying promotion into review content.',
  'docs/superpowers/plans/2026-07-08-vercel-postgres-runtime-plan.md':
    'Historical implementation plan for hardened runtime parsing, SQLite/Postgres provider selection, and the documented Vercel deployment contract.',
  'docs/superpowers/plans/2026-07-09-form-submissions-lead-operations.md':
    'Implementation plan for lead-intent metadata, form-submission operational fields, enriched events, route behavior, and integration verification.',
  'docs/superpowers/plans/2026-07-09-homepage-e2e-seeding.md':
    'Implementation plan for deterministic homepage fixtures, frontend Playwright setup, cleanup, and end-to-end verification.',
  'docs/superpowers/plans/2026-07-09-media-governance.md':
    'Implementation plan for resolving media usage, adding governance metadata, blocking unsafe deletion, and covering regressions.',
  'docs/superpowers/plans/2026-07-09-operator-guides.md':
    'Implementation plan for a structured operator-guide library spanning content, taxonomy, navigation, media, forms, admin operations, and settings.',
  'docs/superpowers/plans/2026-07-09-playwright-readiness-route.md':
    'Focused plan for pointing Playwright readiness checks at an always-live route and verifying the complete end-to-end workflow.',
  'docs/superpowers/plans/2026-07-09-playwright-sqlite-worker-serialization.md':
    'Focused historical plan for serializing Playwright workers around a shared SQLite test database.',
  'docs/superpowers/plans/2026-07-09-pnpm-startup-contract-fix.md':
    'Focused plan for restoring repository-level pnpm startup behavior and verifying existing integration and end-to-end test entry points.',
  'docs/superpowers/plans/2026-07-09-publish-queue-safety-implementation.md':
    'Implementation plan for blocking publication when unresolved work-queue items exist and wiring collection-aware workflow guards with tests.',
  'docs/superpowers/plans/2026-07-09-role-capability-model.md':
    'Implementation plan for role naming, default capability presets, persisted user capabilities, admin presentation, operator documentation, and regression tests.',
  'docs/superpowers/plans/2026-07-09-seo-operations-completeness.md':
    'Implementation plan for shared SEO fields and validation, content-model adoption, metadata and sitemap resolution, and structural guardrails.',
  'docs/superpowers/plans/2026-07-09-starter-productization-and-handoff.md':
    'Implementation plan for codifying the starter runtime contract, rewriting handoff documentation, and adding executable clone-safety verification.',
  'docs/superpowers/plans/2026-07-09-taxonomy-and-content-organization.md':
    'Implementation plan for reusable categories and tags, content relationships, archive and related-content queries, and public taxonomy pages.',
  'docs/superpowers/plans/2026-07-09-work-queue-implementation.md':
    'Implementation plan for the operational work queue, shared synchronization and audit helpers, workflow integrations, admin behavior, and coverage.',
  'docs/superpowers/plans/2026-07-10-mongodb-runtime-reset.md':
    'Implementation plan for resetting providers to MongoDB, replacing the SQLite test harness, cleaning local runtime workflows, and updating active documentation.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function topicTag(filePath) {
  const name = path.basename(filePath)
  if (name.includes('editorial') || name.includes('role-capability')) return 'editorial-governance'
  if (name.includes('work-queue') || name.includes('publish-queue')) return 'work-queue'
  if (name.includes('seo')) return 'seo'
  if (name.includes('taxonomy')) return 'taxonomy'
  if (name.includes('media')) return 'media'
  if (name.includes('playwright') || name.includes('e2e')) return 'testing'
  if (name.includes('runtime') || name.includes('postgres') || name.includes('mongodb')) return 'runtime'
  if (name.includes('review')) return 'reviews'
  if (name.includes('form')) return 'forms'
  if (name.includes('starter') || name.includes('foundation')) return 'starter-kit'
  return 'operations'
}

function nodePrefix(file) {
  if (file.fileCategory === 'docs') return 'document'
  if (file.fileCategory === 'config') return 'config'
  if (file.fileCategory === 'infra') {
    if (file.path.startsWith('.github/workflows/') || file.path.includes('.gitlab-ci')) return 'pipeline'
    if (file.path.endsWith('.tf') || file.path.endsWith('.tfvars')) return 'resource'
    return 'service'
  }
  if (file.fileCategory === 'data') {
    if (file.path.endsWith('.sql')) return 'table'
    if (file.path.endsWith('.graphql') || file.path.endsWith('.proto') || file.path.endsWith('.prisma'))
      return 'schema'
  }
  return 'file'
}

const nodes = extraction.results.map((file) => ({
  id: `document:${file.path}`,
  type: 'document',
  name: path.basename(file.path),
  filePath: file.path,
  summary: summaries[file.path],
  tags: ['documentation', 'implementation-plan', topicTag(file.path)],
  complexity: complexity(file.nonEmptyLines),
}))

const candidateFiles = scan.files.filter(
  (file) => !file.path.startsWith('docs/superpowers/plans/'),
)
const edges = []

for (const file of extraction.results) {
  const content = fs.readFileSync(file.path, 'utf8')
  const explicitTargets = candidateFiles
    .filter((candidate) => content.includes(candidate.path))
    .map((candidate) => ({ candidate, index: content.indexOf(candidate.path) }))
    .sort((a, b) => a.index - b.index)
    .slice(0, 5)

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

for (const [sourcePath, targets] of Object.entries(batch.batchImportData)) {
  for (const targetPath of targets) {
    edges.push({
      source: `document:${sourcePath}`,
      target: `file:${targetPath}`,
      type: 'imports',
      direction: 'forward',
      weight: 0.7,
    })
  }
}

fs.writeFileSync(
  '.understand-anything/intermediate/batch-20.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
