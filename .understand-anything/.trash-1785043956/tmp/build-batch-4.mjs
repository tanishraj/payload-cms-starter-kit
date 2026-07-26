import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, '.understand-anything')
const extraction = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'tmp/ua-file-extract-results-4.json'), 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'intermediate/batches.json'), 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 4)

if (!batch) throw new Error('Batch 4 is missing')

const fileMetadata = {
  'src/access/adminCapabilities.ts': {
    summary:
      'Defines the capability-based Payload admin authorization model, including capability fields, role defaults, access predicates, and UI visibility helpers.',
    tags: ['access-control', 'authorization', 'capabilities', 'payload-admin', 'security'],
  },
  'src/access/editorialRoles.ts': {
    summary:
      'Defines editorial role identities and their default capability profiles, with normalization for legacy and current role values.',
    tags: ['access-control', 'editorial-workflow', 'roles', 'capabilities'],
  },
  'src/app/(payload)/admin/[[...segments]]/not-found.tsx': {
    summary:
      'Adapts Payload’s generated admin not-found view and metadata to the Next.js catch-all admin route.',
    tags: ['route', 'payload-admin', 'not-found', 'adapter'],
  },
  'src/app/(payload)/admin/[[...segments]]/page.tsx': {
    summary:
      'Adapts Payload’s generated admin page and metadata to the Next.js catch-all admin route.',
    tags: ['route', 'payload-admin', 'server-component', 'adapter'],
  },
  'src/app/(payload)/admin/importMap.js': {
    summary:
      'Generated Payload admin import map connecting configured custom admin components to runtime module loaders.',
    tags: ['generated', 'payload-admin', 'import-map', 'configuration'],
  },
  'src/app/(payload)/api/[...slug]/route.ts': {
    summary:
      'Exposes Payload’s REST handlers through a Next.js catch-all API route for all supported HTTP methods.',
    tags: ['api-handler', 'payload-api', 'rest', 'route'],
  },
  'src/app/(payload)/api/graphql-playground/route.ts': {
    summary:
      'Exposes Payload’s GraphQL Playground handler through a dedicated Next.js route.',
    tags: ['api-handler', 'graphql', 'developer-tools', 'payload-api'],
  },
  'src/app/(payload)/api/graphql/route.ts': {
    summary:
      'Exposes Payload’s GraphQL POST and OPTIONS handlers through the Next.js App Router.',
    tags: ['api-handler', 'graphql', 'payload-api', 'route'],
  },
  'src/app/(payload)/layout.tsx': {
    summary:
      'Root layout for Payload’s admin and API route group, wiring generated imports, server functions, metadata, and custom admin styling.',
    tags: ['layout', 'payload-admin', 'server-component', 'configuration'],
  },
  'src/app/my-route/route.ts': {
    summary:
      'Small custom API route demonstrating direct access to the initialized Payload instance.',
    tags: ['api-handler', 'payload-api', 'example', 'route'],
  },
  'src/blocks/HeaderNavbar12/LogoHeightField.tsx': {
    summary:
      'Custom Payload admin field that synchronizes header logo-height controls with sibling field state.',
    tags: ['component', 'payload-admin', 'custom-field', 'form-control'],
  },
  'src/collections/Articles.ts': {
    summary:
      'Payload collection schema for editorial articles, combining rich content, media, taxonomy, SEO, drafts, access controls, audit logging, and workflow hooks.',
    tags: ['data-model', 'payload-collection', 'articles', 'editorial-workflow', 'seo'],
  },
  'src/collections/Categories.ts': {
    summary:
      'Payload taxonomy collection for categories with managed slugs, SEO fields, public-read rules, and capability-gated editing.',
    tags: ['data-model', 'payload-collection', 'taxonomy', 'seo'],
  },
  'src/collections/Footers.ts': {
    summary:
      'Payload collection for reusable footer configurations built from the approved footer block and synchronized into editorial workflow.',
    tags: ['data-model', 'payload-collection', 'footer', 'editorial-workflow'],
  },
  'src/collections/FormSubmissions.ts': {
    summary:
      'Operational Payload collection for captured form submissions, review promotion state, attribution, assignees, and activity/work-queue synchronization.',
    tags: ['data-model', 'payload-collection', 'forms', 'work-queue', 'operations'],
  },
  'src/collections/Forms.ts': {
    summary:
      'Payload form-builder collection defining validated field schemas, submission intents, notification recipients, and public form configuration.',
    tags: ['data-model', 'payload-collection', 'forms', 'validation'],
  },
  'src/collections/Headers.ts': {
    summary:
      'Payload collection for reusable header configurations built from the approved navbar block and synchronized into editorial workflow.',
    tags: ['data-model', 'payload-collection', 'header', 'editorial-workflow'],
  },
  'src/collections/Media.ts': {
    summary:
      'Governed Payload media library with image processing, focal-point controls, usage reporting, deletion safeguards, work-queue sync, and audit logging.',
    tags: ['data-model', 'payload-collection', 'media', 'governance', 'audit'],
  },
  'src/collections/NavigationLinks.ts': {
    summary:
      'Payload collection for reusable internal and external navigation links with validation, ordering, and editorial workflow support.',
    tags: ['data-model', 'payload-collection', 'navigation', 'editorial-workflow'],
  },
  'src/collections/NewsEvents.ts': {
    summary:
      'Unified Payload collection for news and event entries with event validation, taxonomy, content actions, SEO, drafts, audit, and editorial workflow.',
    tags: ['data-model', 'payload-collection', 'news-events', 'editorial-workflow', 'seo'],
  },
  'src/collections/OperationalAuditEvents.ts': {
    summary:
      'Read-focused Payload collection storing operational audit events for privileged administrative inspection.',
    tags: ['data-model', 'payload-collection', 'audit', 'operations', 'security'],
  },
  'src/collections/Redirects.ts': {
    summary:
      'Payload collection for managed redirects with normalized source paths, validated destinations, ordering, and workflow synchronization.',
    tags: ['data-model', 'payload-collection', 'redirects', 'routing', 'validation'],
  },
  'src/collections/Reviews.ts': {
    summary:
      'Payload collection for moderated reviews with ratings, reviewer attribution, taxonomy, SEO, drafts, audit logging, and work-queue synchronization.',
    tags: ['data-model', 'payload-collection', 'reviews', 'moderation', 'seo'],
  },
  'src/collections/SystemPages.ts': {
    summary:
      'Payload collection for managed 404, maintenance, and coming-soon pages with constrained block layouts, SEO, references, drafts, and workflow safeguards.',
    tags: ['data-model', 'payload-collection', 'system-pages', 'editorial-workflow', 'seo'],
  },
  'src/collections/Tags.ts': {
    summary:
      'Payload taxonomy collection for tags with managed slugs, SEO fields, public-read rules, and capability-gated editing.',
    tags: ['data-model', 'payload-collection', 'taxonomy', 'seo'],
  },
  'src/collections/Users.ts': {
    summary:
      'Authenticated Payload user collection implementing editorial roles, per-user capability overrides, protected access fields, and administrative read controls.',
    tags: ['data-model', 'payload-collection', 'authentication', 'authorization', 'users'],
  },
}

const humanize = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

const functionSummary = (name) => {
  const subject = humanize(name)
  const exact = {
    GET: 'Handles the custom GET route using the initialized Payload API.',
    LogoHeightField:
      'Renders and synchronizes the custom Payload admin control for header logo height.',
    adminOnlyAccess: 'Allows access only to authenticated users with the administrator role.',
    adminOrFirstUserAccess:
      'Allows administrators while preserving Payload’s first-user bootstrap flow.',
    allAdminCapabilities:
      'Determines whether every supported administrative capability is enabled.',
    beforeValidate: 'Normalizes collection input before Payload validates and persists it.',
    generateMetadata: 'Returns metadata for the generated Payload admin route.',
    getCapabilitiesForRole:
      'Resolves the effective capability set for a normalized editorial role.',
    hasAdminCapability:
      'Checks whether the current authenticated user has a specific administrative capability.',
    populateMediaUsage:
      'Populates derived media-usage details for administrative visibility.',
    recordMediaDeletionAudit:
      'Records an operational audit event when a governed media asset is deleted.',
    requireCapability:
      'Creates a Payload access predicate requiring one or more administrative capabilities.',
    sanitizeAdminCapabilities:
      'Filters arbitrary capability input down to recognized boolean capability values.',
    validateSystemLayout:
      'Ensures a system page uses only the block type permitted for its selected system-page role.',
    withCapabilities:
      'Builds a complete role capability profile from explicit enabled capability keys.',
  }
  if (exact[name]) return exact[name]
  if (name.startsWith('validate')) {
    return `Validates ${subject.replace(/^validate /, '')} against this collection’s business rules.`
  }
  if (name.startsWith('normalize')) {
    return `Normalizes ${subject.replace(/^normalize /, '')} into its canonical stored representation.`
  }
  if (name.startsWith('to')) {
    return `Transforms ${subject.replace(/^to /, '')} into the access model’s normalized representation.`
  }
  if (name.startsWith('create')) {
    return `Creates ${subject.replace(/^create /, '')} for the Payload admin configuration.`
  }
  if (name.startsWith('get')) {
    return `Resolves ${subject.replace(/^get /, '')} from the active role or capability definition.`
  }
  if (name.startsWith('is')) {
    return `Determines whether ${subject.replace(/^is /, '')} satisfies the access model.`
  }
  if (name.startsWith('can')) {
    return `Checks whether the current user can ${subject.replace(/^can /, '')}.`
  }
  if (name.startsWith('allow')) {
    return `Creates an access predicate that ${subject.replace(/^allow /, 'allows ')}.`
  }
  if (name.startsWith('hide')) {
    return `Controls admin UI visibility by ${subject}.`
  }
  if (name.startsWith('show')) {
    return `Controls admin UI visibility by ${subject}.`
  }
  if (name.startsWith('requires')) {
    return `Determines whether ${subject.replace(/^requires /, '')} is required for the current user.`
  }
  return `Implements ${subject} for the collection or authorization workflow.`
}

const functionTags = (name, filePath) => {
  const tags = ['function']
  if (filePath.startsWith('src/access/')) tags.push('access-control')
  else if (filePath.includes('/collections/')) tags.push('payload-hook')
  else if (filePath.endsWith('.tsx')) tags.push('component')
  else tags.push('api-handler')

  if (/validate|is[A-Z]|can[A-Z]|allow|require|adminOnly/i.test(name)) tags.push('validation')
  else if (/normalize|sanitize|to[A-Z]/.test(name)) tags.push('normalization')
  else if (/create|get[A-Z]/.test(name)) tags.push('factory')
  else if (/record|populate|beforeValidate/.test(name)) tags.push('lifecycle')
  else tags.push('workflow')
  return [...new Set(tags)].slice(0, 5)
}

const complexityForLines = (lines) => {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

const nodes = []
const edges = []
const resultByPath = new Map(extraction.results.map((result) => [result.path, result]))

for (const batchFile of batch.files) {
  const result = resultByPath.get(batchFile.path)
  if (!result) throw new Error(`Missing extraction result for ${batchFile.path}`)
  const metadata = fileMetadata[batchFile.path]
  if (!metadata) throw new Error(`Missing semantic metadata for ${batchFile.path}`)

  const fileId = `file:${batchFile.path}`
  const isCollection = batchFile.path.startsWith('src/collections/')
  nodes.push({
    id: fileId,
    type: 'file',
    name: path.posix.basename(batchFile.path),
    filePath: batchFile.path,
    summary: metadata.summary,
    tags: metadata.tags,
    complexity: complexityForLines(result.nonEmptyLines),
    ...(isCollection
      ? {
          languageNotes:
            'Uses Payload CollectionConfig declarations to compose fields, access policies, hooks, admin metadata, and versioning.',
        }
      : {}),
  })

  const exportedNames = new Set((result.exports ?? []).map((entry) => entry.name))
  const significantFunctions = (result.functions ?? []).filter(
    (fn) => exportedNames.has(fn.name) || fn.endLine - fn.startLine + 1 >= 10,
  )

  for (const fn of significantFunctions) {
    const functionId = `function:${batchFile.path}:${fn.name}`
    nodes.push({
      id: functionId,
      type: 'function',
      name: fn.name,
      filePath: batchFile.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: functionSummary(fn.name),
      tags: functionTags(fn.name, batchFile.path),
      complexity: complexityForLines(fn.endLine - fn.startLine + 1),
    })
    edges.push({
      source: fileId,
      target: functionId,
      type: 'contains',
      direction: 'forward',
      weight: 1,
    })
    if (exportedNames.has(fn.name)) {
      edges.push({
        source: fileId,
        target: functionId,
        type: 'exports',
        direction: 'forward',
        weight: 0.8,
      })
    }
  }

  for (const importedPath of batch.batchImportData[batchFile.path] ?? []) {
    edges.push({
      source: fileId,
      target: `file:${importedPath}`,
      type: 'imports',
      direction: 'forward',
      weight: 0.7,
    })
  }
}

const nodeCount = nodes.length
const edgeCount = edges.length
const parts = Math.ceil(Math.max(nodeCount / 60, edgeCount / 120))
if (parts <= 1) throw new Error('Expected batch 4 to require multipart output')

const sortedFiles = [...batch.files].sort((a, b) => a.path.localeCompare(b.path))
const chunkSize = Math.ceil(sortedFiles.length / parts)
const nodeIds = new Set(nodes.map((node) => node.id))

for (let partIndex = 0; partIndex < parts; partIndex += 1) {
  const filePaths = new Set(
    sortedFiles
      .slice(partIndex * chunkSize, (partIndex + 1) * chunkSize)
      .map((entry) => entry.path),
  )
  const partNodes = nodes.filter((node) => filePaths.has(node.filePath))
  const partNodeIds = new Set(partNodes.map((node) => node.id))
  const partEdges = edges.filter((edge) => partNodeIds.has(edge.source))

  for (const edge of partEdges) {
    if (!nodeIds.has(edge.source)) throw new Error(`Unknown source ${edge.source}`)
    const validTarget =
      partNodeIds.has(edge.target) ||
      (edge.type === 'imports' &&
        edge.target.startsWith('file:') &&
        (batch.batchImportData[edge.source.slice('file:'.length)] ?? []).includes(
          edge.target.slice('file:'.length),
        ))
    if (!validTarget) {
      throw new Error(`Part ${partIndex + 1} has invalid edge target ${edge.target}`)
    }
  }

  fs.writeFileSync(
    path.join(dataDir, `intermediate/batch-4-part-${partIndex + 1}.json`),
    `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`,
  )
}

console.log(JSON.stringify({ parts, nodeCount, edgeCount }))
