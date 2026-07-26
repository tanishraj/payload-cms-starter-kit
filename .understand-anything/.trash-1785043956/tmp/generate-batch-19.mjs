import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-19.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 19)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 19 inputs are incomplete')
}

const summaries = {
  'docs/operations/editorial-governance.md':
    'Operational guide to editorial roles, workflow states, high-risk administration surfaces, and the version-and-audit recovery procedure.',
  'docs/operations/mongodb-deployment.md':
    'Deployment runbook covering supported MongoDB environments, required database and media variables, local Docker startup, hosted storage guidance, and verification.',
  'docs/operations/starter-clone-checklist.md':
    'Client handoff checklist for replacing identity defaults, selecting providers, reviewing CMS configuration, testing content workflows, and preserving safe customization boundaries.',
}

const tags = {
  'docs/operations/editorial-governance.md': [
    'documentation',
    'operations',
    'editorial-workflow',
    'governance',
  ],
  'docs/operations/mongodb-deployment.md': [
    'documentation',
    'deployment',
    'mongodb',
    'configuration',
  ],
  'docs/operations/starter-clone-checklist.md': [
    'documentation',
    'operations',
    'client-handoff',
    'checklist',
  ],
}

const documentedTargets = {
  'docs/operations/editorial-governance.md': [
    'file:src/collections/Pages.ts',
    'file:src/collections/SystemPages.ts',
    'file:src/collections/OperationalAuditEvents.ts',
    'file:src/globals/SystemModeSettings.ts',
  ],
  'docs/operations/mongodb-deployment.md': [
    'config:.env.example',
    'service:docker-compose.yml',
    'file:src/config/runtime.ts',
    'file:src/config/providers.ts',
  ],
  'docs/operations/starter-clone-checklist.md': [
    'config:package.json',
    'document:docs/architecture/content-model-map.md',
    'file:src/config/runtime.ts',
    'file:src/config/providers.ts',
    'file:src/globals/SiteSettings.ts',
    'file:src/globals/PageSettings.ts',
    'file:src/globals/SEOSettings.ts',
    'file:src/globals/ThemeSettings.ts',
    'file:src/collections/SystemPages.ts',
    'file:src/lib/formSubmissionEvents.ts',
  ],
}

const nodes = extraction.results.map((file) => ({
  id: `document:${file.path}`,
  type: 'document',
  name: path.basename(file.path),
  filePath: file.path,
  summary: summaries[file.path],
  tags: tags[file.path],
  complexity: file.nonEmptyLines >= 50 ? 'moderate' : 'simple',
}))

const edges = []
for (const [sourcePath, targets] of Object.entries(documentedTargets)) {
  for (const target of targets) {
    edges.push({
      source: `document:${sourcePath}`,
      target,
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
  '.understand-anything/intermediate/batch-19.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
