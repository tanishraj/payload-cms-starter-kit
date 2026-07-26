import fs from 'node:fs'

const batches = JSON.parse(
  fs.readFileSync('.understand-anything/intermediate/batches.json', 'utf8'),
)
const batch = batches.batches.find((candidate) => candidate.batchIndex === 24)

if (!batch) throw new Error('Batch 24 not found')

fs.writeFileSync(
  '.understand-anything/tmp/ua-file-analyzer-input-24.json',
  `${JSON.stringify(
    {
      projectRoot: process.cwd(),
      batchFiles: batch.files,
      batchImportData: batch.batchImportData,
    },
    null,
    2,
  )}\n`,
)
