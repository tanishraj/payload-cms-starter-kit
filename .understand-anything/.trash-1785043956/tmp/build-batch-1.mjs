import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, '.understand-anything')
const extraction = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'tmp/ua-file-extract-results-1.json'), 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'intermediate/batches.json'), 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 1)

if (!batch) throw new Error('Batch 1 is missing')

const fileMetadata = {
  'src/app/(frontend)/articles/[slug]/page.tsx': {
    summary:
      'Next.js route for published article detail pages, combining cached article data with entry-specific SEO metadata.',
    tags: ['route', 'article', 'server-component', 'seo'],
  },
  'src/app/(frontend)/articles/category/[slug]/page.tsx': {
    summary:
      'Next.js route for category-filtered article archives, resolving the taxonomy term, archive entries, and page metadata.',
    tags: ['route', 'article-archive', 'taxonomy', 'seo'],
  },
  'src/app/(frontend)/articles/tag/[slug]/page.tsx': {
    summary:
      'Next.js route for tag-filtered article archives, loading the selected taxonomy term, matching entries, and metadata.',
    tags: ['route', 'article-archive', 'taxonomy', 'seo'],
  },
  'src/app/(frontend)/news-events/[slug]/page.tsx': {
    summary:
      'Dynamic news and event detail route supporting published content, draft preview, structured data, and generated metadata.',
    tags: ['route', 'news-events', 'live-preview', 'seo'],
  },
  'src/app/(frontend)/news-events/page.tsx': {
    summary:
      'News and events archive route that parses filters, loads CMS settings and paginated entries, and renders the public feed.',
    tags: ['route', 'news-events', 'archive', 'pagination'],
  },
  'src/app/(frontend)/reviews/[slug]/page.tsx': {
    summary:
      'Next.js route for published review detail pages with related-review data and managed SEO metadata.',
    tags: ['route', 'reviews', 'server-component', 'seo'],
  },
  'src/app/(frontend)/reviews/category/[slug]/page.tsx': {
    summary:
      'Next.js route for category-filtered review archives with taxonomy-aware titles, entries, and metadata.',
    tags: ['route', 'review-archive', 'taxonomy', 'seo'],
  },
  'src/app/api/forms/[slug]/submit/route.ts': {
    summary:
      'Public form-submission API handler that validates input, applies spam controls, persists submissions, promotes review drafts, emits events, and sends notifications.',
    tags: ['api-handler', 'forms', 'validation', 'spam-protection', 'notifications'],
  },
  'src/app/robots.ts': {
    summary:
      'Generates the site robots policy from the canonical public URL for Next.js metadata routes.',
    tags: ['seo', 'robots', 'metadata-route', 'configuration'],
  },
  'src/app/sitemap.ts': {
    summary:
      'Builds the public sitemap from managed pages, articles, reviews, news, events, and taxonomy archives while enforcing publication and robots rules.',
    tags: ['seo', 'sitemap', 'metadata-route', 'content-query'],
  },
  'src/blocks/NewsEventsHighlights/Component.tsx': {
    summary:
      'Server-side Payload block component that fetches current news and event highlights and delegates rendering to its presentation component.',
    tags: ['component', 'payload-block', 'news-events', 'server-component'],
  },
  'src/components/articles/ArticleArchivePage.tsx': {
    summary:
      'Presentation component for category and tag article archives, rendering archive context and linked article cards.',
    tags: ['component', 'article-archive', 'presentation', 'taxonomy'],
  },
  'src/components/articles/ArticlePage.tsx': {
    summary:
      'Article-detail presentation component rendering hero media, taxonomy, rich content, publication metadata, and related articles.',
    tags: ['component', 'article', 'rich-content', 'presentation'],
  },
  'src/components/live-preview/NewsEventLivePreview.tsx': {
    summary:
      'Client live-preview adapter that receives Payload draft updates, transforms them to the public detail model, and rerenders the story.',
    tags: ['component', 'live-preview', 'payload', 'client-component'],
  },
  'src/components/news-events/NewsEventStory.tsx': {
    summary:
      'Detailed news and event presentation component covering badges, schedule and venue data, content actions, media, and body content.',
    tags: ['component', 'news-events', 'presentation', 'content-actions'],
  },
  'src/components/reviews/ReviewArchivePage.tsx': {
    summary:
      'Review archive presentation component rendering taxonomy context and a list of published review cards.',
    tags: ['component', 'review-archive', 'presentation', 'taxonomy'],
  },
  'src/components/reviews/ReviewPage.tsx': {
    summary:
      'Review-detail presentation component rendering rating, reviewer identity, subject metadata, rich content, and related reviews.',
    tags: ['component', 'reviews', 'presentation', 'rich-content'],
  },
  'src/lib/contentEntries.ts': {
    summary:
      'Cached Payload data-access and SEO layer for articles, reviews, related content, and taxonomy archive pages.',
    tags: ['service', 'content-query', 'seo', 'taxonomy', 'cache'],
  },
  'src/lib/formNotifications.ts': {
    summary:
      'Builds safe plain-text and HTML form-notification emails and resolves configured recipient addresses.',
    tags: ['service', 'notifications', 'email', 'serialization'],
  },
  'src/lib/formSpamProtection.ts': {
    summary:
      'Provides form spam defenses through honeypot detection, client IP extraction, and in-memory per-form rate limiting.',
    tags: ['security', 'spam-protection', 'rate-limiting', 'forms'],
  },
  'src/lib/formSubmissionEvents.ts': {
    summary:
      'Defines the form-submission event contract and emits submissions to an optional asynchronous integration handler.',
    tags: ['event-handler', 'forms', 'integration', 'type-definition'],
  },
  'src/lib/forms.ts': {
    summary:
      'Defines form field and submission contracts plus normalization and validation utilities for definitions, values, contact details, and attribution metadata.',
    tags: ['validation', 'forms', 'normalization', 'type-definition'],
  },
  'src/lib/newsEvents.ts': {
    summary:
      'Payload data-access service for news and events, including highlights, filtered archives, detail lookup, preview retrieval, settings, and categories.',
    tags: ['service', 'news-events', 'content-query', 'pagination', 'payload'],
  },
  'src/lib/newsEventsMetadata.ts': {
    summary:
      'Generates archive and detail metadata plus schema.org structured data for public news and event entries.',
    tags: ['seo', 'metadata', 'structured-data', 'news-events'],
  },
  'src/lib/newsEventsShared.ts': {
    summary:
      'Shared public news and event models and transformations for dates, filters, pagination, interleaving, cards, and detail views.',
    tags: ['utility', 'news-events', 'transformation', 'pagination', 'type-definition'],
  },
  'src/lib/reviewPromotion.ts': {
    summary:
      'Promotes validated review-form submissions into linked Payload review drafts, updating an existing review when appropriate.',
    tags: ['service', 'reviews', 'forms', 'data-transformation'],
  },
  'src/lib/reviews.ts': {
    summary:
      'Normalizes and validates public review submissions and derives safe display names and titles for review records.',
    tags: ['validation', 'reviews', 'normalization', 'forms'],
  },
  'src/lib/siteUrl.ts': {
    summary:
      'Resolves the canonical site origin from environment settings and converts relative application paths into absolute URLs.',
    tags: ['utility', 'url', 'configuration', 'seo'],
  },
  'src/lib/taxonomy.ts': {
    summary:
      'Normalizes Payload taxonomy relationships into stable term objects, term lists, and relationship identifiers.',
    tags: ['utility', 'taxonomy', 'normalization', 'payload'],
  },
  'tests/int/news-event-story.int.spec.tsx': {
    summary:
      'Integration tests for news and event story rendering, including event metadata, content actions, spacing, and news-specific behavior.',
    tags: ['test', 'integration-test', 'news-events', 'component'],
  },
  'tests/int/news-events-data.int.spec.ts': {
    summary:
      'Integration tests for public news and event data helpers, especially deterministic interleaving and content-type ordering.',
    tags: ['test', 'integration-test', 'news-events', 'data-transformation'],
  },
}

const humanize = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

const functionSummary = (name, filePath) => {
  const subject = humanize(name)
  if (name === 'POST') {
    return 'Handles validated public form submissions, persistence, review promotion, events, notifications, and HTTP responses.'
  }
  if (name === 'generateMetadata') {
    return 'Generates route metadata from the corresponding CMS entry or archive context.'
  }
  if (name.endsWith('Page') || name.endsWith('EntryPage')) {
    return `Renders the ${subject.replace(/ page$/, '')} route from resolved CMS data.`
  }
  if (name.endsWith('Component') || /^[A-Z]/.test(name)) {
    return `Renders the ${subject} user interface from normalized content data.`
  }
  if (name.startsWith('validate')) {
    return `Validates ${subject.replace(/^validate /, '')} and returns normalized data or actionable field errors.`
  }
  if (name.startsWith('normalize')) {
    return `Normalizes ${subject.replace(/^normalize /, '')} into the canonical application representation.`
  }
  if (name.startsWith('get')) {
    return `Resolves ${subject.replace(/^get /, '')} for the current content or request context.`
  }
  if (name.startsWith('fetch')) {
    return `Queries Payload for ${subject.replace(/^fetch /, '')} using explicit publication and pagination constraints.`
  }
  if (name.startsWith('to')) {
    return `Transforms ${subject.replace(/^to /, '')} into the public application model.`
  }
  if (name.startsWith('is')) {
    return `Determines whether ${subject.replace(/^is /, '')} satisfies the required application rules.`
  }
  if (name.startsWith('format')) {
    return `Formats ${subject.replace(/^format /, '')} for safe public presentation.`
  }
  if (name.startsWith('build')) {
    return `Builds ${subject.replace(/^build /, '')} from normalized form and content values.`
  }
  if (name.startsWith('emit')) {
    return `Emits ${subject.replace(/^emit /, '')} to the configured integration boundary.`
  }
  if (name.startsWith('record')) {
    return `Records ${subject.replace(/^record /, '')} for subsequent request protection decisions.`
  }
  if (name.startsWith('upsert')) {
    return `Creates or updates ${subject.replace(/^upsert /, '')} while preserving its source relationship.`
  }
  if (name.startsWith('derive')) {
    return `Derives ${subject.replace(/^derive /, '')} from normalized review values and fallbacks.`
  }
  if (name.includes('Where')) {
    return `Builds the Payload query constraint for ${subject.replace(/ where$/, '')}.`
  }
  if (name === 'sitemap') {
    return 'Queries all sitemap-eligible managed content and returns deduplicated canonical entries.'
  }
  if (name === 'robots') {
    return 'Returns the public crawler policy and absolute sitemap URL.'
  }
  if (name === 'interleaveNewsEvents') {
    return 'Interleaves news and event cards deterministically while respecting the requested result limit.'
  }
  if (name === 'addEntry') {
    return 'Adds a canonical sitemap entry while deduplicating equivalent paths.'
  }
  if (name === 'card' && filePath.startsWith('tests/')) {
    return 'Creates compact news or event card fixtures for integration tests.'
  }
  return `Implements ${subject} for this module's content workflow.`
}

const functionTags = (name, filePath) => {
  const tags = ['function']
  if (filePath.startsWith('tests/')) tags.push('test-helper')
  else if (filePath.includes('/app/api/')) tags.push('api-handler')
  else if (filePath.includes('/components/') || filePath.endsWith('.tsx')) tags.push('component')
  else tags.push('utility')

  if (/metadata|sitemap|robots|canonical/i.test(name)) tags.push('seo')
  else if (/validate|is[A-Z]/.test(name)) tags.push('validation')
  else if (/normalize|to[A-Z]|format|interleave|derive/.test(name)) tags.push('transformation')
  else if (/fetch|get[A-Z]/.test(name)) tags.push('data-access')
  else if (/emit|record|upsert|POST/.test(name)) tags.push('service')
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
  nodes.push({
    id: fileId,
    type: 'file',
    name: path.posix.basename(batchFile.path),
    filePath: batchFile.path,
    summary: metadata.summary,
    tags: metadata.tags,
    complexity: complexityForLines(result.nonEmptyLines),
    ...(batchFile.path.endsWith('.tsx')
      ? {
          languageNotes:
            'Uses typed React server or client components within the Next.js App Router.',
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
      summary: functionSummary(fn.name, batchFile.path),
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
if (parts <= 1) throw new Error('Expected batch 1 to require multipart output')

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

  const outputPath = path.join(
    dataDir,
    `intermediate/batch-1-part-${partIndex + 1}.json`,
  )
  fs.writeFileSync(outputPath, `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`)
}

console.log(JSON.stringify({ parts, nodeCount, edgeCount }))
