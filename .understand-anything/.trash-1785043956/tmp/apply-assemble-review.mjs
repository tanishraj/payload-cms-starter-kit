import fs from 'node:fs'

const graphPath = '.understand-anything/intermediate/assembled-graph.json'
const reviewPath = '.understand-anything/intermediate/assemble-review.json'
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'))

const recoveredID = 'function:src/lib/newsEvents.ts:getNewsEventsHighlights'
if (!graph.nodes.some((node) => node.id === recoveredID)) {
  graph.nodes.push({
    id: recoveredID,
    type: 'function',
    name: 'getNewsEventsHighlights',
    filePath: 'src/lib/newsEvents.ts',
    lineRange: [236, 245],
    summary:
      'Loads and caches the requested News & Events highlights, logging and rethrowing retrieval failures.',
    tags: ['data-fetching', 'news-events', 'cache'],
    complexity: 'simple',
  })
}

const recoveredEdges = [
  {
    source: 'file:src/lib/newsEvents.ts',
    target: recoveredID,
    type: 'contains',
    direction: 'forward',
    weight: 1,
  },
  {
    source: 'file:src/lib/newsEvents.ts',
    target: recoveredID,
    type: 'exports',
    direction: 'forward',
    weight: 0.8,
  },
  {
    source: 'function:src/lib/newsEventsPreviewSnapshot.ts:loadNewsEventsPreviewSnapshot',
    target: recoveredID,
    type: 'calls',
    direction: 'forward',
    weight: 0.8,
  },
]

for (const edge of recoveredEdges) {
  if (
    !graph.edges.some(
      (candidate) =>
        candidate.source === edge.source &&
        candidate.target === edge.target &&
        candidate.type === edge.type,
    )
  ) {
    graph.edges.push(edge)
  }
}

fs.writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`)
fs.writeFileSync(
  reviewPath,
  `${JSON.stringify(
    {
      fixedSectionOk: true,
      nodesRecovered: 1,
      edgesRestored: 1,
      crossBatchEdgesAdded: 0,
      typesRemapped: 0,
      complexityRemapped: 0,
      notes: [
        'Recovered exported cached function getNewsEventsHighlights, which the structural extractor omitted because it is wrapped in cache(...).',
        'Restored the dropped call edge and added the function’s contains and exports structural edges.',
        'All 915 importMap relationships already had exact imports edges; no cross-batch import gaps or extras were found.',
        'The assembled graph had no missing IDs, duplicate node IDs, unknown node types, invalid complexity values, or dangling edges before recovery.',
        'Merge normalization counts were reasonable; no systemic ID or complexity correction issue was reported.',
      ],
    },
    null,
    2,
  )}\n`,
)
