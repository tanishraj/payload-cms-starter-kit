import fs from 'node:fs'

const graph = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/assembled-graph.json', 'utf8'),
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
const fileNodes = graph.nodes.filter((node) => fileLevelTypes.has(node.type))
const fileNodeIDs = new Set(fileNodes.map((node) => node.id))
const allEdges = graph.edges.filter(
  (edge) => fileNodeIDs.has(edge.source) && fileNodeIDs.has(edge.target),
)
const importEdges = allEdges.filter((edge) => edge.type === 'imports')

fs.writeFileSync(
  '.understand-anything/tmp/ua-arch-input.json',
  `${JSON.stringify({ fileNodes, importEdges, allEdges }, null, 2)}\n`,
)
