import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-15.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 15)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 15 inputs are incomplete')
}

const summaries = {
  'tests/helpers/mongoMemoryServer.ts':
    'Creates an isolated in-memory MongoDB instance for integration tests and removes both the server and temporary binary directory during cleanup.',
  'tests/int/api.int.spec.ts':
    'Boots Payload against an in-memory MongoDB database and verifies that the starter’s core collections are queryable through the local API.',
  'tests/int/starter-productization.int.spec.ts':
    'Verifies documented environment defaults and confirms that a clean starter boot exposes its promised core collections and globals.',
}

const nodes = []
const edges = []

for (const file of extraction.results) {
  const fileID = `file:${file.path}`
  const isTest = file.path.includes('/int/')
  nodes.push({
    id: fileID,
    type: 'file',
    name: path.basename(file.path),
    filePath: file.path,
    summary: summaries[file.path],
    tags: isTest
      ? ['test', 'integration-test', 'payload-cms', file.path.includes('productization') ? 'contract' : 'api']
      : ['test-helper', 'mongodb', 'fixture', 'resource-lifecycle'],
    complexity: file.nonEmptyLines >= 50 ? 'moderate' : 'simple',
  })

  const exported = new Set((file.exports ?? []).map((item) => item.name))
  for (const fn of file.functions ?? []) {
    const lines = fn.endLine - fn.startLine + 1
    if (lines < 10 && !exported.has(fn.name)) continue

    const functionID = `function:${file.path}:${fn.name}`
    nodes.push({
      id: functionID,
      type: 'function',
      name: fn.name,
      filePath: file.path,
      lineRange: [fn.startLine, fn.endLine],
      summary:
        'Starts an isolated MongoDB test server and returns its connection URI with an asynchronous cleanup function.',
      tags: ['test-helper', 'mongodb', 'factory', 'resource-lifecycle'],
      complexity: 'simple',
    })
    edges.push({
      source: fileID,
      target: functionID,
      type: 'contains',
      direction: 'forward',
      weight: 1,
    })
    if (exported.has(fn.name)) {
      edges.push({
        source: fileID,
        target: functionID,
        type: 'exports',
        direction: 'forward',
        weight: 0.8,
      })
    }
  }
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
  '.understand-anything/intermediate/batch-15.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
