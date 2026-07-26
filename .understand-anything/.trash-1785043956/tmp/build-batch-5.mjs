import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, '.understand-anything')
const extraction = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'tmp/ua-file-extract-results-5.json'), 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'intermediate/batches.json'), 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 5)

if (!batch) throw new Error('Batch 5 is missing')

const fileMetadata = {
  'src/collections/WorkQueue.ts': {
    summary:
      'Payload collection for editorial and operational work items, including source references, ownership, priorities, statuses, due dates, deduplication, and audit-aware lifecycle hooks.',
    tags: ['data-model', 'payload-collection', 'work-queue', 'editorial-workflow', 'operations'],
  },
  'src/config/providers.ts': {
    summary:
      'Constructs Payload database, email, and media-storage providers from the validated runtime configuration.',
    tags: ['configuration', 'factory', 'providers', 'payload', 'infrastructure'],
  },
  'src/config/runtime.ts': {
    summary:
      'Parses and validates environment variables into a typed runtime profile covering MongoDB, email, media storage, deployment context, and public URLs.',
    tags: ['configuration', 'environment', 'validation', 'runtime'],
  },
  'src/config/starterContract.ts': {
    summary:
      'Exposes and enforces the supported deployment contract for database, email, media, and hosting combinations.',
    tags: ['configuration', 'validation', 'deployment', 'starter-contract'],
  },
  'src/fields/buildSEOFields.ts': {
    summary:
      'Builds the reusable Payload field group for titles, descriptions, canonical URLs, Open Graph data, robots policy, and sitemap inclusion.',
    tags: ['factory', 'payload-fields', 'seo', 'schema-definition'],
  },
  'src/globals/NewsEventsSettings.ts': {
    summary:
      'Payload global configuring news and events archive metadata, highlight behavior, pagination, labels, and visual appearance.',
    tags: ['data-model', 'payload-global', 'news-events', 'configuration', 'seo'],
  },
  'src/globals/PageSettings.ts': {
    summary:
      'Payload global governing the published front page, announcement banner content and timing, page defaults, appearance, and related operational audits.',
    tags: ['data-model', 'payload-global', 'page-settings', 'announcement', 'governance'],
  },
  'src/globals/SEOSettings.ts': {
    summary:
      'Payload global providing site-wide SEO defaults for metadata, social previews, robots behavior, and sitemap policy.',
    tags: ['data-model', 'payload-global', 'seo', 'configuration'],
  },
  'src/globals/SiteSettings.ts': {
    summary:
      'Payload global for public site identity and contact details, including branding, logos, organization information, and validated social links.',
    tags: ['data-model', 'payload-global', 'branding', 'configuration'],
  },
  'src/globals/SystemModeSettings.ts': {
    summary:
      'Payload global controlling live, maintenance, and coming-soon modes and validating the managed system pages assigned to each mode.',
    tags: ['data-model', 'payload-global', 'system-mode', 'validation', 'operations'],
  },
  'src/globals/ThemeSettings.ts': {
    summary:
      'Payload global selecting the active website theme from the starter’s registered theme catalog.',
    tags: ['data-model', 'payload-global', 'theme', 'configuration'],
  },
  'src/hooks/enforceEditorialWorkflow.ts': {
    summary:
      'Before-change hook that enforces editorial state transitions, publication capabilities, reviewer assignments, and blocking work-queue conditions.',
    tags: ['payload-hook', 'editorial-workflow', 'authorization', 'validation', 'work-queue'],
  },
  'src/hooks/logOperationalAuditEvent.ts': {
    summary:
      'Factories for collection and global hooks that record successful create, update, and delete operations in the audit log.',
    tags: ['payload-hook', 'factory', 'audit', 'operations'],
  },
  'src/hooks/normalizeNewsEventFields.ts': {
    summary:
      'Before-validation hook that clears event-only fields when an entry is authored as news content.',
    tags: ['payload-hook', 'news-events', 'normalization', 'validation'],
  },
  'src/hooks/preventMediaDeletionWhileInUse.ts': {
    summary:
      'Before-delete hook that blocks removal of media assets still referenced by managed content and reports their usage locations.',
    tags: ['payload-hook', 'media', 'referential-integrity', 'validation'],
  },
  'src/hooks/preventReferencedSystemPageInvalidation.ts': {
    summary:
      'Protects system pages referenced by active system behavior from deletion, unpublishing, or incompatible type changes.',
    tags: ['payload-hook', 'system-pages', 'referential-integrity', 'validation'],
  },
  'src/hooks/syncFormSubmissionToWorkQueue.ts': {
    summary:
      'Synchronizes form submissions into the operational work queue, reflecting status, owner, priority, and submission context.',
    tags: ['payload-hook', 'forms', 'work-queue', 'synchronization'],
  },
  'src/hooks/syncMediaToWorkQueue.ts': {
    summary:
      'Synchronizes incomplete or governance-sensitive media records into the operational work queue and resolves completed items.',
    tags: ['payload-hook', 'media', 'work-queue', 'synchronization'],
  },
  'src/hooks/syncPrimaryCategoryMembership.ts': {
    summary:
      'Keeps the selected primary taxonomy category included in the broader category relationship list before persistence.',
    tags: ['payload-hook', 'taxonomy', 'normalization', 'referential-integrity'],
  },
  'src/hooks/syncReviewToWorkQueue.ts': {
    summary:
      'Synchronizes moderated review records into the operational work queue according to review status and ownership.',
    tags: ['payload-hook', 'reviews', 'work-queue', 'synchronization'],
  },
  'src/hooks/syncWorkQueueItem.ts': {
    summary:
      'Defines request-context guards used to prevent recursive work-queue synchronization hooks.',
    tags: ['payload-hook', 'work-queue', 'recursion-guard', 'utility'],
  },
  'src/hooks/syncWorkflowStateToWorkQueue.ts': {
    summary:
      'Builds reusable after-change hooks that synchronize editorial review and draft-publication states with deduplicated work-queue items.',
    tags: ['payload-hook', 'factory', 'editorial-workflow', 'work-queue', 'synchronization'],
  },
  'src/hooks/updateFormSubmissionActivity.ts': {
    summary:
      'Before-change hook that normalizes form-submission ownership and notes while updating the last-activity timestamp.',
    tags: ['payload-hook', 'forms', 'normalization', 'activity-tracking'],
  },
  'src/hooks/validateSEOContract.ts': {
    summary:
      'Before-validation hook enforcing SEO field combinations for canonical URLs, robots indexing, and sitemap inclusion.',
    tags: ['payload-hook', 'seo', 'validation', 'governance'],
  },
  'src/lib/cmsSession.ts': {
    summary:
      'Cached server-side helpers for resolving the current Payload CMS user, administrator state, and human-readable role labels.',
    tags: ['service', 'authentication', 'payload', 'cache', 'authorization'],
  },
  'src/lib/editorialWorkflow.ts': {
    summary:
      'Declares the canonical editorial workflow states and labels shared across governed Payload collections.',
    tags: ['type-definition', 'editorial-workflow', 'configuration', 'data-model'],
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
    assertSupportedStarterContract:
      'Fails fast when the configured provider combination falls outside the starter’s supported deployment contract.',
    buildSEOFields:
      'Constructs the reusable Payload SEO field group with configurable overrides.',
    canPublish:
      'Checks whether the acting user has the publication capability required by the current collection.',
    createDatabaseAdapter:
      'Creates the configured MongoDB adapter for Payload.',
    createDraftPublishQueueHook:
      'Creates a hook that tracks draft publication work in the shared work queue.',
    createEmailAdapter:
      'Creates the configured Resend email adapter or leaves email delivery disabled.',
    createStoragePlugins:
      'Creates the configured S3 storage plugin set or preserves local media storage.',
    createWorkflowQueueHook:
      'Creates a hook that mirrors editorial workflow states into deduplicated queue items.',
    enforceEditorialWorkflow:
      'Validates and normalizes editorial transitions, publication rights, reviewer assignments, and queue blockers.',
    getRuntimeConfig:
      'Returns the fully validated runtime configuration derived from process environment variables.',
    getStarterContract:
      'Returns the normalized database, email, media, and hosting contract for this deployment.',
    normalizeNewsEventFields:
      'Clears event-specific values when the content entry is configured as news.',
    preventMediaDeletionWhileInUse:
      'Rejects deletion when a media asset still has managed-content references.',
    preventReferencedSystemPageInvalidation:
      'Rejects changes that would invalidate a system page currently used by site behavior.',
    syncFormSubmissionToWorkQueue:
      'Creates, updates, or resolves the queue item associated with a form submission.',
    syncMediaToWorkQueue:
      'Creates, updates, or resolves the governance queue item associated with a media asset.',
    syncPrimaryCategoryMembership:
      'Ensures the primary category is also present in the complete category relationship list.',
    syncReviewToWorkQueue:
      'Creates, updates, or resolves the moderation queue item associated with a review.',
    updateFormSubmissionActivity:
      'Normalizes mutable activity fields and refreshes the form submission’s activity timestamp.',
    validateSEOContract:
      'Validates robots, canonical URL, and sitemap settings as one consistent SEO contract.',
    withWorkQueueSyncContext:
      'Marks a request context as an internal work-queue synchronization operation.',
  }
  if (exact[name]) return exact[name]
  if (name.startsWith('validate')) {
    return `Validates ${subject.replace(/^validate /, '')} against the global or workflow contract.`
  }
  if (name.startsWith('normalize')) {
    return `Normalizes ${subject.replace(/^normalize /, '')} into its canonical stored representation.`
  }
  if (name.startsWith('resolve')) {
    return `Resolves ${subject.replace(/^resolve /, '')} from the current document and request context.`
  }
  if (name.startsWith('extract')) {
    return `Extracts ${subject.replace(/^extract /, '')} from a Payload relationship value.`
  }
  if (name.startsWith('get')) {
    return `Resolves ${subject.replace(/^get /, '')} for the current runtime or managed record.`
  }
  if (name.startsWith('create')) {
    return `Creates ${subject.replace(/^create /, '')} for the Payload configuration or lifecycle.`
  }
  if (name.startsWith('is')) {
    return `Determines whether ${subject.replace(/^is /, '')} matches the expected contract.`
  }
  if (name.startsWith('format')) {
    return `Formats ${subject.replace(/^format /, '')} for administrative display.`
  }
  return `Implements ${subject} for the project’s managed-content lifecycle.`
}

const functionTags = (name, filePath) => {
  const tags = ['function']
  if (filePath.startsWith('src/hooks/')) tags.push('payload-hook')
  else if (filePath.startsWith('src/globals/')) tags.push('payload-global')
  else if (filePath.startsWith('src/config/')) tags.push('configuration')
  else tags.push('utility')

  if (/validate|assert|prevent|is[A-Z]|can[A-Z]/.test(name)) tags.push('validation')
  else if (/normalize|resolve|extract|format/.test(name)) tags.push('normalization')
  else if (/sync|update|enforce/.test(name)) tags.push('synchronization')
  else if (/create|build|get[A-Z]/.test(name)) tags.push('factory')
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
  const isPayloadSchema =
    batchFile.path.startsWith('src/collections/') ||
    batchFile.path.startsWith('src/globals/') ||
    batchFile.path.startsWith('src/fields/')
  nodes.push({
    id: fileId,
    type: 'file',
    name: path.posix.basename(batchFile.path),
    filePath: batchFile.path,
    summary: metadata.summary,
    tags: metadata.tags,
    complexity: complexityForLines(result.nonEmptyLines),
    ...(isPayloadSchema
      ? {
          languageNotes:
            'Uses declarative Payload configuration objects to compose fields, access policies, hooks, and admin metadata.',
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
if (parts <= 1) throw new Error('Expected batch 5 to require multipart output')

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
    path.join(dataDir, `intermediate/batch-5-part-${partIndex + 1}.json`),
    `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`,
  )
}

console.log(JSON.stringify({ parts, nodeCount, edgeCount }))
