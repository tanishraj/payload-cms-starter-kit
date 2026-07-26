import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-10.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 10)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 10 inputs are incomplete')
}

const summaries = {
  'scripts/generate-block-thumbnails.ts':
    'Automates block-thumbnail capture by starting or reusing the preview server, launching a browser, visiting each registered preview, and saving screenshots.',
  'src/app/(block-thumbnails)/block-thumbnail-previews/[slug]/page.tsx':
    'Provides the dynamic Next.js preview route that resolves a thumbnail definition and fixture before rendering its isolated preview stage.',
  'src/block-thumbnails/BlockThumbnailPreviewStage.tsx':
    'Coordinates browser-ready thumbnail capture by waiting for images and animation frames before marking the isolated preview stage ready.',
  'src/block-thumbnails/definitions.ts':
    'Declares the canonical thumbnail registry, validates preview slugs, and exposes helpers for resolving block thumbnail metadata and feature flags.',
  'src/blocks/Announcement/config.ts':
    'Defines the Payload Announcement block schema, including message content, actions, display behavior, and reusable appearance controls.',
  'src/blocks/ContentHighlights/config.ts':
    'Defines the Content Highlights block schema with layout-aware fields, item links, calls to action, and reusable appearance controls.',
  'src/blocks/Cta39/config.ts':
    'Defines the CTA 39 block schema for promotional copy, actions, alignment, and configurable block appearance.',
  'src/blocks/FeatureMatrix/config.ts':
    'Defines the Feature Matrix block schema for comparison columns, feature rows, actions, and responsive presentation options.',
  'src/blocks/FeatureSpotlight/config.ts':
    'Defines the Feature Spotlight block schema with split-layout content, media, actions, and conditional appearance fields.',
  'src/blocks/Footer56/config.ts':
    'Defines the Footer 56 block schema for brand identity, grouped navigation, social links, legal content, and appearance.',
  'src/blocks/GalleryShowcase/config.ts':
    'Defines the Gallery Showcase block schema for images, gallery layout, sizing, actions, and reusable appearance settings.',
  'src/blocks/HeaderNavbar12/config.ts':
    'Defines the Header Navbar 12 schema with conditional navigation-link fields, logo selection, calls to action, and appearance controls.',
  'src/blocks/HeroBanner/config.ts':
    'Defines the Hero Banner block schema with responsive media, page or custom actions, content alignment, and appearance options.',
  'src/blocks/ImageMosaic/config.ts':
    'Defines the Image Mosaic block schema for responsive image arrangements, supporting content, actions, and appearance.',
  'src/blocks/NewsEventsHighlights/config.ts':
    'Defines the News and Events Highlights block schema for filtered editorial cards, item limits, calls to action, and appearance.',
  'src/blocks/ProfileCarousel/config.ts':
    'Defines the Profile Carousel block schema for profile cards, image treatments, actions, sizing, alignment, and appearance.',
  'src/blocks/QaAccordion/config.ts':
    'Defines the QA Accordion block schema for rich-text questions and answers, split layouts, actions, and appearance.',
  'src/blocks/RatingSpotlight/config.ts':
    'Defines the Rating Spotlight block schema for manual or sourced ratings, supporting content, actions, and appearance.',
  'src/blocks/ReviewFeed/config.ts':
    'Defines the Review Feed block schema for paginated review selection, feed sizing, filtering, and appearance.',
  'src/blocks/ReviewSubmission/config.ts':
    'Defines the Review Submission block schema for form presentation, supporting content, actions, and appearance.',
}

const functionSummaries = {
  startServer: 'Starts the thumbnail preview server and returns the managed child process.',
  waitForServer: 'Polls the preview origin until it becomes available or the readiness timeout expires.',
  stopServer: 'Terminates the managed preview server and waits for its process to exit.',
  launchBrowser: 'Launches the browser instance used to capture block-preview screenshots.',
  generateThumbnails: 'Coordinates server readiness, browser navigation, preview validation, and screenshot generation for every registered block.',
  BlockThumbnailPage: 'Resolves a preview slug and fixture, then renders the isolated thumbnail preview route.',
  waitForImage: 'Waits for an image element to load or fail before capture continues.',
  BlockThumbnailPreviewStage: 'Waits for preview assets and paint frames before exposing a screenshot-ready stage.',
  defineThumbnail: 'Creates a type-safe block-thumbnail definition.',
  isBlockThumbnailSlug: 'Checks whether a string is a registered block-thumbnail slug.',
  getBlockThumbnailDefinition: 'Returns the registered thumbnail definition for a candidate slug.',
  getBlockThumbnailAdmin: 'Returns Payload admin thumbnail metadata for a registered block.',
  isBlockThumbnailPreviewEnabled: 'Reports whether thumbnail preview routes are enabled in the current environment.',
  createLinkFields: 'Builds the conditional Payload fields for page-backed or custom navigation links.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function fileTags(file) {
  if (file.path.startsWith('scripts/')) return ['script', 'thumbnail-generation', 'browser-automation', 'build-system']
  if (file.path.startsWith('src/block-thumbnails/')) {
    return ['block-thumbnail', 'preview', 'developer-tooling', 'payload-cms']
  }
  if (file.path.includes('/block-thumbnail-previews/')) {
    return ['nextjs-route', 'block-thumbnail', 'preview', 'developer-tooling']
  }
  return ['configuration', 'payload-block', 'schema-definition', 'admin-ui']
}

function functionTags(filePath, name) {
  if (filePath.startsWith('scripts/')) return ['automation', 'browser', 'thumbnail-generation']
  if (name === 'createLinkFields') return ['field-builder', 'configuration', 'navigation']
  if (name.startsWith('is')) return ['type-guard', 'validation', 'block-thumbnail']
  if (name.startsWith('get')) return ['registry', 'lookup', 'block-thumbnail']
  if (name.startsWith('wait')) return ['async', 'synchronization', 'preview']
  return ['component', 'preview', 'block-thumbnail']
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
    ...(file.path === 'src/block-thumbnails/definitions.ts'
      ? {
          languageNotes:
            'Uses a const registry plus derived union types to keep thumbnail slugs and metadata type-safe.',
        }
      : {}),
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
      summary: functionSummaries[fn.name] ?? `Implements the ${fn.name} behavior for this module.`,
      tags: functionTags(file.path, fn.name),
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

fs.writeFileSync(
  '.understand-anything/intermediate/batch-10.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
