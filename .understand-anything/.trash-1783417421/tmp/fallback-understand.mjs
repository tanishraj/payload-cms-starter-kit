#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import ts from 'typescript'

const projectRoot = process.cwd()
const uaRoot = path.join(projectRoot, '.understand-anything')
const intermediateDir = path.join(uaRoot, 'intermediate')

const outputLanguage = 'en'
const warnings = [
  'Official understand-anything plugin checkout was not installed; graph generated via local fallback analyzer.',
]

const KNOWN_NODE_TYPES = new Set([
  'file',
  'function',
  'class',
  'module',
  'concept',
  'config',
  'document',
  'service',
  'table',
  'endpoint',
  'pipeline',
  'schema',
  'resource',
])

const KNOWN_FILE_PREFIXES = ['file:', 'config:', 'document:', 'service:', 'pipeline:', 'table:', 'schema:', 'resource:', 'endpoint:']
const FILE_LEVEL_TYPES = new Set(['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint'])

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n')
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function lineCount(text) {
  if (!text) return 0
  return text.split(/\r?\n/).length
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function wordsFromName(value) {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleFromFile(filePath) {
  const base = path.basename(filePath)
  return wordsFromName(base)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function detectLanguage(filePath) {
  const base = path.basename(filePath)
  const ext = path.extname(filePath).toLowerCase()
  if (base === 'Dockerfile') return 'dockerfile'
  if (base === 'docker-compose.yml' || base === 'docker-compose.yaml') return 'yaml'
  if (base === 'package.json' || ext === '.json') return 'json'
  if (ext === '.ts' || ext === '.tsx') return 'typescript'
  if (ext === '.js' || ext === '.jsx' || ext === '.mjs' || ext === '.cjs') return 'javascript'
  if (ext === '.css' || ext === '.scss') return 'css'
  if (ext === '.md' || ext === '.mdx') return 'markdown'
  if (ext === '.yml' || ext === '.yaml') return 'yaml'
  if (ext === '.toml') return 'toml'
  if (ext === '.env') return 'config'
  if (ext === '.sql') return 'sql'
  if (ext === '.html') return 'html'
  if (ext === '.sh') return 'shell'
  return ext ? ext.slice(1) : 'unknown'
}

function isRootConfig(filePath) {
  return [
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'postcss.config.mjs',
    'eslint.config.mjs',
    'playwright.config.ts',
    'vitest.config.mts',
    'vitest.setup.ts',
    'components.json',
    'Dockerfile',
    'docker-compose.yml',
    '.env.example',
    '.env',
    '.npmrc',
    '.yarnrc',
    '.prettierrc.json',
    'next-env.d.ts',
    'test.env',
  ].includes(filePath)
}

function detectFileCategory(filePath, language) {
  const base = path.basename(filePath)
  if (base === 'Dockerfile' || filePath === 'docker-compose.yml') return 'infra'
  if (filePath.startsWith('.github/workflows/')) return 'infra'
  if (filePath.endsWith('.tf')) return 'infra'
  if (filePath.endsWith('.md') || /^readme/i.test(base)) return 'docs'
  if (filePath.startsWith('src/styles/') || language === 'css' || language === 'html') return 'markup'
  if (filePath.endsWith('.sh')) return 'script'
  if (filePath.endsWith('.sql')) return 'data'
  if (
    isRootConfig(filePath) ||
    filePath.startsWith('.vscode/') ||
    filePath.endsWith('.json') ||
    filePath.endsWith('.toml') ||
    filePath.endsWith('.yml') ||
    filePath.endsWith('.yaml') ||
    filePath.endsWith('.env') ||
    filePath.endsWith('.env.example')
  ) {
    return 'config'
  }
  return 'code'
}

function detectNodeType(filePath, fileCategory) {
  const base = path.basename(filePath)
  if (filePath.endsWith('/route.ts') || filePath === 'src/app/robots.ts' || filePath === 'src/app/sitemap.ts') {
    return 'endpoint'
  }
  if (fileCategory === 'docs') return 'document'
  if (filePath.startsWith('.github/workflows/')) return 'pipeline'
  if (base === 'Dockerfile' || filePath === 'docker-compose.yml') return 'service'
  if (filePath.endsWith('.tf')) return 'resource'
  if (filePath.endsWith('.sql')) return 'table'
  if (filePath.endsWith('.graphql') || filePath.endsWith('.gql') || filePath.endsWith('.proto') || filePath.endsWith('.prisma')) return 'schema'
  if (fileCategory === 'config') return 'config'
  return 'file'
}

function nodeIdForFile(filePath, nodeType) {
  return `${nodeType}:${filePath}`
}

function inferTags(filePath, fileCategory, nodeType) {
  const tags = new Set([fileCategory])
  const segments = filePath.split('/')
  for (const segment of segments.slice(0, -1)) {
    if (segment && !segment.startsWith('(') && !segment.startsWith('[')) tags.add(segment)
  }
  const base = path.basename(filePath).toLowerCase()
  if (base.includes('test') || base.includes('spec')) tags.add('test')
  if (filePath.includes('/collections/')) tags.add('payload')
  if (filePath.includes('/globals/')) tags.add('payload')
  if (filePath.includes('/blocks/')) tags.add('block')
  if (filePath.includes('/app/')) tags.add('nextjs')
  if (filePath.includes('/components/ui/')) tags.add('ui')
  if (filePath.includes('/hooks/')) tags.add('hook')
  if (filePath.includes('/lib/')) tags.add('utility')
  if (filePath.includes('/styles/')) tags.add('styles')
  if (nodeType === 'endpoint') tags.add('route')
  if (filePath === 'src/payload.config.ts') tags.add('entry')
  return [...tags]
}

function inferFileSummary(filePath, nodeType) {
  const name = titleFromFile(filePath)
  const base = path.basename(filePath)
  if (filePath === 'README.md') return 'Primary project overview with local setup and deployment guidance for the Payload starter.'
  if (filePath === 'package.json') return 'Node package manifest describing the Next.js, Payload, React, and tooling dependencies.'
  if (filePath === 'src/payload.config.ts') return 'Central Payload configuration wiring collections, globals, SQLite storage, email delivery, the rich text editor, and plugins.'
  if (filePath.startsWith('src/collections/')) return `${name} Payload collection definition for content modeling, admin behavior, and access rules.`
  if (filePath.startsWith('src/globals/')) return `${name} Payload global configuration for site-wide settings managed through the CMS.`
  if (filePath.startsWith('src/hooks/')) return `${name} hook that coordinates CMS side effects and publication rules.`
  if (filePath.startsWith('src/fields/')) return `${name} shared field configuration reused across Payload collections or globals.`
  if (filePath.startsWith('src/plugins/')) return `${name} custom Payload plugin extension.`
  if (filePath.startsWith('src/lib/')) return `${name} shared domain utility used by collections, routes, or frontend rendering.`
  if (filePath.startsWith('src/blocks/') && filePath.endsWith('/config.ts')) return `${name} Payload block schema used to configure reusable page sections.`
  if (filePath.startsWith('src/blocks/') && filePath.endsWith('/Component.tsx')) return `${name} React renderer for a CMS-managed block.`
  if (filePath === 'src/blocks/renderBlocks.tsx') return 'Block rendering switchboard that maps stored block types to React components.'
  if (filePath === 'src/blocks/renderHeader.tsx' || filePath === 'src/blocks/renderFooter.tsx') return `${name} helper that resolves CMS-managed navigation content into frontend components.`
  if (filePath.startsWith('src/components/ui/')) return `${name} reusable UI primitive in the local design system layer.`
  if (filePath.startsWith('src/components/')) return `${name} reusable React component used by blocks, layouts, or system pages.`
  if (filePath === 'src/app/(frontend)/page.tsx') return 'Homepage entry that resolves system-mode fallbacks and renders CMS-managed page content.'
  if (filePath === 'src/app/(frontend)/[...slug]/page.tsx') return 'Catch-all frontend route that resolves published pages by slug path.'
  if (filePath === 'src/app/(frontend)/PageContent.tsx') return 'Thin frontend bridge that turns a Payload page document into rendered blocks.'
  if (filePath === 'src/app/(frontend)/pageData.ts') return 'Server-side page data layer for fetching pages, SEO state, and system fallback behavior.'
  if (filePath === 'src/app/api/forms/[slug]/submit/route.ts') return 'Public form submission endpoint with spam checks, validation, persistence, and notification email delivery.'
  if (filePath.startsWith('src/app/')) return `${name} Next.js app router module for frontend, admin, or API delivery.`
  if (filePath.startsWith('src/styles/themes/')) return `${name} theme stylesheet defining one of the available presentation variants.`
  if (filePath.startsWith('src/styles/')) return `${name} shared stylesheet for the frontend shell.`
  if (filePath === 'Dockerfile') return 'Container build definition for running the application in Dockerized environments.'
  if (filePath === 'docker-compose.yml') return 'Local orchestration file for running the application with supporting services in Docker.'
  if (filePath.startsWith('.vscode/')) return `${name} editor workspace configuration for local development.`
  if (nodeType === 'config') return `${name} configuration file used by the application build, runtime, or developer tooling.`
  if (nodeType === 'document') return `${name} documentation file for the project.`
  if (nodeType === 'service') return `${name} service or container configuration file.`
  if (nodeType === 'endpoint') return `${name} application endpoint or route module.`
  return `${name} source file in the application codebase.`
}

function parseIgnoreRules() {
  const ignorePath = path.join(uaRoot, '.understandignore')
  const rules = readText(ignorePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))

  return (filePath) => {
    for (const rule of rules) {
      if (rule.endsWith('/')) {
        if (filePath === rule.slice(0, -1) || filePath.startsWith(rule)) return true
      } else if (rule.startsWith('*.')) {
        if (filePath.endsWith(rule.slice(1))) return true
      } else if (filePath === rule || filePath.startsWith(`${rule}/`)) {
        return true
      }
    }
    return false
  }
}

function listTrackedFiles() {
  const result = spawnSync('git', ['ls-files'], {
    cwd: projectRoot,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || 'git ls-files failed')
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function makeResolver(allFilesSet) {
  const extensionCandidates = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json']

  return (specifier, fromFile) => {
    if (!specifier || specifier.startsWith('node:')) return null

    let candidate = null
    if (specifier === '@payload-config') {
      candidate = 'src/payload.config.ts'
    } else if (specifier.startsWith('@/')) {
      candidate = path.posix.normalize(path.posix.join('src', specifier.slice(2)))
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      const baseDir = path.posix.dirname(fromFile)
      candidate = path.posix.normalize(path.posix.join(baseDir, specifier))
    } else {
      return null
    }

    if (allFilesSet.has(candidate)) return candidate
    for (const ext of extensionCandidates) {
      if (allFilesSet.has(candidate + ext)) return candidate + ext
      if (allFilesSet.has(path.posix.join(candidate, 'index' + ext))) return path.posix.join(candidate, 'index' + ext)
    }
    return null
  }
}

function getNodeNameForDeclaration(node, defaultName) {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text
  return defaultName
}

function collectExportedSymbols(sourceFile) {
  const symbols = []

  function addSymbol(kind, name, summary) {
    if (!name) return
    symbols.push({ kind, name, summary })
  }

  function visit(node) {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : []
    const isExported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    const isDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)

    if (ts.isFunctionDeclaration(node) && (isExported || isDefault)) {
      const name = getNodeNameForDeclaration(node, isDefault ? 'default' : null)
      addSymbol('function', name, `Exported function ${name}.`)
    } else if (ts.isClassDeclaration(node) && (isExported || isDefault)) {
      const name = getNodeNameForDeclaration(node, isDefault ? 'default' : null)
      addSymbol('class', name, `Exported class ${name}.`)
    } else if (ts.isVariableStatement(node) && isExported) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue
        const symbolName = declaration.name.text
        const initializer = declaration.initializer
        if (
          initializer &&
          (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
        ) {
          addSymbol('function', symbolName, `Exported function ${symbolName}.`)
        } else {
          addSymbol('class', symbolName, `Exported value ${symbolName}.`)
        }
      }
    } else if (ts.isExportAssignment(node)) {
      addSymbol('function', 'default', 'Default export.')
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return symbols
}

function summarizeProject(packageJson, readmeText) {
  const frameworks = []
  const deps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  }

  if (deps.next) frameworks.push('Next.js')
  if (deps.payload) frameworks.push('Payload CMS')
  if (deps.react) frameworks.push('React')
  if (deps.tailwindcss) frameworks.push('Tailwind CSS')
  if (deps.shadcn) frameworks.push('shadcn/ui')
  if (deps['@payloadcms/db-sqlite']) frameworks.push('SQLite')
  if (deps.vitest) frameworks.push('Vitest')
  if (deps['@playwright/test']) frameworks.push('Playwright')

  const languages = ['typescript', 'css', 'markdown', 'json', 'yaml']

  const description =
    packageJson.description ||
    readmeText.split(/\r?\n/).find((line) => line.trim() && !line.startsWith('#'))?.trim() ||
    'Payload-based application'

  return {
    name: packageJson.name || path.basename(projectRoot),
    description,
    frameworks,
    languages,
  }
}

function buildLayers(fileNodes) {
  const groups = [
    {
      id: 'layer:platform-tooling',
      name: 'Platform & Tooling',
      description: 'Project-level documentation, build tooling, Docker assets, and editor configuration.',
      match: (node) =>
        node.filePath === 'README.md' ||
        node.filePath === 'readme.md' ||
        node.filePath === 'package.json' ||
        isRootConfig(node.filePath) ||
        node.filePath.startsWith('.vscode/') ||
        node.type === 'service' ||
        node.type === 'pipeline' ||
        node.filePath === 'AGENTS.md' ||
        node.filePath === 'SKILL.md',
    },
    {
      id: 'layer:payload-core',
      name: 'Payload Core',
      description: 'Payload configuration, collections, globals, access control, hooks, and CMS plugins.',
      match: (node) =>
        node.filePath === 'src/payload.config.ts' ||
        node.filePath.startsWith('src/collections/') ||
        node.filePath.startsWith('src/globals/') ||
        node.filePath.startsWith('src/hooks/') ||
        node.filePath.startsWith('src/access/') ||
        node.filePath.startsWith('src/plugins/') ||
        node.filePath.startsWith('src/fields/'),
    },
    {
      id: 'layer:shared-domain',
      name: 'Shared Domain Utilities',
      description: 'Reusable domain logic for SEO, navigation, forms, media, and URL handling.',
      match: (node) => node.filePath.startsWith('src/lib/'),
    },
    {
      id: 'layer:content-rendering',
      name: 'Content Rendering',
      description: 'Reusable blocks, presentational components, and styles that turn CMS data into UI.',
      match: (node) =>
        node.filePath.startsWith('src/blocks/') ||
        node.filePath.startsWith('src/components/') ||
        node.filePath.startsWith('src/styles/'),
    },
    {
      id: 'layer:application-delivery',
      name: 'Application Delivery',
      description: 'Next.js app-router pages, API routes, admin entry points, and route-level server logic.',
      match: (node) => node.filePath.startsWith('src/app/'),
    },
  ]

  const layers = groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    nodeIds: [],
  }))

  const fallbackLayer = layers[0]
  for (const node of fileNodes) {
    const match = groups.find((group) => group.match(node))
    ;(match ? layers.find((layer) => layer.id === match.id) : fallbackLayer).nodeIds.push(node.id)
  }

  return layers.filter((layer) => layer.nodeIds.length > 0)
}

function buildTour(nodeMap) {
  const steps = []

  function includeExisting(ids) {
    return ids.filter((id) => nodeMap.has(id))
  }

  const candidates = [
    {
      order: 1,
      title: 'Project Overview',
      description: 'Start with the project README and package manifest to understand the application stack and local workflow.',
      nodeIds: includeExisting(['document:README.md', 'config:package.json']),
    },
    {
      order: 2,
      title: 'Payload Bootstrap',
      description: 'The Payload config is the operational center that registers collections, globals, storage, email, and plugins.',
      nodeIds: includeExisting(['file:src/payload.config.ts']),
    },
    {
      order: 3,
      title: 'Content Model',
      description: 'Collections and globals define the editable site structure, publishing rules, and reusable settings.',
      nodeIds: includeExisting([
        'file:src/collections/Pages.ts',
        'file:src/collections/Forms.ts',
        'file:src/globals/PageSettings.ts',
        'file:src/globals/SEOSettings.ts',
      ]),
    },
    {
      order: 4,
      title: 'Editorial Rules & Side Effects',
      description: 'Access checks, hooks, and shared utilities enforce business rules around page hierarchy, redirects, and navigation synchronization.',
      nodeIds: includeExisting([
        'file:src/access/adminCapabilities.ts',
        'file:src/hooks/createRedirectsForChangedPagePath.ts',
        'file:src/hooks/syncNavigationLinkForPage.ts',
        'file:src/lib/navigationLinkSync.ts',
      ]),
    },
    {
      order: 5,
      title: 'Frontend Data Flow',
      description: 'The frontend app router fetches CMS data, handles fallback modes, and turns page documents into renderable blocks.',
      nodeIds: includeExisting([
        'file:src/app/(frontend)/page.tsx',
        'file:src/app/(frontend)/pageData.ts',
        'file:src/app/(frontend)/PageContent.tsx',
        'file:src/app/(frontend)/[...slug]/page.tsx',
      ]),
    },
    {
      order: 6,
      title: 'Block Rendering',
      description: 'Blocks and shared components define how CMS-managed layouts become concrete React UI.',
      nodeIds: includeExisting([
        'file:src/blocks/renderBlocks.tsx',
        'file:src/blocks/Hero36/Component.tsx',
        'file:src/blocks/Form/Component.tsx',
        'file:src/components/navbar12.tsx',
      ]),
    },
    {
      order: 7,
      title: 'Form Submission Pipeline',
      description: 'The public forms route validates submissions, stores them through Payload, and sends notifications when configured.',
      nodeIds: includeExisting([
        'endpoint:src/app/api/forms/[slug]/submit/route.ts',
        'file:src/lib/forms.ts',
        'file:src/lib/formSpamProtection.ts',
        'file:src/lib/formNotifications.ts',
      ]),
    },
    {
      order: 8,
      title: 'Presentation & Runtime',
      description: 'Styles, themes, and Docker assets shape how the application is delivered and themed across environments.',
      nodeIds: includeExisting([
        'file:src/styles/globals.css',
        'file:src/styles/themes/theme-default.css',
        'service:Dockerfile',
        'service:docker-compose.yml',
      ]),
    },
  ]

  for (const step of candidates) {
    if (step.nodeIds.length > 0) steps.push(step)
  }

  return steps
}

function validateGraph(graph) {
  const issues = []
  const reviewWarnings = [...warnings]
  const nodeIds = new Set()
  const seenNodeIds = new Set()

  for (const [index, node] of graph.nodes.entries()) {
    if (!node.id) {
      issues.push(`Node[${index}] missing id`)
      continue
    }
    if (seenNodeIds.has(node.id)) {
      issues.push(`Duplicate node ID '${node.id}'`)
      continue
    }
    seenNodeIds.add(node.id)
    nodeIds.add(node.id)
    if (!KNOWN_NODE_TYPES.has(node.type)) issues.push(`Node '${node.id}' has invalid type '${node.type}'`)
    if (!node.name) node.name = path.basename(node.filePath || node.id)
    if (!node.summary) node.summary = 'No summary available.'
    if (!Array.isArray(node.tags) || node.tags.length === 0) node.tags = ['untagged']
  }

  graph.edges = graph.edges.filter((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return false
    return true
  })

  const fileNodeIds = new Set(graph.nodes.filter((node) => FILE_LEVEL_TYPES.has(node.type)).map((node) => node.id))
  const assignedLayerIds = new Set()

  graph.layers = graph.layers.map((layer) => ({
    id: layer.id || `layer:${kebab(layer.name || 'untitled-layer')}`,
    name: layer.name || 'Untitled Layer',
    description: layer.description || 'No description available.',
    nodeIds: (layer.nodeIds || []).filter((id) => nodeIds.has(id)),
  }))

  for (const layer of graph.layers) {
    for (const nodeId of layer.nodeIds) {
      if (assignedLayerIds.has(nodeId)) {
        issues.push(`Node '${nodeId}' appears in multiple layers`)
      }
      assignedLayerIds.add(nodeId)
    }
  }

  for (const nodeId of fileNodeIds) {
    if (!assignedLayerIds.has(nodeId)) issues.push(`File node '${nodeId}' not in any layer`)
  }

  graph.tour = graph.tour
    .map((step, index) => ({
      order: typeof step.order === 'number' ? step.order : index + 1,
      title: step.title || `Step ${index + 1}`,
      description: step.description || 'No description available.',
      nodeIds: (step.nodeIds || []).filter((id) => nodeIds.has(id)),
    }))
    .sort((a, b) => a.order - b.order)

  for (const [index, step] of graph.tour.entries()) {
    if (step.nodeIds.length === 0) reviewWarnings.push(`Tour step ${index + 1} has no valid node references after normalization.`)
  }

  return {
    issues,
    warnings: reviewWarnings,
    stats: {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      totalLayers: graph.layers.length,
      tourSteps: graph.tour.length,
      nodeTypes: graph.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1
        return acc
      }, {}),
      edgeTypes: graph.edges.reduce((acc, edge) => {
        acc[edge.type] = (acc[edge.type] || 0) + 1
        return acc
      }, {}),
    },
  }
}

const readmePath = fs.existsSync(path.join(projectRoot, 'README.md')) ? 'README.md' : null
const readmeText = readmePath ? readText(path.join(projectRoot, readmePath)) : ''
const packageJson = readJson(path.join(projectRoot, 'package.json'), {})
const projectInfo = summarizeProject(packageJson, readmeText)
const ignoreFilter = parseIgnoreRules()
const commitHash = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' }).stdout.trim()
const allTrackedFiles = listTrackedFiles()
const filteredFiles = allTrackedFiles.filter((filePath) => !ignoreFilter(filePath))
const allFilesSet = new Set(filteredFiles)
const resolveImport = makeResolver(allFilesSet)

const fileEntries = []
const importMap = {}
const fileNodes = []
const nodes = []
const edges = []
const uniqueEdgeKeys = new Set()

function pushEdge(source, target, type, weight = 0.5) {
  const key = `${source}|${target}|${type}`
  if (uniqueEdgeKeys.has(key)) return
  uniqueEdgeKeys.add(key)
  edges.push({ source, target, type, weight })
}

for (const filePath of filteredFiles) {
  const absPath = path.join(projectRoot, filePath)
  const text = readText(absPath)
  const language = detectLanguage(filePath)
  const fileCategory = detectFileCategory(filePath, language)
  const sizeLines = lineCount(text)
  const nodeType = detectNodeType(filePath, fileCategory)
  const fileNode = {
    id: nodeIdForFile(filePath, nodeType),
    type: nodeType,
    name: titleFromFile(filePath),
    filePath,
    summary: inferFileSummary(filePath, nodeType),
    tags: inferTags(filePath, fileCategory, nodeType),
  }

  fileEntries.push({ path: filePath, language, sizeLines, fileCategory })
  fileNodes.push(fileNode)
  nodes.push(fileNode)
  importMap[filePath] = []
}

const fileNodeByPath = new Map(fileNodes.map((node) => [node.filePath, node]))

for (const entry of fileEntries.filter((file) => ['typescript', 'javascript'].includes(file.language))) {
  const filePath = entry.path
  const absPath = path.join(projectRoot, filePath)
  const text = readText(absPath)
  const sourceFile = ts.createSourceFile(absPath, text, ts.ScriptTarget.Latest, true)
  const imports = []

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
    const specifier = statement.moduleSpecifier.text
    const resolved = resolveImport(specifier, filePath)
    if (!resolved) continue
    imports.push(resolved)
    importMap[filePath].push(resolved)
    const sourceNode = fileNodeByPath.get(filePath)
    const targetNode = fileNodeByPath.get(resolved)
    if (sourceNode && targetNode) pushEdge(sourceNode.id, targetNode.id, 'imports', 0.7)
  }

  const exportedSymbols = collectExportedSymbols(sourceFile)
  for (const symbol of exportedSymbols) {
    const symbolId = `${symbol.kind}:${filePath}:${symbol.name}`
    if (nodes.some((node) => node.id === symbolId)) continue
    const symbolNode = {
      id: symbolId,
      type: symbol.kind,
      name: symbol.name,
      filePath,
      summary: symbol.summary,
      tags: ['exported', filePath.includes('/app/') ? 'runtime' : 'application'],
    }
    nodes.push(symbolNode)
    pushEdge(fileNodeByPath.get(filePath).id, symbolId, 'contains', 1.0)
  }
}

const payloadConfigNode = fileNodeByPath.get('src/payload.config.ts')
if (payloadConfigNode) {
  for (const filePath of filteredFiles) {
    if (
      filePath.startsWith('src/collections/') ||
      filePath.startsWith('src/globals/') ||
      filePath.startsWith('src/plugins/')
    ) {
      const target = fileNodeByPath.get(filePath)
      if (target) pushEdge(payloadConfigNode.id, target.id, 'configures', 0.6)
    }
  }
}

const readmeNode = fileNodeByPath.get('README.md')
if (readmeNode && payloadConfigNode) pushEdge(readmeNode.id, payloadConfigNode.id, 'documents', 0.5)

for (const filePath of filteredFiles) {
  if (!filePath.startsWith('src/app/')) continue
  const sourceNode = fileNodeByPath.get(filePath)
  if (!sourceNode) continue

  if (filePath.endsWith('/route.ts')) {
    const submitFormNode = fileNodeByPath.get('src/collections/FormSubmissions.ts')
    if (submitFormNode) pushEdge(sourceNode.id, submitFormNode.id, 'routes', 0.5)
  }

  if (filePath.includes('/preview/')) {
    const pagesNode = fileNodeByPath.get('src/collections/Pages.ts')
    if (pagesNode) pushEdge(sourceNode.id, pagesNode.id, 'depends_on', 0.6)
  }
}

const layers = buildLayers(fileNodes)
const nodeMap = new Map(nodes.map((node) => [node.id, node]))
const tour = buildTour(nodeMap)

const graph = {
  version: '1.0.0',
  project: {
    name: projectInfo.name,
    languages: projectInfo.languages,
    frameworks: projectInfo.frameworks,
    description: projectInfo.description,
    analyzedAt: new Date().toISOString(),
    gitCommitHash: commitHash,
  },
  nodes,
  edges,
  layers,
  tour,
}

const review = validateGraph(graph)
const fingerprints = fileEntries.map((file) => {
  const text = readText(path.join(projectRoot, file.path))
  return {
    path: file.path,
    sha1: crypto.createHash('sha1').update(text).digest('hex'),
    sizeLines: file.sizeLines,
  }
})

const byCategory = fileEntries.reduce((acc, file) => {
  acc[file.fileCategory] = (acc[file.fileCategory] || 0) + 1
  return acc
}, {})

const scanResult = {
  projectName: projectInfo.name,
  description: projectInfo.description,
  languages: projectInfo.languages,
  frameworks: projectInfo.frameworks,
  files: fileEntries,
  totalFiles: fileEntries.length,
  filteredByIgnore: allTrackedFiles.length - fileEntries.length,
  estimatedComplexity:
    fileEntries.length > 300 ? 'large' : fileEntries.length > 150 ? 'moderate' : 'small',
  importMap,
  stats: {
    filesScanned: fileEntries.length,
    byCategory,
  },
}

writeJson(path.join(intermediateDir, 'scan-result.json'), scanResult)
writeJson(path.join(intermediateDir, 'assembled-graph.json'), graph)
writeJson(path.join(intermediateDir, 'review.json'), review)
writeJson(path.join(intermediateDir, 'fingerprint-input.json'), {
  projectRoot,
  sourceFilePaths: fileEntries.map((file) => file.path),
  gitCommitHash: commitHash,
})
writeJson(path.join(uaRoot, 'fingerprints-baseline.json'), {
  version: 'fallback-1',
  gitCommitHash: commitHash,
  generatedAt: graph.project.analyzedAt,
  fingerprints,
})
writeJson(path.join(uaRoot, 'knowledge-graph.json'), graph)
writeJson(path.join(uaRoot, 'meta.json'), {
  lastAnalyzedAt: graph.project.analyzedAt,
  gitCommitHash: commitHash,
  version: '1.0.0',
  analyzedFiles: fileEntries.length,
})

process.stdout.write(
  JSON.stringify(
    {
      project: graph.project,
      scan: {
        totalFiles: scanResult.totalFiles,
        filteredByIgnore: scanResult.filteredByIgnore,
        byCategory,
      },
      review,
    },
    null,
    2,
  ) + '\n',
)
