import fs from 'node:fs'
import path from 'node:path'

const root = '/Users/tanishraj/Tanishraj/Personal Projects/payload-cms-starter-kit'
const uaDir = path.join(root, '.understand-anything')
const extraction = JSON.parse(
  fs.readFileSync(path.join(uaDir, 'tmp/ua-file-extract-results-2.json'), 'utf8'),
)
const input = JSON.parse(
  fs.readFileSync(path.join(uaDir, 'tmp/ua-file-analyzer-input-2.json'), 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync(path.join(uaDir, 'intermediate/batches.json'), 'utf8'),
)
const batch = batches.batches.find(({ batchIndex }) => batchIndex === 2)

if (!batch) throw new Error('Batch 2 not found')

const fileMeta = {
  'src/app/(frontend)/preview/page/[id]/page.tsx': {
    summary:
      'Authenticated Payload admin preview route that loads a draft page plus review and news/event snapshots before mounting the live-preview client.',
    tags: ['entry-point', 'live-preview', 'payload-cms', 'server-component'],
  },
  'src/app/api/review-feed/route.ts': {
    summary:
      'Dynamic GET endpoint for paginated published reviews, including strict query validation and defensive server-error responses.',
    tags: ['api-handler', 'review-feed', 'pagination', 'validation'],
  },
  'src/blocks/RatingSpotlight/Component.tsx': {
    summary:
      'Server-side Payload block adapter that resolves live or manual review-rating data and delegates rendering to the spotlight presentation.',
    tags: ['component', 'payload-block', 'server-component', 'ratings'],
  },
  'src/blocks/RatingSpotlight/PreviewComponent.tsx': {
    summary:
      'Live-preview adapter that supplies snapshot-backed rating data to the shared rating spotlight presentation.',
    tags: ['component', 'live-preview', 'payload-block', 'ratings'],
  },
  'src/blocks/ReviewFeed/Component.tsx': {
    summary:
      'Server-side Review Feed block that normalizes editor settings and concurrently loads the first review page and rating distribution.',
    tags: ['component', 'payload-block', 'server-component', 'review-feed'],
  },
  'src/blocks/ReviewFeed/Presentation.tsx': {
    summary:
      'Presentation adapter that sanitizes Review Feed block copy and passes normalized data, appearance, and pagination settings to the UI.',
    tags: ['component', 'presentation', 'payload-block', 'review-feed'],
  },
  'src/blocks/ReviewFeed/PreviewComponent.tsx': {
    summary:
      'Live-preview adapter that selects a snapshot page by normalized size and falls back to an empty review page.',
    tags: ['component', 'live-preview', 'payload-block', 'review-feed'],
  },
  'src/components/live-preview/PageLivePreview.tsx': {
    summary:
      'Client component that subscribes to Payload live-preview updates and rerenders page blocks with prefetched review and news/event snapshots.',
    tags: ['component', 'live-preview', 'payload-cms', 'client-component'],
  },
  'src/components/rating-spotlight.tsx': {
    summary:
      'Responsive rating spotlight UI with configurable alignment, size, appearance, calls to action, and an accessible aggregate star summary.',
    tags: ['component', 'ratings', 'accessibility', 'presentation'],
  },
  'src/components/review-feed-list.tsx': {
    summary:
      'Interactive client-side review list that renders reviewer details and incrementally fetches deduplicated pages with retry feedback.',
    tags: ['component', 'review-feed', 'pagination', 'client-component'],
  },
  'src/components/review-feed.tsx': {
    summary:
      'Review Feed section UI that combines editorial copy, aggregate score and distribution visuals, and the paginated review list.',
    tags: ['component', 'review-feed', 'ratings', 'presentation'],
  },
  'src/components/shadcnblocks/rating.tsx': {
    summary:
      'Reusable accessible star-rating renderer supporting full and half stars, optional numeric scores, descriptions, and custom styling.',
    tags: ['component', 'ratings', 'accessibility', 'shadcn'],
  },
  'src/components/ui/avatar.tsx': {
    summary:
      'Radix-based avatar primitives for images, fallbacks, badges, grouped avatars, counts, and responsive size variants.',
    tags: ['component', 'ui-primitive', 'radix-ui', 'avatar'],
  },
  'src/components/ui/progress.tsx': {
    summary:
      'Styled Radix progress primitive that exposes a percentage-driven indicator for reusable progress visualizations.',
    tags: ['component', 'ui-primitive', 'radix-ui', 'progress'],
  },
  'src/components/ui/separator.tsx': {
    summary:
      'Styled Radix separator primitive with horizontal and vertical orientations and accessible decorative defaults.',
    tags: ['component', 'ui-primitive', 'radix-ui', 'separator'],
  },
  'src/lib/newsEventsPreviewShared.ts': {
    summary:
      'Shared preview contracts and layout analysis that derive the distinct news/event highlight counts needed for a page snapshot.',
    tags: ['utility', 'live-preview', 'news-events', 'type-definition'],
  },
  'src/lib/newsEventsPreviewSnapshot.ts': {
    summary:
      'Server-only loader that fetches news/event highlight sets for each count required by the current preview layout.',
    tags: ['service', 'live-preview', 'news-events', 'data-fetching'],
  },
  'src/lib/reviewFeed.ts': {
    summary:
      'Server-only review feed service that validates pagination, queries published Payload reviews, normalizes public fields, and caches page retrieval.',
    tags: ['service', 'review-feed', 'payload-cms', 'validation', 'serialization'],
  },
  'src/lib/reviewFeedShared.ts': {
    summary:
      'Runtime-safe review feed contracts, pagination bounds, normalization, and empty-page construction shared by server and client code.',
    tags: ['utility', 'review-feed', 'pagination', 'type-definition'],
  },
  'src/lib/reviewPreviewShared.ts': {
    summary:
      'Shared preview snapshot contracts and layout inspection that determine required review feed sizes and rating aggregates.',
    tags: ['utility', 'live-preview', 'review-feed', 'type-definition'],
  },
  'src/lib/reviewPreviewSnapshot.ts': {
    summary:
      'Server-only snapshot loader that concurrently gathers every review feed page and optional rating distribution needed for live preview.',
    tags: ['service', 'live-preview', 'review-feed', 'data-fetching'],
  },
  'src/lib/reviewRatingShared.ts': {
    summary:
      'Pure review-rating aggregation helpers that normalize five rating buckets and calculate totals, distributions, and weighted averages.',
    tags: ['utility', 'ratings', 'aggregation', 'type-definition'],
  },
  'src/lib/reviewRatingSummary.ts': {
    summary:
      'Server-only Payload aggregation service that counts published reviews per rating, logs failures, and exposes cached distributions and summaries.',
    tags: ['service', 'ratings', 'payload-cms', 'aggregation', 'caching'],
  },
  'tests/int/live-preview-renderer.int.spec.tsx': {
    summary:
      'Integration coverage for live-preview block rendering with review and news/event snapshot data.',
    tags: ['test', 'integration-test', 'live-preview', 'rendering'],
  },
  'tests/int/rating-spotlight.int.spec.ts': {
    summary:
      'Integration suite for Rating Spotlight schema defaults, component data modes, action rendering, responsive layout, and accessibility.',
    tags: ['test', 'integration-test', 'ratings', 'payload-block'],
  },
  'tests/int/review-feed-data.int.spec.ts': {
    summary:
      'Integration suite for review pagination validation, published-record filtering, public serialization, sorting, and failure behavior.',
    tags: ['test', 'integration-test', 'review-feed', 'data-access'],
  },
  'tests/int/review-feed-route.int.spec.ts': {
    summary:
      'Integration tests for the review-feed API route, covering valid pages, invalid query parameters, and server failures.',
    tags: ['test', 'integration-test', 'api-handler', 'review-feed'],
  },
  'tests/int/review-feed.int.spec.tsx': {
    summary:
      'Integration suite for Review Feed schema and rendering, client pagination, duplicate suppression, loading, retry, and empty states.',
    tags: ['test', 'integration-test', 'review-feed', 'component'],
  },
  'tests/int/review-preview-blocks.int.spec.tsx': {
    summary:
      'Integration tests ensuring Review Feed and Rating Spotlight preview adapters consume snapshot data without server-side refetching.',
    tags: ['test', 'integration-test', 'live-preview', 'payload-block'],
  },
  'tests/int/review-preview-snapshot.int.spec.ts': {
    summary:
      'Integration suite for preview requirement discovery, multi-size feed snapshots, fallbacks, and conditional rating aggregation.',
    tags: ['test', 'integration-test', 'live-preview', 'data-fetching'],
  },
  'tests/int/review-rating-summary.int.spec.ts': {
    summary:
      'Integration coverage for rating distribution mathematics and Payload-backed published-review aggregation.',
    tags: ['test', 'integration-test', 'ratings', 'aggregation'],
  },
}

const functionMeta = {
  'src/app/(frontend)/preview/page/[id]/page.tsx:AdminPreviewPage': [
    'Authenticates the admin request, loads a draft page and its preview snapshots, and renders the live-preview client.',
    ['entry-point', 'live-preview', 'authentication', 'server-component'],
  ],
  'src/app/api/review-feed/route.ts:GET': [
    'Validates review-feed pagination parameters and returns either a paginated JSON feed or an appropriate error response.',
    ['api-handler', 'review-feed', 'pagination', 'validation'],
  ],
  'src/blocks/RatingSpotlight/Component.tsx:LiveRatingSpotlight': [
    'Fetches the cached published review summary and renders the rating spotlight presentation.',
    ['component', 'ratings', 'data-fetching'],
  ],
  'src/blocks/RatingSpotlight/Component.tsx:RatingSpotlightBlockComponent': [
    'Chooses manual or live rating data for a Payload block and forwards the resolved content to its presentation.',
    ['component', 'payload-block', 'ratings'],
  ],
  'src/blocks/RatingSpotlight/PreviewComponent.tsx:RatingSpotlightPreviewBlockComponent': [
    'Renders a Rating Spotlight preview using the editor snapshot unless manual rating data is configured.',
    ['component', 'live-preview', 'ratings'],
  ],
  'src/blocks/ReviewFeed/Component.tsx:ReviewFeedBlockComponent': [
    'Normalizes Review Feed settings, loads feed and rating data concurrently, and renders the presentation adapter.',
    ['component', 'review-feed', 'data-fetching'],
  ],
  'src/blocks/ReviewFeed/Presentation.tsx:ReviewFeedBlockPresentation': [
    'Trims editor-provided copy, normalizes page size, resolves appearance, and renders the Review Feed UI.',
    ['component', 'presentation', 'review-feed'],
  ],
  'src/blocks/ReviewFeed/PreviewComponent.tsx:ReviewFeedPreviewBlockComponent': [
    'Selects preview feed data for the normalized page size and renders the Review Feed presentation.',
    ['component', 'live-preview', 'review-feed'],
  ],
  'src/components/live-preview/PageLivePreview.tsx:PageLivePreview': [
    'Subscribes to Payload draft updates and renders live page blocks while preserving prefetched snapshot data.',
    ['component', 'live-preview', 'client-component'],
  ],
  'src/components/rating-spotlight.tsx:RatingSummary': [
    'Clamps and formats aggregate ratings into an accessible five-star summary with localized review counts.',
    ['component', 'ratings', 'accessibility'],
  ],
  'src/components/rating-spotlight.tsx:RatingSpotlight': [
    'Renders the responsive spotlight section with themed appearance, editorial copy, optional rating summary, and actions.',
    ['component', 'ratings', 'presentation'],
  ],
  'src/components/review-feed-list.tsx:ReviewFeedItem': [
    'Renders one review with initials, verification status, date, star rating, title, and body copy.',
    ['component', 'review-feed', 'presentation'],
  ],
  'src/components/review-feed-list.tsx:ReviewFeedList': [
    'Maintains paginated review state and loads, deduplicates, retries, and renders additional review pages.',
    ['component', 'review-feed', 'pagination', 'client-component'],
  ],
  'src/components/review-feed.tsx:ReviewFeedSummary': [
    'Visualizes an aggregate review score with stars and per-rating percentage bars.',
    ['component', 'ratings', 'visualization'],
  ],
  'src/components/review-feed.tsx:ReviewFeed': [
    'Composes Review Feed copy, rating analytics, separators, and the interactive paginated list.',
    ['component', 'review-feed', 'presentation'],
  ],
  'src/components/shadcnblocks/rating.tsx:Rating': [
    'Normalizes a numeric score and renders accessible full, half, and empty stars in several display modes.',
    ['component', 'ratings', 'accessibility', 'shadcn'],
  ],
  'src/components/ui/avatar.tsx:Avatar': [
    'Wraps the Radix avatar root with size variants, clipping, border treatment, and slot metadata.',
    ['component', 'ui-primitive', 'avatar'],
  ],
  'src/components/ui/avatar.tsx:AvatarImage': [
    'Styles the Radix avatar image to fill and crop within its avatar container.',
    ['component', 'ui-primitive', 'avatar'],
  ],
  'src/components/ui/avatar.tsx:AvatarFallback': [
    'Provides a centered muted fallback when an avatar image is unavailable.',
    ['component', 'ui-primitive', 'avatar'],
  ],
  'src/components/ui/avatar.tsx:AvatarBadge': [
    'Positions a themed status badge over the avatar with size-aware icon styling.',
    ['component', 'ui-primitive', 'avatar'],
  ],
  'src/components/ui/avatar.tsx:AvatarGroup': [
    'Arranges multiple avatars as an overlapping, ring-separated group.',
    ['component', 'ui-primitive', 'avatar'],
  ],
  'src/components/ui/avatar.tsx:AvatarGroupCount': [
    'Displays an additional-avatar count that follows the active avatar group size.',
    ['component', 'ui-primitive', 'avatar'],
  ],
  'src/components/ui/progress.tsx:Progress': [
    'Renders a styled progress track and translates the numeric value into the indicator position.',
    ['component', 'ui-primitive', 'progress'],
  ],
  'src/components/ui/separator.tsx:Separator': [
    'Renders a styled Radix separator with orientation-aware dimensions and decorative semantics.',
    ['component', 'ui-primitive', 'separator'],
  ],
  'src/lib/newsEventsPreviewShared.ts:getNewsEventsPreviewItemCounts': [
    'Scans page layout blocks and returns sorted unique highlight counts required by news/event previews.',
    ['utility', 'live-preview', 'news-events'],
  ],
  'src/lib/newsEventsPreviewSnapshot.ts:loadNewsEventsPreviewSnapshot': [
    'Loads each required news/event highlight set concurrently and indexes results by requested item count.',
    ['service', 'live-preview', 'news-events'],
  ],
  'src/lib/reviewFeed.ts:parsePositiveInteger': [
    'Parses a positive integer query value with a fallback, label-specific errors, and an optional maximum.',
    ['utility', 'validation', 'pagination'],
  ],
  'src/lib/reviewFeed.ts:parseReviewFeedPagination': [
    'Validates review feed page and limit search parameters and returns a discriminated success or error result.',
    ['utility', 'validation', 'pagination'],
  ],
  'src/lib/reviewFeed.ts:toPublicReviewFeedItem': [
    'Maps a Payload review record into the stable public feed shape with normalized author, date, rating, and title fields.',
    ['serialization', 'review-feed', 'validation'],
  ],
  'src/lib/reviewFeed.ts:fetchPublishedReviewFeedPage': [
    'Queries published reviews with a restricted projection and maps Payload pagination metadata into the public feed contract.',
    ['service', 'review-feed', 'payload-cms', 'data-access'],
  ],
  'src/lib/reviewFeedShared.ts:normalizeReviewFeedPageSize': [
    'Clamps integer page sizes to shared review-feed bounds and applies the default for invalid values.',
    ['utility', 'review-feed', 'pagination'],
  ],
  'src/lib/reviewFeedShared.ts:createEmptyReviewFeedPage': [
    'Creates the canonical empty first page used by review-feed fallbacks.',
    ['factory', 'review-feed', 'fallback'],
  ],
  'src/lib/reviewPreviewShared.ts:getReviewPreviewRequirements': [
    'Scans page blocks to collect unique review feed sizes and determine whether rating distribution data is required.',
    ['utility', 'live-preview', 'review-feed'],
  ],
  'src/lib/reviewPreviewSnapshot.ts:loadReviewPreviewSnapshot': [
    'Fetches all required review pages and optional rating data concurrently, substituting safe fallbacks on failure.',
    ['service', 'live-preview', 'review-feed', 'data-fetching'],
  ],
  'src/lib/reviewRatingShared.ts:calculatePublishedReviewRatingDistribution': [
    'Converts five rating counts into normalized buckets, total review count, and a weighted average.',
    ['utility', 'ratings', 'aggregation'],
  ],
  'src/lib/reviewRatingShared.ts:calculatePublishedReviewRatingSummary': [
    'Projects the full rating distribution into its average-and-count summary or returns null for no reviews.',
    ['utility', 'ratings', 'aggregation'],
  ],
  'src/lib/reviewRatingSummary.ts:fetchPublishedReviewRatingDistribution': [
    'Counts published reviews for each rating concurrently and converts the buckets into a distribution with logged failure handling.',
    ['service', 'ratings', 'payload-cms', 'aggregation'],
  ],
  'src/lib/reviewRatingSummary.ts:fetchPublishedReviewRatingSummary': [
    'Fetches the rating distribution and narrows it to the average and total-count summary.',
    ['service', 'ratings', 'aggregation'],
  ],
  'tests/int/review-preview-snapshot.int.spec.ts:pageFor': [
    'Builds a deterministic review-feed page fixture for preview snapshot tests.',
    ['test-helper', 'fixture', 'review-feed'],
  ],
}

const excludedFunctions = new Set([
  'src/blocks/RatingSpotlight/Component.tsx:LiveRatingSpotlightBlock',
  'src/components/review-feed-list.tsx:getInitials',
  'src/lib/reviewFeed.ts:formatPublishedDate',
  'src/lib/reviewFeed.ts:normalizeRating',
  'src/lib/reviewRatingShared.ts:toRatingCounts',
  'tests/int/rating-spotlight.int.spec.ts:getField',
  'tests/int/review-feed.int.spec.tsx:getField',
  'tests/int/review-preview-snapshot.int.spec.ts:asLayout',
])

const fileResultByPath = new Map(extraction.results.map((result) => [result.path, result]))
const nodeById = new Map()
const edges = []

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function addNode(node) {
  if (nodeById.has(node.id)) throw new Error(`Duplicate node: ${node.id}`)
  nodeById.set(node.id, node)
}

function addEdge(source, target, type, weight) {
  if (source === target) throw new Error(`Self edge: ${source}`)
  edges.push({ source, target, type, direction: 'forward', weight })
}

for (const file of input.batchFiles) {
  const result = fileResultByPath.get(file.path)
  if (!result) throw new Error(`Missing extraction result for ${file.path}`)
  const metadata = fileMeta[file.path]
  if (!metadata) throw new Error(`Missing file metadata for ${file.path}`)
  const fileId = `file:${file.path}`

  addNode({
    id: fileId,
    type: 'file',
    name: path.basename(file.path),
    filePath: file.path,
    summary: metadata.summary,
    tags: metadata.tags,
    complexity: complexity(result.nonEmptyLines),
    ...(file.path.endsWith('.tsx')
      ? {
          languageNotes:
            'Uses typed React components and JSX composition; server/client boundaries are explicit where runtime behavior requires them.',
        }
      : {}),
  })

  for (const fn of result.functions ?? []) {
    const key = `${file.path}:${fn.name}`
    if (excludedFunctions.has(key)) continue
    const isExported = (result.exports ?? []).some(({ name }) => name === fn.name)
    const lineCount = fn.endLine - fn.startLine + 1
    if (!isExported && lineCount < 10) continue
    const metadataForFunction = functionMeta[key]
    if (!metadataForFunction) throw new Error(`Missing function metadata for ${key}`)
    const functionId = `function:${key}`
    addNode({
      id: functionId,
      type: 'function',
      name: fn.name,
      filePath: file.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: metadataForFunction[0],
      tags: metadataForFunction[1],
      complexity: complexity(lineCount),
    })
    addEdge(fileId, functionId, 'contains', 1.0)
    if (isExported) addEdge(fileId, functionId, 'exports', 0.8)
  }
}

for (const [sourcePath, targets] of Object.entries(input.batchImportData)) {
  for (const targetPath of targets) {
    addEdge(`file:${sourcePath}`, `file:${targetPath}`, 'imports', 0.7)
  }
}

const calls = [
  [
    'function:src/components/live-preview/PageLivePreview.tsx:PageLivePreview',
    'function:src/blocks/renderLivePreviewPageBlocks.tsx:renderLivePreviewPageBlocks',
  ],
  [
    'function:src/components/rating-spotlight.tsx:RatingSummary',
    'function:src/lib/utils.ts:cn',
  ],
  [
    'function:src/components/rating-spotlight.tsx:RatingSpotlight',
    'function:src/blocks/shared/blockAppearance.ts:resolveBlockAppearanceClasses',
  ],
  [
    'function:src/components/rating-spotlight.tsx:RatingSpotlight',
    'function:src/lib/utils.ts:cn',
  ],
  ['function:src/components/shadcnblocks/rating.tsx:Rating', 'function:src/lib/utils.ts:cn'],
  [
    'function:src/lib/newsEventsPreviewSnapshot.ts:loadNewsEventsPreviewSnapshot',
    'function:src/lib/newsEvents.ts:getNewsEventsHighlights',
  ],
  [
    'function:src/lib/reviewFeed.ts:parseReviewFeedPagination',
    'function:src/lib/reviewFeed.ts:parsePositiveInteger',
  ],
  [
    'function:src/lib/reviewFeed.ts:toPublicReviewFeedItem',
    'function:src/lib/reviews.ts:getReviewDisplayName',
  ],
  [
    'function:src/lib/reviewFeed.ts:fetchPublishedReviewFeedPage',
    'function:src/lib/reviewFeed.ts:toPublicReviewFeedItem',
  ],
  [
    'function:src/lib/reviewPreviewShared.ts:getReviewPreviewRequirements',
    'function:src/lib/reviewFeedShared.ts:normalizeReviewFeedPageSize',
  ],
  [
    'function:src/lib/reviewPreviewSnapshot.ts:loadReviewPreviewSnapshot',
    'function:src/lib/reviewPreviewShared.ts:getReviewPreviewRequirements',
  ],
  [
    'function:src/lib/reviewPreviewSnapshot.ts:loadReviewPreviewSnapshot',
    'function:src/lib/reviewFeedShared.ts:createEmptyReviewFeedPage',
  ],
  [
    'function:src/lib/reviewRatingShared.ts:calculatePublishedReviewRatingSummary',
    'function:src/lib/reviewRatingShared.ts:calculatePublishedReviewRatingDistribution',
  ],
  [
    'function:src/lib/reviewRatingSummary.ts:fetchPublishedReviewRatingDistribution',
    'function:src/lib/reviewRatingShared.ts:calculatePublishedReviewRatingDistribution',
  ],
  [
    'function:src/lib/reviewRatingSummary.ts:fetchPublishedReviewRatingSummary',
    'function:src/lib/reviewRatingSummary.ts:fetchPublishedReviewRatingDistribution',
  ],
]

for (const [source, target] of calls) addEdge(source, target, 'calls', 0.8)

const batchFilePaths = new Set(input.batchFiles.map(({ path: filePath }) => filePath))
for (const testFile of input.batchFiles.filter(({ path: filePath }) => filePath.includes('.spec.'))) {
  for (const productionPath of input.batchImportData[testFile.path]) {
    if (batchFilePaths.has(productionPath) && !productionPath.includes('.spec.')) {
      addEdge(`file:${productionPath}`, `file:${testFile.path}`, 'tested_by', 0.5)
    }
  }
}

const nodes = [...nodeById.values()]
const importEdges = edges.filter(({ type }) => type === 'imports')
const expectedImportEdges = Object.values(input.batchImportData).reduce(
  (total, paths) => total + paths.length,
  0,
)
if (importEdges.length !== expectedImportEdges) {
  throw new Error(`Expected ${expectedImportEdges} imports edges, found ${importEdges.length}`)
}

for (const [sourcePath, targetPaths] of Object.entries(input.batchImportData)) {
  for (const targetPath of targetPaths) {
    const matches = importEdges.filter(
      ({ source, target }) => source === `file:${sourcePath}` && target === `file:${targetPath}`,
    )
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one import edge ${sourcePath} -> ${targetPath}`)
    }
  }
}

const nodeCount = nodes.length
const edgeCount = edges.length
const parts = Math.ceil(Math.max(nodeCount / 60, edgeCount / 120))
const sortedFiles = [...input.batchFiles].sort((left, right) => left.path.localeCompare(right.path))
const chunkSize = Math.ceil(sortedFiles.length / parts)
const neighborPaths = new Set(
  Object.values(batch.neighborMap)
    .flat()
    .map(({ path: filePath }) => filePath),
)
const importPaths = new Set([
  ...Object.keys(input.batchImportData),
  ...Object.values(input.batchImportData).flat(),
])
const neighborSymbols = new Map()
for (const neighbors of Object.values(batch.neighborMap)) {
  for (const neighbor of neighbors) {
    neighborSymbols.set(neighbor.path, new Set(neighbor.symbols))
  }
}

for (let index = 0; index < parts; index += 1) {
  const partFiles = new Set(
    sortedFiles.slice(index * chunkSize, (index + 1) * chunkSize).map(({ path: filePath }) => filePath),
  )
  const partNodes = nodes.filter(({ filePath }) => partFiles.has(filePath))
  const partNodeIds = new Set(partNodes.map(({ id }) => id))
  const partEdges = edges.filter(({ source }) => partNodeIds.has(source))

  for (const edge of partEdges) {
    if (partNodeIds.has(edge.target)) continue
    const fileMatch = edge.target.match(/^file:(.+)$/)
    if (fileMatch && (neighborPaths.has(fileMatch[1]) || importPaths.has(fileMatch[1]))) continue
    const symbolMatch = edge.target.match(/^(?:function|class):(.+):([^:]+)$/)
    if (
      symbolMatch &&
      (partFiles.has(symbolMatch[1]) ||
        neighborSymbols.get(symbolMatch[1])?.has(symbolMatch[2]))
    ) {
      continue
    }
    throw new Error(`Invalid part ${index + 1} edge target: ${JSON.stringify(edge)}`)
  }

  const outputPath = path.join(uaDir, `intermediate/batch-2-part-${index + 1}.json`)
  fs.writeFileSync(outputPath, `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`)
}

console.log(JSON.stringify({ parts, nodeCount, edgeCount, expectedImportEdges }))
