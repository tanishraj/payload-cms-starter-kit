import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/** Read-only production gate. Inspect traces and bundle paths, never private bytes. */
export async function verifyPrivateAttachmentArtifact(distDir = path.resolve('.next')) {
  const standalone = path.join(distDir, 'standalone')
  if (!(await stat(standalone)).isDirectory())
    throw new Error('Standalone build output is unavailable.')
  let traces = 0
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === '.private')
        throw new Error('Private local uploads were included in production output.')
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) await inspect(target)
      else if (entry.name.endsWith('.nft.json')) {
        const trace = JSON.parse(await readFile(target, 'utf8'))
        if (!Array.isArray(trace.files) || trace.files.some((file) => typeof file !== 'string'))
          throw new Error('Invalid production file trace.')
        if (trace.files.some((file) => file.replaceAll('\\', '/').split('/').includes('.private')))
          throw new Error('Private local uploads were included in a production file trace.')
        traces++
      }
    }
  }
  // Server traces cover both normal deployment and copies inside standalone output.
  await inspect(distDir)
  if (!traces) throw new Error('No production file traces were found.')
  return { traces, privateUploadsIncluded: false }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(await verifyPrivateAttachmentArtifact()))
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Unable to verify private upload exclusion.',
    )
    process.exitCode = 1
  }
}
