import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-14.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 14)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 14 inputs are incomplete')
}

const summaries = {
  'tests/e2e/admin.e2e.spec.ts':
    'Playwright end-to-end coverage that authenticates a seeded administrator and verifies dashboard, user-list, and user-edit navigation.',
  'tests/e2e/frontend.e2e.spec.ts':
    'Playwright end-to-end coverage that seeds a published homepage and verifies its title and announcement content on the public frontend.',
  'tests/helpers/login.ts':
    'Provides a Playwright helper that authenticates a test user through the Payload admin login form.',
  'tests/helpers/seedHomepage.ts':
    'Creates and removes the published homepage fixture used by frontend end-to-end tests, including representative Announcement and CTA blocks.',
  'tests/helpers/seedUser.ts':
    'Creates, resolves, and removes the deterministic administrator fixture used across end-to-end tests.',
}

const functionSummaries = {
  login: 'Authenticates a supplied test user through the Payload admin login interface.',
  seedHomepage: 'Creates the published homepage fixture and assigns it as the global homepage.',
  cleanupHomepage: 'Clears the global homepage reference and deletes the seeded page fixture.',
  seedTestUser: 'Replaces any existing fixture account with a fresh administrator test user.',
  getTestUserDocument: 'Loads the seeded test user and returns the identity fields needed for access-controlled fixture creation.',
  cleanupTestUser: 'Deletes the deterministic test-user fixture after an end-to-end run.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

const nodes = []
const edges = []

for (const file of extraction.results) {
  const fileID = `file:${file.path}`
  const isSuite = file.path.includes('/e2e/')
  nodes.push({
    id: fileID,
    type: 'file',
    name: path.basename(file.path),
    filePath: file.path,
    summary: summaries[file.path],
    tags: isSuite
      ? ['test', 'e2e-test', 'playwright', file.path.includes('admin') ? 'admin-ui' : 'frontend']
      : ['test-helper', 'fixture', 'payload-cms', file.path.includes('login') ? 'authentication' : 'seeding'],
    complexity: complexity(file.nonEmptyLines),
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
      summary: functionSummaries[fn.name] ?? `Implements the ${fn.name} test-helper behavior.`,
      tags: fn.name === 'login'
        ? ['test-helper', 'authentication', 'playwright']
        : ['test-helper', 'fixture', 'database'],
      complexity: complexity(lines),
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
  '.understand-anything/intermediate/batch-14.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
