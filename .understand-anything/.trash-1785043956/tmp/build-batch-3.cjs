const fs = require('fs')
const path = require('path')

const root = '/Users/tanishraj/Tanishraj/Personal Projects/payload-cms-starter-kit'
const ua = path.join(root, '.understand-anything')
const input = JSON.parse(fs.readFileSync(path.join(ua, 'tmp/ua-file-analyzer-input-3.json'), 'utf8'))
const extraction = JSON.parse(fs.readFileSync(path.join(ua, 'tmp/ua-file-extract-results-3.json'), 'utf8'))

const fileMeta = {
  'src/app/(frontend)/PageContent.tsx': {
    summary: 'Normalizes a CMS page’s block payload and delegates rendering to the project’s page-block renderer.',
    tags: ['component', 'page-rendering', 'payload-cms'],
  },
  'src/app/(frontend)/SystemFallbackPage.tsx': {
    summary: 'Provides built-in maintenance, coming-soon, and not-found screens when no managed system page is available.',
    tags: ['component', 'fallback-ui', 'system-page'],
  },
  'src/app/(frontend)/[...slug]/page.tsx': {
    summary: 'Handles nested CMS routes, system-mode overrides, homepage canonicalization, configured redirects, metadata, and 404 behavior.',
    tags: ['route-handler', 'nextjs', 'page-rendering', 'redirects'],
  },
  'src/app/(frontend)/not-found.tsx': {
    summary: 'Renders a managed 404 page when configured and falls back to the built-in not-found presentation.',
    tags: ['route-handler', 'not-found', 'system-page'],
  },
  'src/app/(frontend)/page.tsx': {
    summary: 'Serves the configured homepage, applying system-mode fallbacks before rendering CMS-managed content.',
    tags: ['route-handler', 'homepage', 'nextjs'],
  },
  'src/app/(frontend)/pageData.ts': {
    summary: 'Centralizes server-side Payload queries and metadata assembly for published pages, the homepage, and managed system pages.',
    tags: ['data-access', 'payload-cms', 'metadata', 'server-rendering'],
  },
  'src/blocks/RenderBlocks.tsx': {
    summary: 'Filters renderable Payload blocks and dispatches them through the shared page-block stack and block renderer.',
    tags: ['component', 'block-renderer', 'payload-cms'],
  },
  'src/blocks/System404/Component.tsx': {
    summary: 'Adapts a System 404 Payload block into the dedicated not-found view, resolving CMS-authored actions first.',
    tags: ['component', 'payload-block', 'system-page'],
  },
  'src/blocks/SystemComingSoon/Component.tsx': {
    summary: 'Adapts a System Coming Soon Payload block into the dedicated coming-soon view with resolved actions.',
    tags: ['component', 'payload-block', 'system-page'],
  },
  'src/blocks/SystemMaintenance/Component.tsx': {
    summary: 'Adapts a System Maintenance Payload block into the dedicated maintenance view with resolved actions.',
    tags: ['component', 'payload-block', 'system-page'],
  },
  'src/components/system-pages/System404View.tsx': {
    summary: 'Composes the centered not-found experience from shared system-page shell and action primitives.',
    tags: ['component', 'not-found', 'system-page'],
  },
  'src/components/system-pages/SystemComingSoonView.tsx': {
    summary: 'Composes the coming-soon experience from shared status, copy, shell, and action primitives.',
    tags: ['component', 'coming-soon', 'system-page'],
  },
  'src/components/system-pages/SystemMaintenanceView.tsx': {
    summary: 'Composes the maintenance experience from shared status, copy, shell, and action primitives.',
    tags: ['component', 'maintenance', 'system-page'],
  },
  'src/components/system-pages/primitives/SystemPageActions.tsx': {
    summary: 'Renders primary and secondary system-page actions as styled links or buttons according to CMS action data.',
    tags: ['component', 'actions', 'system-page'],
  },
  'src/components/system-pages/primitives/SystemPageCopy.tsx': {
    summary: 'Renders the heading, description, and supporting note used by system-page layouts.',
    tags: ['component', 'typography', 'system-page'],
  },
  'src/components/system-pages/primitives/SystemPageShell.tsx': {
    summary: 'Provides the full-viewport system-page container, appearance classes, layout variants, and animation hooks.',
    tags: ['component', 'layout', 'system-page'],
  },
  'src/components/system-pages/primitives/SystemPageStatus.tsx': {
    summary: 'Displays the prominent badge or status marker used at the top of managed system pages.',
    tags: ['component', 'status', 'system-page'],
  },
  'src/components/system-pages/types.ts': {
    summary: 'Defines the shared action, appearance, and view prop contracts used across system-page components.',
    tags: ['type-definition', 'system-page', 'typescript'],
  },
  'src/hooks/createRedirectsForChangedPagePath.ts': {
    summary: 'Payload after-change hook that preserves old page URLs, removes conflicts, and creates descendant redirects when a published page moves.',
    tags: ['hook', 'redirects', 'payload-cms', 'data-integrity'],
  },
  'src/hooks/populatePageUrlPreview.ts': {
    summary: 'Payload hook that resolves and stores a page’s current hierarchical URL for admin previews.',
    tags: ['hook', 'preview', 'payload-cms'],
  },
  'src/hooks/preventReferencedPageUnpublish.ts': {
    summary: 'Blocks unpublishing pages still referenced as the homepage, navigation targets, or active redirect destinations.',
    tags: ['hook', 'validation', 'payload-cms', 'data-integrity'],
  },
  'src/lib/navigationLinks.ts': {
    summary: 'Type-checks navigation-link documents and resolves page-backed links into frontend hrefs.',
    tags: ['utility', 'navigation', 'link-resolution'],
  },
  'src/lib/pagePaths.ts': {
    summary: 'Builds canonical hierarchical page paths from Payload relationships, including lazy parent resolution when relationships are not populated.',
    tags: ['utility', 'routing', 'path-resolution'],
  },
  'src/lib/redirects.ts': {
    summary: 'Normalizes redirect paths, loads enabled redirects, and safely resolves destinations while rejecting self-loops and circular chains.',
    tags: ['utility', 'redirects', 'validation', 'data-access'],
  },
  'src/lib/systemPageActions.ts': {
    summary: 'Converts CMS system-page action records into normalized links suitable for shared action components.',
    tags: ['utility', 'link-resolution', 'system-page'],
  },
  'tests/int/redirects.int.spec.ts': {
    summary: 'Integration tests covering automatic redirects after page renames, path-conflict cleanup, and redirect-loop safeguards.',
    tags: ['test', 'integration-test', 'redirects'],
  },
  'tests/int/system-page-rendering.int.spec.ts': {
    summary: 'Server-rendering integration tests for managed 404, maintenance, coming-soon, and built-in fallback presentations.',
    tags: ['test', 'integration-test', 'system-page'],
  },
}

const exactFunctionSummaries = {
  PageContent: 'Filters unsupported page blocks and renders the remaining CMS block sequence.',
  SystemModeFallbackPage: 'Selects the built-in maintenance or coming-soon screen for the active system mode.',
  DefaultNotFoundPage: 'Renders the project’s built-in not-found screen and homepage action.',
  CmsPage: 'Resolves a catch-all path through system modes, canonical homepage redirects, configured redirects, CMS lookup, and 404 handling.',
  NotFoundPage: 'Loads the managed 404 page and otherwise returns the default not-found view.',
  HomePage: 'Applies system-mode behavior before loading and rendering the configured homepage.',
  extractRelationshipID: 'Normalizes scalar and populated Payload relationships into an ID.',
  getPageSettings: 'Loads the page-settings global without populating relationships.',
  getSystemModeSettings: 'Loads the system-mode-settings global used to control maintenance and coming-soon behavior.',
  getSeoSettings: 'Loads global SEO defaults with media relationships populated.',
  getPublishedPageByID: 'Fetches one published page by identifier at a caller-selected relationship depth.',
  getPageBySlug: 'Fetches one published page by slug for direct lookup paths.',
  getPageByPathname: 'Fetches a leaf page and verifies that its populated ancestry matches the requested pathname.',
  getPageByPath: 'Joins route segments and resolves the corresponding published CMS page.',
  getHomepagePage: 'Resolves the configured homepage relationship and loads its published page document.',
  getHomepagePath: 'Returns the configured homepage’s non-root canonical path when one exists.',
  toManagedRouteMetadata: 'Combines route-level SEO fields, global fallbacks, canonical URLs, Open Graph media, and robot directives into Next.js metadata.',
  toManagedPageMetadata: 'Maps a regular page and its configured canonical path into managed route metadata.',
  getPublishedSystemPageByID: 'Fetches a published system page by ID and optionally enforces its expected system-page type.',
  getSystemBehaviorPages: 'Loads configured maintenance, coming-soon, and not-found pages for runtime system behavior.',
  getResolvedSystemPageRenderState: 'Determines whether the current request should render or bypass a configured system-mode page.',
  getSystemPageRenderState: 'Returns the active system-mode render state for a frontend request.',
  getHomepageRenderState: 'Resolves homepage rendering while honoring system-mode overrides and bypass permissions.',
  getManagedNotFoundPage: 'Returns the configured published not-found system page, if available.',
  getPageMetadataBySlug: 'Loads a page by slug and converts it into Next.js metadata.',
  getPageMetadataByPath: 'Builds metadata for a nested route, including active system-mode pages and configured redirects.',
  getHomepageMetadata: 'Builds homepage metadata while honoring active system-mode pages.',
  getRenderableBlocks: 'Removes null or unsupported entries from a page’s block list.',
  RenderBlocks: 'Renders the filtered block sequence inside the shared page-block stack.',
  System404BlockComponent: 'Resolves block actions and renders a CMS-authored not-found view.',
  SystemComingSoonBlockComponent: 'Resolves block actions and renders a CMS-authored coming-soon view.',
  SystemMaintenanceBlockComponent: 'Resolves block actions and renders a CMS-authored maintenance view.',
  System404View: 'Builds the centered 404 presentation from reusable system-page primitives.',
  SystemComingSoonView: 'Builds the coming-soon presentation from reusable system-page primitives.',
  SystemMaintenanceView: 'Builds the maintenance presentation from reusable system-page primitives.',
  ActionButton: 'Renders one resolved action with the appropriate button variant and link behavior.',
  SystemPageActions: 'Lays out the available primary and secondary system-page actions.',
  SystemPageCopy: 'Renders system-page heading, descriptive copy, and an optional support note.',
  SystemPageShell: 'Applies appearance tokens, viewport layout, and variant data attributes around system-page content.',
  SystemPageStatus: 'Renders the animated system-page badge or status label.',
  getRelationshipID: 'Normalizes a page relationship into its scalar identifier.',
  findExistingRedirect: 'Finds the first redirect currently registered for a normalized source path.',
  findEnabledRedirectsByFromPath: 'Loads enabled redirects that conflict with a specific source path.',
  upsertRedirect: 'Updates an existing redirect or creates a new published permanent redirect.',
  deleteConflictingRedirectsForLivePath: 'Deletes enabled redirects whose source now belongs to a live page.',
  hydratePagePath: 'Walks populated or scalar parent relationships to reconstruct a page’s normalized full path.',
  isDescendantOf: 'Checks whether a populated page ancestry contains a specified ancestor.',
  createDescendantRedirects: 'Creates old-path redirects for published descendants after an ancestor page moves.',
  createRedirectsForChangedPagePath: 'Preserves routing continuity after a published page path changes and reconciles conflicting redirects.',
  populatePageUrlPreview: 'Computes a hierarchical page href and assigns it to the document preview field.',
  getReferencedPageUsage: 'Collects homepage, navigation-link, and active-redirect references to a page.',
  preventReferencedPageUnpublish: 'Rejects an update that would unpublish a page still required by live site configuration.',
  isNavigationLinkDoc: 'Narrows unknown relationship values to populated navigation-link documents.',
  resolveNavigationLink: 'Resolves a populated navigation-link record and any page target into a frontend link.',
  isPageDoc: 'Narrows relationship values to populated page documents.',
  getPageID: 'Extracts a page identifier from scalar or populated relationship values.',
  getPageSlugSegments: 'Walks populated parent relationships to produce ordered page slug segments.',
  getPageHref: 'Converts a populated page hierarchy into its public URL path.',
  getPageHrefFromSource: 'Builds a page URL while loading unresolved parents through the current Payload request.',
  getPageHrefFromSourceWithResolver: 'Builds a hierarchical page URL through a caller-supplied parent resolver.',
  normalizeRedirectPath: 'Removes query strings and trailing slashes while enforcing a leading slash.',
  resolveRedirectDestination: 'Converts a page-backed or custom redirect record into a destination and permanence flag.',
  getValidatedRedirectDestination: 'Resolves a redirect destination while rejecting missing targets, self-loops, and circular internal chains.',
  getRedirectByPath: 'Returns the cached validated redirect destination for a requested pathname.',
  resolveSystemPageAction: 'Maps a CMS action record through the shared link resolver into system-page action props.',
  createPayloadRequestMock: 'Builds a focused Payload request mock and spies for redirect lifecycle integration tests.',
  generateMetadata: 'Builds route metadata from the corresponding managed CMS page.',
}

function functionTags(file, name) {
  if (file.includes('/components/') || file.includes('/blocks/') || file.endsWith('PageContent.tsx') || file.endsWith('SystemFallbackPage.tsx')) {
    return ['component', 'react', 'rendering']
  }
  if (file.includes('/app/')) return ['route-handler', 'nextjs', 'server-rendering']
  if (file.includes('/hooks/')) return ['hook', 'payload-cms', name.includes('Redirect') ? 'redirects' : 'validation']
  if (file.includes('/tests/')) return ['test', 'integration-test', 'test-fixture']
  if (file.endsWith('pageData.ts')) return ['data-access', 'payload-cms', 'server-rendering']
  if (file.endsWith('redirects.ts')) return ['utility', 'redirects', 'validation']
  if (file.endsWith('pagePaths.ts')) return ['utility', 'routing', 'path-resolution']
  return ['utility', 'link-resolution', 'typescript']
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

const exportedByFile = new Map(
  extraction.results.map((result) => [result.path, new Set((result.exports || []).map((item) => item.name))]),
)
const resultByFile = new Map(extraction.results.map((result) => [result.path, result]))
const nodes = []
const edges = []
const functionNodeByFileAndName = new Map()

for (const batchFile of input.batchFiles) {
  const result = resultByFile.get(batchFile.path)
  if (!result) throw new Error(`Missing extraction result for ${batchFile.path}`)
  const meta = fileMeta[batchFile.path]
  if (!meta) throw new Error(`Missing semantic metadata for ${batchFile.path}`)

  nodes.push({
    id: `file:${batchFile.path}`,
    type: 'file',
    name: path.basename(batchFile.path),
    filePath: batchFile.path,
    summary: meta.summary,
    tags: meta.tags,
    complexity: complexity(result.nonEmptyLines),
    ...(batchFile.path === 'src/app/(frontend)/pageData.ts'
      ? { languageNotes: 'Uses React cache-compatible server helpers and Payload depth controls to keep route data and metadata resolution consistent.' }
      : {}),
  })

  const exported = exportedByFile.get(batchFile.path)
  const candidates = (result.functions || []).filter(
    (fn) => exported.has(fn.name) || fn.endLine - fn.startLine + 1 >= 10,
  )
  if (batchFile.path === 'src/lib/redirects.ts') {
    candidates.push({ name: 'getRedirectByPath', startLine: 131, endLine: 137, params: ['pathname'] })
  }

  for (const fn of candidates) {
    const id = `function:${batchFile.path}:${fn.name}`
    if (functionNodeByFileAndName.has(`${batchFile.path}\0${fn.name}`)) continue
    functionNodeByFileAndName.set(`${batchFile.path}\0${fn.name}`, id)
    nodes.push({
      id,
      type: 'function',
      name: fn.name,
      filePath: batchFile.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: exactFunctionSummaries[fn.name] || `Implements ${fn.name} within ${path.basename(batchFile.path)}.`,
      tags: functionTags(batchFile.path, fn.name),
      complexity: complexity(fn.endLine - fn.startLine + 1),
    })
    edges.push({
      source: `file:${batchFile.path}`,
      target: id,
      type: 'contains',
      direction: 'forward',
      weight: 1.0,
    })
    if (exported.has(fn.name)) {
      edges.push({
        source: `file:${batchFile.path}`,
        target: id,
        type: 'exports',
        direction: 'forward',
        weight: 0.8,
      })
    }
  }
}

for (const [sourcePath, targets] of Object.entries(input.batchImportData)) {
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

for (const result of extraction.results) {
  for (const call of result.callGraph || []) {
    const source = functionNodeByFileAndName.get(`${result.path}\0${call.caller}`)
    const target = functionNodeByFileAndName.get(`${result.path}\0${call.callee}`)
    if (source && target && source !== target) {
      edges.push({ source, target, type: 'calls', direction: 'forward', weight: 0.8 })
    }
  }
}

const crossBatchCalls = [
  ['function:src/app/(frontend)/PageContent.tsx:PageContent', 'function:src/blocks/renderPageBlocks.tsx:renderPageBlocks'],
  ['function:src/app/(frontend)/pageData.ts:toManagedRouteMetadata', 'function:src/lib/media.ts:getMediaAbsoluteUrl'],
  ['function:src/app/(frontend)/pageData.ts:toManagedRouteMetadata', 'function:src/lib/seo.ts:resolveCanonicalURL'],
  ['function:src/app/(frontend)/pageData.ts:toManagedRouteMetadata', 'function:src/lib/seo.ts:resolveRobotsMode'],
  ['function:src/app/(frontend)/pageData.ts:toManagedRouteMetadata', 'function:src/lib/siteUrl.ts:toAbsoluteSiteUrl'],
  ['function:src/components/system-pages/primitives/SystemPageShell.tsx:SystemPageShell', 'function:src/blocks/shared/blockAppearance.ts:resolveBlockAppearanceClasses'],
  ['function:src/components/system-pages/primitives/SystemPageShell.tsx:SystemPageShell', 'function:src/lib/utils.ts:cn'],
  ['function:src/lib/systemPageActions.ts:resolveSystemPageAction', 'function:src/lib/cmsLinks.ts:resolveCmsLink'],
]
for (const [source, target] of crossBatchCalls) {
  edges.push({ source, target, type: 'calls', direction: 'forward', weight: 0.8 })
}

edges.push({
  source: 'file:src/hooks/createRedirectsForChangedPagePath.ts',
  target: 'file:tests/int/redirects.int.spec.ts',
  type: 'tested_by',
  direction: 'forward',
  weight: 0.5,
})

const dedupedEdges = [...new Map(edges.map((edge) => [`${edge.source}\0${edge.target}\0${edge.type}`, edge])).values()]
const parts = Math.ceil(Math.max(nodes.length / 60, dedupedEdges.length / 120))
const sortedFiles = input.batchFiles.map((file) => file.path).sort()
const chunkSize = Math.ceil(sortedFiles.length / parts)

for (let index = 0; index < parts; index += 1) {
  const files = new Set(sortedFiles.slice(index * chunkSize, (index + 1) * chunkSize))
  const partNodes = nodes.filter((node) => files.has(node.filePath))
  const sourceIds = new Set(partNodes.map((node) => node.id))
  const partEdges = dedupedEdges.filter((edge) => sourceIds.has(edge.source))
  fs.writeFileSync(
    path.join(ua, `intermediate/batch-3-part-${index + 1}.json`),
    `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`,
  )
}

process.stdout.write(
  JSON.stringify({
    files: input.batchFiles.length,
    nodes: nodes.length,
    edges: dedupedEdges.length,
    imports: dedupedEdges.filter((edge) => edge.type === 'imports').length,
    parts,
  }),
)
