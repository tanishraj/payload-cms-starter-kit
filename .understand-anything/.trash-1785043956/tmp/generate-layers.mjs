import fs from 'node:fs'

const input = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-arch-input.json', 'utf8'),
)

const layers = [
  {
    id: 'layer:application-delivery',
    name: 'Application Routes & Delivery',
    description:
      'Next.js public routes, Payload admin shells, API handlers, metadata routes, previews, and request-facing application entry points.',
    nodeIds: [],
  },
  {
    id: 'layer:cms-model-governance',
    name: 'Payload Content Model & Governance',
    description:
      'Payload collections, globals, fields, access policies, lifecycle hooks, plugins, and the central CMS configuration that enforce editorial behavior.',
    nodeIds: [],
  },
  {
    id: 'layer:cms-block-system',
    name: 'CMS Block System',
    description:
      'Payload block schemas, server adapters, preview adapters, shared block contracts, and the renderer that turns managed layouts into page sections.',
    nodeIds: [],
  },
  {
    id: 'layer:frontend-ui-design-system',
    name: 'Frontend UI & Design System',
    description:
      'Reusable React presentations, UI primitives, live-preview clients, system-page views, global styles, theme tokens, and thumbnail-preview components.',
    nodeIds: [],
  },
  {
    id: 'layer:domain-services-runtime',
    name: 'Domain Services & Runtime',
    description:
      'Server-side data access, SEO and taxonomy logic, forms and reviews services, work-queue orchestration, media operations, and provider/runtime seams.',
    nodeIds: [],
  },
  {
    id: 'layer:test-verification',
    name: 'Test & Verification',
    description:
      'Vitest integration suites, Playwright end-to-end scenarios, fixtures, seed helpers, and boundary checks for the starter’s behavioral contracts.',
    nodeIds: [],
  },
  {
    id: 'layer:documentation-operations',
    name: 'Documentation & Operational Knowledge',
    description:
      'Project onboarding, operator guides, deployment runbooks, architecture maps, implementation plans, specifications, reviews, and agent guidance.',
    nodeIds: [],
  },
  {
    id: 'layer:infrastructure-tooling',
    name: 'Infrastructure, Build & Tooling',
    description:
      'Docker services and build stages, package and compiler configuration, framework tooling, test runners, formatting, and repository automation.',
    nodeIds: [],
  },
]

const layerByID = new Map(layers.map((layer) => [layer.id, layer]))

function assignment(node) {
  const filePath = node.filePath
  if (node.type === 'document') return 'layer:documentation-operations'
  if (node.type === 'service' || node.type === 'pipeline' || node.type === 'resource')
    return 'layer:infrastructure-tooling'
  if (filePath.startsWith('tests/')) return 'layer:test-verification'
  if (!filePath.startsWith('src/')) return 'layer:infrastructure-tooling'

  const relative = filePath.slice('src/'.length)
  if (relative.startsWith('app/')) return 'layer:application-delivery'
  if (relative.startsWith('blocks/')) return 'layer:cms-block-system'
  if (
    relative.startsWith('components/') ||
    relative.startsWith('styles/') ||
    relative.startsWith('block-thumbnails/')
  )
    return 'layer:frontend-ui-design-system'
  if (relative.startsWith('lib/') || relative.startsWith('config/'))
    return 'layer:domain-services-runtime'
  if (
    relative.startsWith('collections/') ||
    relative.startsWith('globals/') ||
    relative.startsWith('fields/') ||
    relative.startsWith('access/') ||
    relative.startsWith('hooks/') ||
    relative.startsWith('plugins/') ||
    relative === 'payload.config.ts'
  )
    return 'layer:cms-model-governance'

  throw new Error(`Unclassified file-level node: ${node.id}`)
}

for (const node of input.fileNodes) {
  layerByID.get(assignment(node)).nodeIds.push(node.id)
}

for (const layer of layers) layer.nodeIds.sort()
fs.writeFileSync(
  '.understand-anything/intermediate/layers.json',
  `${JSON.stringify(layers, null, 2)}\n`,
)
