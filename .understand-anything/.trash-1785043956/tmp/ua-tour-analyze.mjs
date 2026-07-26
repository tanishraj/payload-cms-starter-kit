import fs from 'node:fs'
import path from 'node:path'

const inputPath = process.argv[2]
const outputPath = process.argv[3]

try {
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const { nodes, edges, layers } = input
  const nodeByID = new Map(nodes.map((node) => [node.id, node]))
  const fanIn = Object.fromEntries(nodes.map((node) => [node.id, 0]))
  const fanOut = Object.fromEntries(nodes.map((node) => [node.id, 0]))
  const fileEdges = []

  for (const edge of edges) {
    if (!nodeByID.has(edge.source) || !nodeByID.has(edge.target)) continue
    fanOut[edge.source] += 1
    fanIn[edge.target] += 1
    fileEdges.push(edge)
  }

  const rank = (counts, key) =>
    nodes
      .map((node) => ({ id: node.id, [key]: counts[node.id], name: node.name }))
      .sort((a, b) => b[key] - a[key] || a.id.localeCompare(b.id))
      .slice(0, 20)
  const fanInRanking = rank(fanIn, 'fanIn')
  const fanOutRanking = rank(fanOut, 'fanOut')

  const fanOutValues = Object.values(fanOut).sort((a, b) => a - b)
  const fanInValues = Object.values(fanIn).sort((a, b) => a - b)
  const out90 = fanOutValues[Math.floor(fanOutValues.length * 0.9)] ?? 0
  const in25 = fanInValues[Math.floor(fanInValues.length * 0.25)] ?? 0
  const entryNames = new Set([
    'index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'server.ts', 'server.js',
    'mod.rs', 'main.go', 'main.py', 'main.rs', 'manage.py', 'app.py', 'wsgi.py', 'asgi.py',
    'run.py', '__main__.py', 'Application.java', 'Main.java', 'Program.cs', 'config.ru',
    'index.php', 'App.swift', 'Application.kt', 'main.cpp', 'main.c',
  ])
  const entryPointCandidates = nodes
    .map((node) => {
      let score = 0
      if (node.type === 'document' && node.filePath === 'README.md') score += 5
      else if (node.type === 'document' && !node.filePath.includes('/')) score += 2
      if (node.type === 'file') {
        if (entryNames.has(path.basename(node.filePath))) score += 3
        if (node.filePath.split('/').length <= 2) score += 1
        if (fanOut[node.id] >= out90) score += 1
        if (fanIn[node.id] <= in25) score += 1
      }
      return { id: node.id, score, name: node.name, summary: node.summary }
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5)

  const topCodeEntry = entryPointCandidates.find((candidate) => nodeByID.get(candidate.id)?.type === 'file')
  const adjacency = new Map()
  for (const edge of fileEdges) {
    if (edge.type !== 'imports' && edge.type !== 'calls') continue
    ;(adjacency.get(edge.source) ?? adjacency.set(edge.source, []).get(edge.source)).push(edge.target)
  }
  const order = []
  const depthMap = {}
  const byDepth = {}
  if (topCodeEntry) {
    const queue = [[topCodeEntry.id, 0]]
    const seen = new Set([topCodeEntry.id])
    while (queue.length) {
      const [id, depth] = queue.shift()
      order.push(id)
      depthMap[id] = depth
      ;(byDepth[depth] ??= []).push(id)
      for (const next of adjacency.get(id) ?? []) {
        if (seen.has(next)) continue
        seen.add(next)
        queue.push([next, depth + 1])
      }
    }
  }

  const asInventory = (types) =>
    nodes
      .filter((node) => types.has(node.type))
      .map(({ id, name, type, summary }) => ({ id, name, type, summary }))
  const nonCodeFiles = {
    documentation: asInventory(new Set(['document'])),
    infrastructure: asInventory(new Set(['service', 'pipeline', 'resource'])),
    data: asInventory(new Set(['table', 'schema', 'endpoint'])),
    config: asInventory(new Set(['config'])),
  }

  const pairTypes = new Map()
  for (const edge of fileEdges) {
    if (edge.type !== 'imports' && edge.type !== 'calls') continue
    pairTypes.set(`${edge.source}\0${edge.target}`, true)
  }
  const clusters = []
  const clustered = new Set()
  for (const key of pairTypes.keys()) {
    const [a, b] = key.split('\0')
    if (!pairTypes.has(`${b}\0${a}`)) continue
    const signature = [a, b].sort().join('\0')
    if (clustered.has(signature)) continue
    clustered.add(signature)
    clusters.push({ nodes: [a, b], edgeCount: 2 })
  }

  const nodeSummaryIndex = Object.fromEntries(
    nodes.map((node) => [
      node.id,
      { name: node.name, type: node.type, summary: node.summary },
    ]),
  )
  const result = {
    scriptCompleted: true,
    entryPointCandidates,
    fanInRanking,
    fanOutRanking,
    bfsTraversal: {
      startNode: topCodeEntry?.id ?? null,
      order,
      depthMap,
      byDepth,
    },
    nonCodeFiles,
    clusters: clusters.slice(0, 10),
    layers: { count: layers.length, list: layers },
    nodeSummaryIndex,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    totalFileEdges: fileEdges.length,
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`)
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
}
