import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-8.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 8)

if (!batch || !extraction.scriptCompleted || extraction.results.length !== batch.files.length) {
  throw new Error('Batch 8 inputs are incomplete')
}

const summaries = {
  'src/components/ContentActions.tsx':
    'Renders a responsive group of CMS-configured links using shared button variants and resolved internal or external destinations.',
  'src/components/content-highlights.tsx':
    'Renders a configurable editorial highlights section with multiple layouts, numbered items, dividers, and shared block appearance and spacing.',
  'src/components/feature-matrix.tsx':
    'Renders a responsive feature-comparison matrix with optional animated divider beams, headings, descriptions, and appearance controls.',
  'src/components/footer56.tsx':
    'Renders a structured marketing footer with brand content, navigation groups, social links, legal content, and block-level appearance settings.',
  'src/components/gallery-showcase-fan.tsx':
    'Implements the hydrated fan-style gallery layout, including responsive transforms and mobile visibility behavior.',
  'src/components/gallery-showcase.tsx':
    'Selects and renders gallery-showcase layouts while applying shared container spacing and appearance classes.',
  'src/components/image-mosaic.tsx':
    'Renders an asymmetric image mosaic with responsive layouts, optional calls to action, resolved CMS links, and configurable appearance.',
  'src/components/profile-carousel.tsx':
    'Prepares profile-card data and renders a responsive interactive profile carousel with configurable sizing, alignment, and appearance.',
  'src/components/services21.tsx':
    'Renders an interactive services list whose active item controls supporting copy and visual emphasis across responsive layouts.',
  'src/components/team-showcase.tsx':
    'Renders a responsive team-member showcase with image positioning, alignment, sizing, and shared block appearance controls.',
  'src/lib/cmsLinks.ts':
    'Resolves CMS link records and action arrays into normalized frontend destinations using navigation-link and page-path helpers.',
  'src/lib/media.ts':
    'Normalizes Payload media relationships into absolute image URLs, dimensions, and accessible alt-text properties.',
  'tests/int/content-highlights.int.spec.tsx':
    'Integration coverage for Content Highlights configuration and rendering across supported layouts, content, and appearance options.',
  'tests/int/feature-matrix.int.spec.ts':
    'Integration coverage for Feature Matrix schema, component rendering, page-block dispatch, and collection registration.',
  'tests/int/feature-spotlight.int.spec.ts':
    'Integration coverage for Feature Spotlight configuration, rendering behavior, and regular block-spacing conventions.',
  'tests/int/footer-spacing.int.spec.ts':
    'Guards the Footer component’s use of the shared regular-block spacing contract.',
  'tests/int/gallery-showcase.int.spec.ts':
    'Integration coverage for Gallery Showcase schema, fan presentation, block rendering, and Pages collection registration.',
  'tests/int/hero-banner-render.int.spec.ts':
    'Integration coverage for Hero Banner rendering, media output, actions, and configured visual variants.',
  'tests/int/profile-carousel.int.spec.ts':
    'Integration coverage for Profile Carousel schema, action fields, rendering, page-block dispatch, and collection registration.',
  'tests/int/qa-accordion.int.spec.ts':
    'Integration coverage for QA Accordion rich-text content, rendering, interaction markup, and shared spacing.',
  'tests/int/regular-block-spacing.int.spec.tsx':
    'Regression coverage ensuring regular content blocks share consistent container and mobile padding classes.',
  'tests/int/stats-strip-render.int.spec.ts':
    'Integration coverage for Stats Strip rendering and animated metric-value behavior.',
}

const functionSummaries = {
  ContentActions: 'Renders a responsive collection of resolved CMS actions as styled links.',
  ContentHighlightsIntro: 'Renders the introductory heading and description for a highlights section.',
  ContentHighlightItemComponent: 'Renders one numbered highlight item with its content and layout-specific decoration.',
  ContentHighlightsItems: 'Renders the collection of highlight items using the selected layout.',
  ContentHighlights: 'Composes the complete configurable Content Highlights section.',
  FeatureMatrixDividerBeam: 'Renders the decorative animated beam used between feature columns.',
  FeatureMatrix: 'Renders the complete responsive feature-comparison matrix.',
  Footer56: 'Renders the full Footer56 navigation and brand layout.',
  GalleryShowcaseFan: 'Renders a hydration-safe responsive fan arrangement for gallery images.',
  GalleryShowcase: 'Renders the selected gallery-showcase presentation with shared appearance controls.',
  ImageMosaic: 'Renders the responsive image mosaic and its optional content actions.',
  ProfileCarousel: 'Normalizes profile data and composes the interactive profile carousel.',
  usePrevious: 'Retains the previous value of component state for transition behavior.',
  Services21: 'Renders the interactive Services21 presentation and active-service content.',
  TeamShowcase: 'Renders the responsive team showcase from normalized member data.',
  resolveCmsLink: 'Resolves a CMS link record to a normalized frontend href and presentation metadata.',
  resolveCmsActions: 'Resolves and filters a list of CMS actions into renderable frontend links.',
  isMediaDoc: 'Determines whether a Payload media relationship contains a populated media document.',
  getMediaAbsoluteUrl: 'Resolves a media URL to an absolute site URL while preserving remote URLs.',
  getMediaAltFallback: 'Chooses the best accessible alt-text fallback from media and caller-provided values.',
  getMediaImageProps: 'Builds normalized image source, dimensions, and alt properties from a media relationship.',
  createRichText: 'Creates the minimal rich-text fixture structure used by QA Accordion integration tests.',
}

function complexity(lines) {
  if (lines > 200) return 'complex'
  if (lines >= 50) return 'moderate'
  return 'simple'
}

function fileTags(file) {
  if (file.path.startsWith('tests/')) {
    const feature = path.basename(file.path).split('.')[0]
    return ['test', 'integration-test', feature, 'regression']
  }
  if (file.path === 'src/lib/cmsLinks.ts') return ['utility', 'cms-links', 'navigation', 'serialization']
  if (file.path === 'src/lib/media.ts') return ['utility', 'media', 'image', 'serialization']
  return ['component', 'react', 'content-block', 'responsive-design']
}

function functionTags(filePath, name) {
  if (filePath.startsWith('tests/')) return ['test-fixture', 'rich-text', 'utility']
  if (name.startsWith('resolve')) return ['utility', 'navigation', 'serialization']
  if (name.startsWith('getMedia') || name === 'isMediaDoc') return ['utility', 'media', 'type-guard']
  if (name.startsWith('use')) return ['hook', 'react', 'state']
  return ['component', 'react', 'presentation']
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

const output = { nodes, edges }
fs.writeFileSync(
  '.understand-anything/intermediate/batch-8.json',
  `${JSON.stringify(output, null, 2)}\n`,
)
