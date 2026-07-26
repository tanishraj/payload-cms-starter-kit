import fs from 'node:fs'
import path from 'node:path'

const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const extraction17 = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-17.json', 'utf8'),
)
const extraction18 = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-18.json', 'utf8'),
)
const batch17 = batches.batches.find((candidate) => candidate.batchIndex === 17)
const batch18 = batches.batches.find((candidate) => candidate.batchIndex === 18)

if (
  !batch17 ||
  !batch18 ||
  !extraction17.scriptCompleted ||
  !extraction18.scriptCompleted ||
  extraction17.results.length !== batch17.files.length ||
  extraction18.results.length !== batch18.files.length
) {
  throw new Error('Batch 17/18 inputs are incomplete')
}

const summaries17 = {
  '.env.example': 'Documents the supported local and hosted environment variables for database, email, media, and runtime behavior.',
  '.prettierrc.json': 'Configures repository formatting for quotes, trailing commas, line width, and semicolon usage.',
  'AGENTS.md': 'Directs coding agents to the project-local Payload CMS skill and reference documentation.',
  'README.md': 'Introduces the Payload CMS marketing starter, setup contract, capabilities, ownership model, environment, and tests.',
  'SKILL.md': 'Defines the project-local skill entry point and routes Payload CMS work to its detailed instructions.',
  'components.json': 'Configures shadcn component style, Tailwind integration, aliases, icon library, and registries.',
  'package.json': 'Declares project metadata, scripts, runtime dependencies, development tools, and Node/pnpm requirements.',
  'pnpm-workspace.yaml': 'Defines pnpm workspace build permissions for native and generated dependencies.',
  'test.env': 'Provides the minimal environment secret used by tests.',
  'tsconfig.json': 'Configures TypeScript compilation, module resolution, strictness, path aliases, and source inclusion.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function buildBatch17() {
  const results = new Map(extraction17.results.map((result) => [result.path, result]))
  const nodes = batch17.files.map((file) => {
    const isDocument = file.fileCategory === 'docs'
    return {
      id: `${isDocument ? 'document' : 'config'}:${file.path}`,
      type: isDocument ? 'document' : 'config',
      name: path.basename(file.path),
      filePath: file.path,
      summary: summaries17[file.path],
      tags: isDocument
        ? ['documentation', 'project-guidance', file.path === 'README.md' ? 'overview' : 'agent-instructions']
        : ['configuration', 'tooling', file.path.includes('env') ? 'environment' : 'build-system'],
      complexity: complexity(results.get(file.path)?.nonEmptyLines ?? file.sizeLines),
    }
  })

  const edges = []
  for (const targets of Object.values(batch17.batchImportData)) {
    if (targets.length) throw new Error('Unexpected imports in batch 17')
  }
  return { nodes, edges }
}

function buildBatch18() {
  const results = new Map(extraction18.results.map((result) => [result.path, result]))
  const nodes = batch18.files.map((file) => {
    const result = results.get(file.path)
    const heading =
      (result.sections ?? []).find((section) => section.level === 1)?.heading ??
      path.basename(file.path, '.md')
    const summary =
      file.path === 'docs/guides/README.md'
        ? 'Introduces the CMS operator manual, its audience, admin grouping, reading order, and usage conventions.'
        : `Operator guide for ${heading.replace(/ Guide$/, '')}, covering usage, website integration, examples, best practices, and recovery.`
    const topic = path.basename(file.path, '.md')
    return {
      id: `document:${file.path}`,
      type: 'document',
      name: path.basename(file.path),
      filePath: file.path,
      summary,
      tags: ['documentation', 'operator-guide', topic],
      complexity: complexity(result.nonEmptyLines),
    }
  })

  const edges = []
  for (const targets of Object.values(batch18.batchImportData)) {
    if (targets.length) throw new Error('Unexpected imports in batch 18')
  }
  return { nodes, edges }
}

fs.writeFileSync(
  '.understand-anything/intermediate/batch-17.json',
  `${JSON.stringify(buildBatch17(), null, 2)}\n`,
)
fs.writeFileSync(
  '.understand-anything/intermediate/batch-18.json',
  `${JSON.stringify(buildBatch18(), null, 2)}\n`,
)
