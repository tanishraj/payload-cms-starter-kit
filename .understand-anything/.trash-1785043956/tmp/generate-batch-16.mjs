import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-16.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 16)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 16 inputs are incomplete')
}

const nodes = []
const edges = []

const parentSummaries = {
  Dockerfile:
    'Defines a four-stage Alpine-based Node.js build that installs locked dependencies, compiles the Next.js standalone application, and runs it as a non-root user on port 3000.',
  'docker-compose.yml':
    'Defines a local development environment with a hot-reloading Payload application, MongoDB persistence, environment injection, and named dependency volumes.',
}

const stageSummaries = {
  base: 'Pins the shared Node.js 22 Alpine image used by all later build stages.',
  deps: 'Installs libc compatibility and reproducible JavaScript dependencies using the available lockfile.',
  builder: 'Copies dependencies and source code, then builds the standalone Next.js production output.',
  runner: 'Creates the minimal non-root production runtime containing public assets and traced standalone output.',
}

for (const file of extraction.results) {
  const parentID = `service:${file.path}`
  nodes.push({
    id: parentID,
    type: 'service',
    name: path.basename(file.path),
    filePath: file.path,
    summary: parentSummaries[file.path],
    tags:
      file.path === 'Dockerfile'
        ? ['containerization', 'infrastructure', 'deployment', 'nextjs']
        : ['orchestration', 'infrastructure', 'development', 'mongodb'],
    complexity: file.nonEmptyLines >= 50 ? 'moderate' : 'simple',
    ...(file.path === 'Dockerfile'
      ? {
          languageNotes:
            'Uses a multi-stage standalone Next.js build to separate dependencies, compilation, and the minimal non-root runtime.',
        }
      : {}),
  })

  for (const service of file.services ?? []) {
    const serviceID = `service:${file.path}:${service.name}`
    nodes.push({
      id: serviceID,
      type: 'service',
      name: service.name,
      filePath: file.path,
      summary: stageSummaries[service.name] ?? `Defines the ${service.name} container service.`,
      tags: ['container-stage', 'docker', service.name, service.name === 'runner' ? 'runtime' : 'build'],
      complexity: service.endLine - service.startLine + 1 >= 15 ? 'moderate' : 'simple',
    })
    edges.push({
      source: parentID,
      target: serviceID,
      type: 'contains',
      direction: 'forward',
      weight: 1,
    })
  }
}

const composeParentID = 'service:docker-compose.yml'
for (const service of [
  {
    name: 'payload',
    summary:
      'Runs the Payload development server on Node.js 22 with source and dependency volumes, environment configuration, and a MongoDB dependency.',
    tags: ['compose-service', 'payload-cms', 'development', 'nodejs'],
  },
  {
    name: 'mongo',
    summary:
      'Runs the MongoDB database with WiredTiger storage and a persistent named data volume.',
    tags: ['compose-service', 'mongodb', 'database', 'persistence'],
  },
]) {
  const serviceID = `service:docker-compose.yml:${service.name}`
  nodes.push({
    id: serviceID,
    type: 'service',
    name: service.name,
    filePath: 'docker-compose.yml',
    summary: service.summary,
    tags: service.tags,
    complexity: 'simple',
  })
  edges.push({
    source: composeParentID,
    target: serviceID,
    type: 'contains',
    direction: 'forward',
    weight: 1,
  })
}

edges.push(
  {
    source: 'service:Dockerfile:deps',
    target: 'service:Dockerfile:base',
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  },
  {
    source: 'service:Dockerfile:builder',
    target: 'service:Dockerfile:deps',
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  },
  {
    source: 'service:Dockerfile:runner',
    target: 'service:Dockerfile:builder',
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  },
  {
    source: 'service:docker-compose.yml:payload',
    target: 'service:docker-compose.yml:mongo',
    type: 'depends_on',
    direction: 'forward',
    weight: 0.6,
  },
)

for (const [sourcePath, targets] of Object.entries(batch.batchImportData)) {
  for (const targetPath of targets) {
    edges.push({
      source: `service:${sourcePath}`,
      target: `file:${targetPath}`,
      type: 'imports',
      direction: 'forward',
      weight: 0.7,
    })
  }
}

fs.writeFileSync(
  '.understand-anything/intermediate/batch-16.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
