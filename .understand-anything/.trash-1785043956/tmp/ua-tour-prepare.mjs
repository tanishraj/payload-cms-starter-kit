import fs from 'node:fs'

const graph = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/assembled-graph.json', 'utf8'),
)
const layers = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/layers.json', 'utf8'),
)
const fileLevelTypes = new Set([
  'file',
  'config',
  'document',
  'service',
  'pipeline',
  'table',
  'schema',
  'resource',
  'endpoint',
])
const nodes = graph.nodes.filter((node) => fileLevelTypes.has(node.type))
const layerSummaries = layers.map(({ id, name, description }) => ({ id, name, description }))

fs.writeFileSync(
  '.understand-anything/tmp/ua-tour-input.json',
  `${JSON.stringify({ nodes, edges: graph.edges, layers: layerSummaries }, null, 2)}\n`,
)
