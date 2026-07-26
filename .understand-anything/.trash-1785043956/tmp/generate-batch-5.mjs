import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const extraction = JSON.parse(
  fs.readFileSync(path.join(root, '.understand-anything/tmp/ua-file-extract-results-5.json'), 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync(path.join(root, '.understand-anything/intermediate/batches.json'), 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 5)

if (!batch || !extraction.scriptCompleted) {
  throw new Error('Batch 5 inputs are incomplete')
}

const summaries = {
  'src/collections/WorkQueue.ts':
    'Defines the operational work-queue collection, including queue metadata, lifecycle controls, admin presentation, access rules, and audit hooks.',
  'src/config/providers.ts':
    'Builds the database, email, and media-storage adapters selected by validated runtime configuration.',
  'src/config/runtime.ts':
    'Validates environment variables and produces the normalized database, deployment, email, and media runtime configuration.',
  'src/config/starterContract.ts':
    'Exposes and validates the starter-kit contract version used to guard compatibility at application startup.',
  'src/fields/buildSEOFields.ts':
    'Builds the reusable Payload field group for canonical URLs, robots directives, sitemap inclusion, and social metadata.',
  'src/globals/NewsEventsSettings.ts':
    'Defines global defaults for news and event presentation, SEO behavior, and appearance with capability-gated administration.',
  'src/globals/PageSettings.ts':
    'Defines site-wide page defaults, homepage selection, announcement behavior, appearance fields, validation, and operational auditing.',
  'src/globals/SEOSettings.ts':
    'Defines global SEO defaults and access rules used to control indexing and metadata behavior across public content.',
  'src/globals/SiteSettings.ts':
    'Defines public site identity, contact, social-link, and footer settings with URL validation and capability-based access.',
  'src/globals/SystemModeSettings.ts':
    'Defines system-mode configuration and validates that maintenance, not-found, and search references point to published pages of the required type.',
  'src/globals/ThemeSettings.ts':
    'Defines the global website theme selector using the supported theme registry and capability-gated access.',
  'src/hooks/enforceEditorialWorkflow.ts':
    'Creates a before-change hook that enforces editorial states, publisher permissions, scheduling requirements, audit metadata, and blocking work-queue conditions.',
  'src/hooks/logOperationalAuditEvent.ts':
    'Provides collection and global after-change hook factories that record normalized operational audit events.',
  'src/hooks/normalizeNewsEventFields.ts':
    'Normalizes news and event documents so fields that do not apply to the selected content type are cleared before persistence.',
  'src/hooks/preventMediaDeletionWhileInUse.ts':
    'Blocks deletion of media that is still referenced and reports the referencing locations to the administrator.',
  'src/hooks/preventReferencedSystemPageInvalidation.ts':
    'Prevents system pages from being deleted, unpublished, or retagged while global behavior settings still reference them.',
  'src/hooks/syncFormSubmissionToWorkQueue.ts':
    'Synchronizes actionable form-submission states into deduplicated operational work-queue conditions.',
  'src/hooks/syncMediaToWorkQueue.ts':
    'Synchronizes media review, replacement, and metadata issues into deduplicated operational work-queue conditions.',
  'src/hooks/syncPrimaryCategoryMembership.ts':
    'Normalizes relationship identifiers and ensures a selected primary category is included in the complete category membership list.',
  'src/hooks/syncReviewToWorkQueue.ts':
    'Synchronizes moderation and publication issues from review records into the operational work queue.',
  'src/hooks/syncWorkQueueItem.ts':
    'Provides a request-context marker that prevents recursive work-queue synchronization while queue items are being updated.',
  'src/hooks/syncWorkflowStateToWorkQueue.ts':
    'Builds reusable after-change hooks that translate editorial workflow or draft-publication states into work-queue conditions.',
  'src/hooks/updateFormSubmissionActivity.ts':
    'Tracks form-submission activity timestamps when ownership or internal notes change.',
  'src/hooks/validateSEOContract.ts':
    'Creates an SEO validation hook that normalizes canonical URLs and rejects robots settings that conflict with public-route requirements.',
  'src/lib/cmsSession.ts':
    'Provides server-side helpers for resolving the current Payload CMS user, checking administrator status, and formatting role labels.',
  'src/lib/editorialWorkflow.ts':
    'Declares the canonical editorial workflow states and their labels for reuse by collections, hooks, and admin controls.',
}

const functionSummaries = {
  createDatabaseAdapter: 'Creates the configured Payload database adapter.',
  createEmailAdapter: 'Creates the configured email adapter, falling back to console delivery when email is disabled.',
  createStoragePlugins: 'Creates media-storage plugins for the selected local or S3 provider.',
  parseBooleanEnv: 'Parses a boolean environment value with an explicit default and rejects unsupported spellings.',
  getMediaProvider: 'Validates and returns the configured media provider.',
  getRuntimeConfig: 'Validates environment variables and returns a normalized runtime configuration.',
  getStarterContract: 'Builds the public starter-kit compatibility contract from runtime configuration.',
  assertSupportedStarterContract: 'Rejects startup when the configured starter contract version is unsupported.',
  buildSEOFields: 'Builds the reusable set of Payload SEO fields.',
  extractPageID: 'Normalizes a page relationship value to its scalar identifier.',
  validatePublishedFrontPage: 'Ensures the configured homepage references a published page.',
  validateAnnouncementInterval: 'Validates rotation timing for enabled non-marquee announcements.',
  validateAnnouncementMarqueeDuration: 'Validates the duration of enabled marquee announcements.',
  validateAnnouncementItems: 'Requires at least one meaningful announcement item when announcements are enabled.',
  validateExternalSocialUrl: 'Validates that a social link uses an allowed external HTTP URL.',
  validatePublishedSystemPageType: 'Validates that a referenced system page is published and has the required behavioral type.',
  pageOfTypeFilter: 'Builds a Payload relationship filter for published pages of a specific system type.',
  canPublish: 'Routes a publish-capability check to the appropriate collection-specific authorization helper.',
  normalizeUserID: 'Normalizes a Payload user identifier to a finite number.',
  resolveWorkflowState: 'Derives the next workflow state when editorial workflow enforcement is active.',
  resolveBypassedWorkflowState: 'Derives a simplified draft or published state when workflow enforcement is bypassed.',
  enforceEditorialWorkflow: 'Creates a before-change hook that validates and applies editorial transitions and publication metadata.',
  createCollectionAuditHook: 'Creates a collection hook that records an operational audit event after a change.',
  createGlobalAuditHook: 'Creates a global hook that records an operational audit event after a change.',
  normalizeNewsEventFields: 'Clears fields that do not apply to the selected news-or-event record type.',
  preventMediaDeletionWhileInUse: 'Rejects media deletion when references to the asset still exist.',
  getSystemPageID: 'Normalizes a system-page relationship to its scalar identifier.',
  getSystemBehaviorUsage: 'Finds global behavior settings that reference a given system page.',
  preventReferencedSystemPageInvalidation: 'Rejects changes that would invalidate a system page still used by global settings.',
  syncFormSubmissionToWorkQueue: 'Maps a form submission to the currently active work-queue condition.',
  syncMediaToWorkQueue: 'Maps media health and review states to active work-queue conditions.',
  toRelationshipID: 'Normalizes a relationship value to its scalar identifier.',
  syncPrimaryCategoryMembership: 'Ensures primary-category membership is reflected in the category list.',
  syncReviewToWorkQueue: 'Maps a review record to the currently active moderation work-queue condition.',
  isWorkQueueSyncContext: 'Checks whether the request context marks an internal work-queue synchronization.',
  withWorkQueueSyncContext: 'Returns request context marked as an internal work-queue synchronization.',
  createWorkflowQueueHook: 'Creates a hook that maps configured editorial states to work-queue conditions.',
  createDraftPublishQueueHook: 'Creates a hook that tracks unpublished draft changes as a publication issue.',
  normalizeOwnerID: 'Normalizes a form-submission owner relationship to a finite numeric identifier.',
  updateFormSubmissionActivity: 'Updates the activity timestamp when assignment or notes change.',
  validateSEOContract: 'Creates a validation hook for canonical URL and robots-policy consistency.',
  formatCMSRoleLabel: 'Formats a CMS role identifier as a human-readable label.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function fileTags(file) {
  const p = file.path
  if (p.includes('/collections/')) return ['data-model', 'work-queue', 'payload-cms', 'operational-audit']
  if (p.includes('/globals/')) return ['configuration', 'payload-global', 'access-control', 'admin-settings']
  if (p.includes('/config/')) return ['configuration', 'runtime', 'provider-factory']
  if (p.includes('/fields/')) return ['field-builder', 'seo', 'payload-cms']
  if (p.includes('/hooks/')) {
    if (p.includes('WorkQueue') || p.includes('Workflow')) return ['hook', 'work-queue', 'editorial-workflow']
    if (p.includes('SEO')) return ['hook', 'validation', 'seo']
    return ['hook', 'validation', 'payload-cms']
  }
  return ['utility', 'cms', 'type-definition']
}

function functionTags(name) {
  if (name.startsWith('validate') || name.startsWith('assert')) return ['validation', 'hook', 'business-rule']
  if (name.startsWith('create') || name.startsWith('build')) return ['factory', 'payload-cms', 'configuration']
  if (name.startsWith('sync')) return ['hook', 'synchronization', 'work-queue']
  if (name.startsWith('normalize') || name.startsWith('resolve') || name.startsWith('extract'))
    return ['utility', 'normalization', 'data-transform']
  if (name.startsWith('prevent') || name === 'enforceEditorialWorkflow')
    return ['hook', 'validation', 'access-control']
  return ['utility', 'cms', 'business-logic']
}

const nodes = []
const edges = []

for (const file of extraction.results) {
  const fileID = `file:${file.path}`
  nodes.push({
    id: fileID,
    type: 'file',
    name: path.basename(file.path),
    filePath: file.path,
    summary: summaries[file.path],
    tags: fileTags(file),
    complexity: complexity(file.nonEmptyLines),
    languageNotes:
      file.path === 'src/config/runtime.ts'
        ? 'Uses a discriminated union to make local-disk and S3 media configuration mutually exclusive.'
        : undefined,
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
      summary: functionSummaries[fn.name] ?? `Implements the ${fn.name} operation for this module.`,
      tags: functionTags(fn.name),
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

for (const node of nodes) {
  if (node.languageNotes === undefined) delete node.languageNotes
}

const sortedPaths = extraction.results.map((file) => file.path).sort()
const pathGroups = [sortedPaths.slice(0, 13), sortedPaths.slice(13)]

for (const [index, paths] of pathGroups.entries()) {
  const pathSet = new Set(paths)
  const partNodes = nodes.filter((node) => pathSet.has(node.filePath))
  const nodeIDs = new Set(partNodes.map((node) => node.id))
  const partEdges = edges.filter((edge) => nodeIDs.has(edge.source))
  const output = { nodes: partNodes, edges: partEdges }

  fs.writeFileSync(
    path.join(root, `.understand-anything/intermediate/batch-5-part-${index + 1}.json`),
    `${JSON.stringify(output, null, 2)}\n`,
  )
}
