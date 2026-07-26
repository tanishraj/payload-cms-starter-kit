import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-28.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 28)

if (!batch || !extraction.scriptCompleted) {
  throw new Error('Batch 28 inputs are incomplete')
}

const summaries = {
  'vitest.config.mts':
    'Configures Vitest integration tests with jsdom, React and TypeScript path plugins, the setup module, and a server-only test alias.',
  'vitest.setup.ts':
    'Loads environment variables before Vitest integration suites execute.',
}

const nodes = batch.files.map((file) => ({
  id: `file:${file.path}`,
  type: 'file',
  name: path.basename(file.path),
  filePath: file.path,
  summary: summaries[file.path],
  tags:
    file.path === 'vitest.config.mts'
      ? ['configuration', 'test', 'vitest', 'jsdom']
      : ['test-setup', 'environment', 'vitest'],
  complexity: 'simple',
}))

const edges = [
  {
    source: 'file:vitest.config.mts',
    target: 'file:vitest.setup.ts',
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  },
  {
    source: 'file:vitest.config.mts',
    target: 'file:tests/helpers/server-only.ts',
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  },
]

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
  '.understand-anything/intermediate/batch-28.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
