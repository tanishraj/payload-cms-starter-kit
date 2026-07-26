import fs from 'node:fs'
import path from 'node:path'

const extraction = JSON.parse(
  fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-26.json', 'utf8'),
)
const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 26)

if (!batch || !extraction.scriptCompleted || extraction.filesSkipped.length !== batch.files.length) {
  throw new Error('Batch 26 skipped-file inputs are incomplete')
}

const summaries = {
  'src/styles/themes/theme-blue.css':
    'Defines blue-accented light and dark theme tokens for surfaces, text, interactive colors, charts, sidebars, radii, and shadows.',
  'src/styles/themes/theme-default.css':
    'Defines the baseline neutral light and dark theme, including blue primary colors, chart and sidebar palettes, Inter typography, radii, and shadows.',
  'src/styles/themes/theme-kodama.css':
    'Defines an earthy cream-and-green light and dark theme with serif typography, compact radii, and directional organic shadows.',
  'src/styles/themes/theme-sunset.css':
    'Defines a warm orange-and-rose light and dark theme with Montserrat typography, rounded geometry, chart colors, and soft elevated shadows.',
}

const nodes = batch.files.map((file) => ({
  id: `file:${file.path}`,
  type: 'file',
  name: path.basename(file.path),
  filePath: file.path,
  summary: summaries[file.path],
  tags: ['theme', 'css-variables', 'design-tokens', path.basename(file.path, '.css').replace('theme-', '')],
  complexity: file.sizeLines >= 50 ? 'moderate' : 'simple',
  languageNotes:
    'Uses OKLCH color tokens under data-theme selectors with a paired `.dark` variant.',
}))

const defaultThemeID = 'file:src/styles/themes/theme-default.css'
const edges = batch.files
  .filter((file) => file.path !== 'src/styles/themes/theme-default.css')
  .map((file) => ({
    source: `file:${file.path}`,
    target: defaultThemeID,
    type: 'related',
    direction: 'forward',
    weight: 0.5,
  }))

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
  '.understand-anything/intermediate/batch-26.json',
  `${JSON.stringify({ nodes, edges }, null, 2)}\n`,
)
