import fs from 'node:fs'
import path from 'node:path'

const inputPath = process.argv[2]
const outputPath = process.argv[3]

try {
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const { fileNodes, importEdges, allEdges } = input
  const nodeByID = new Map(fileNodes.map((node) => [node.id, node]))

  const groupFor = (filePath) => {
    const parts = filePath.split('/')
    return parts.length === 1 ? 'root' : parts[0]
  }
  const directoryGroups = {}
  const nodeTypeGroups = {}
  for (const node of fileNodes) {
    const group = groupFor(node.filePath)
    ;(directoryGroups[group] ??= []).push(node.id)
    ;(nodeTypeGroups[node.type] ??= []).push(node.id)
  }

  const fileFanIn = Object.fromEntries(fileNodes.map((node) => [node.id, 0]))
  const fileFanOut = Object.fromEntries(fileNodes.map((node) => [node.id, 0]))
  const interGroupMap = new Map()
  const groupInternal = Object.fromEntries(Object.keys(directoryGroups).map((group) => [group, 0]))
  const groupTotal = Object.fromEntries(Object.keys(directoryGroups).map((group) => [group, 0]))

  for (const edge of importEdges) {
    fileFanOut[edge.source] += 1
    fileFanIn[edge.target] += 1
    const from = groupFor(nodeByID.get(edge.source).filePath)
    const to = groupFor(nodeByID.get(edge.target).filePath)
    groupTotal[from] += 1
    if (from !== to) groupTotal[to] += 1
    if (from === to) groupInternal[from] += 1
    const key = `${from}\0${to}`
    interGroupMap.set(key, (interGroupMap.get(key) ?? 0) + 1)
  }

  const interGroupImports = [...interGroupMap.entries()]
    .map(([key, count]) => {
      const [from, to] = key.split('\0')
      return { from, to, count }
    })
    .sort((a, b) => b.count - a.count)

  const intraGroupDensity = Object.fromEntries(
    Object.keys(directoryGroups).map((group) => [
      group,
      {
        internalEdges: groupInternal[group],
        totalEdges: groupTotal[group],
        density: groupTotal[group] ? groupInternal[group] / groupTotal[group] : 0,
      },
    ]),
  )

  const crossCategoryMap = new Map()
  for (const edge of allEdges) {
    const fromType = nodeByID.get(edge.source).type
    const toType = nodeByID.get(edge.target).type
    const key = `${fromType}\0${toType}\0${edge.type}`
    crossCategoryMap.set(key, (crossCategoryMap.get(key) ?? 0) + 1)
  }
  const crossCategoryEdges = [...crossCategoryMap.entries()]
    .map(([key, count]) => {
      const [fromType, toType, edgeType] = key.split('\0')
      return { fromType, toType, edgeType, count }
    })
    .sort((a, b) => b.count - a.count)

  const patternMatches = {}
  const patterns = {
    src: 'application',
    tests: 'test',
    docs: 'documentation',
    public: 'assets',
    scripts: 'utility',
    root: 'config',
  }
  for (const group of Object.keys(directoryGroups)) patternMatches[group] = patterns[group] ?? 'other'

  const pairCounts = new Map()
  for (const item of interGroupImports) {
    if (item.from === item.to) continue
    pairCounts.set(`${item.from}\0${item.to}`, item.count)
  }
  const dependencyDirection = []
  const seenPairs = new Set()
  for (const item of interGroupImports) {
    if (item.from === item.to) continue
    const sorted = [item.from, item.to].sort()
    const pair = sorted.join('\0')
    if (seenPairs.has(pair)) continue
    seenPairs.add(pair)
    const forward = pairCounts.get(`${sorted[0]}\0${sorted[1]}`) ?? 0
    const backward = pairCounts.get(`${sorted[1]}\0${sorted[0]}`) ?? 0
    dependencyDirection.push(
      forward >= backward
        ? { dependent: sorted[0], dependsOn: sorted[1], count: forward }
        : { dependent: sorted[1], dependsOn: sorted[0], count: backward },
    )
  }

  const infraFiles = fileNodes
    .filter((node) => node.type === 'service' || node.type === 'pipeline' || node.type === 'resource')
    .map((node) => node.filePath)
  const deploymentTopology = {
    hasDockerfile: fileNodes.some((node) => node.filePath === 'Dockerfile'),
    hasCompose: fileNodes.some((node) => node.filePath.startsWith('docker-compose')),
    hasK8s: fileNodes.some((node) => /(^|\/)(k8s|kubernetes)\//.test(node.filePath)),
    hasTerraform: fileNodes.some((node) => /\.tf(vars)?$/.test(node.filePath)),
    hasCI: fileNodes.some((node) => node.type === 'pipeline'),
    infraFiles,
  }

  const dataPipeline = {
    schemaFiles: fileNodes.filter((node) => node.type === 'schema').map((node) => node.filePath),
    migrationFiles: fileNodes.filter((node) => /migration/i.test(node.filePath)).map((node) => node.filePath),
    dataModelFiles: fileNodes
      .filter((node) => /src\/(collections|globals|fields)\//.test(node.filePath))
      .map((node) => node.filePath),
    apiHandlerFiles: fileNodes
      .filter((node) => /src\/app\/api\/.*\/route\.[jt]sx?$/.test(node.filePath))
      .map((node) => node.filePath),
  }

  const groupsWithDocs = Object.keys(directoryGroups).filter((group) =>
    fileNodes.some(
      (node) => groupFor(node.filePath) === group && node.type === 'document',
    ),
  )
  const docCoverage = {
    groupsWithDocs: groupsWithDocs.length,
    totalGroups: Object.keys(directoryGroups).length,
    coverageRatio: groupsWithDocs.length / Object.keys(directoryGroups).length,
    undocumentedGroups: Object.keys(directoryGroups).filter((group) => !groupsWithDocs.includes(group)),
  }

  const result = {
    scriptCompleted: true,
    directoryGroups,
    nodeTypeGroups,
    crossCategoryEdges,
    interGroupImports,
    intraGroupDensity,
    patternMatches,
    deploymentTopology,
    dataPipeline,
    docCoverage,
    dependencyDirection,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup: Object.fromEntries(
        Object.entries(directoryGroups).map(([group, ids]) => [group, ids.length]),
      ),
      nodeTypeCounts: Object.fromEntries(
        Object.entries(nodeTypeGroups).map(([type, ids]) => [type, ids.length]),
      ),
    },
    fileFanIn,
    fileFanOut,
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`)
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
}
