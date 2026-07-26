import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-23.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const scan = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/scan-result.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 23)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 23 inputs are incomplete')
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function topicTag(filePath) {
  const name = path.basename(filePath)
  if (name.includes('header') || name.includes('navigation')) return 'navigation'
  if (name.includes('foundation')) return 'cms-architecture'
  if (name.includes('articles') || name.includes('taxonomy')) return 'content-model'
  if (name.includes('editorial') || name.includes('role')) return 'editorial-governance'
  if (name.includes('review')) return 'reviews'
  if (name.includes('postgres') || name.includes('startup')) return 'runtime'
  if (name.includes('form')) return 'forms'
  if (name.includes('homepage') || name.includes('playwright')) return 'testing'
  if (name.includes('media')) return 'media'
  if (name.includes('operator')) return 'documentation'
  if (name.includes('queue')) return 'work-queue'
  if (name.includes('seo')) return 'seo'
  if (name.includes('starter')) return 'starter-kit'
  return 'system-design'
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

const nodes = extraction.results.map((file) => {
  const title =
    (file.sections ?? []).find((section) => section.level === 1)?.heading ??
    path.basename(file.path, '.md')
  const subject = title.replace(/ Design$/, '')
  const sectionCount = (file.sections ?? []).length

  return {
    id: `document:${file.path}`,
    type: 'document',
    name: path.basename(file.path),
    filePath: file.path,
    summary: `Design specification for ${subject}, spanning ${sectionCount} structured sections that document architecture, constraints, and implementation boundaries.`,
    tags: ['documentation', 'design-specification', topicTag(file.path)],
    complexity: complexity(file.nonEmptyLines),
  }
})

const candidateFiles = scan.files.filter(
  (file) => !file.path.startsWith('docs/superpowers/specs/'),
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
  '.understand-anything/intermediate/batch-23.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
