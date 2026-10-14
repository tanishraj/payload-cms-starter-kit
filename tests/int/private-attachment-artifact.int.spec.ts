// @vitest-environment node
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { verifyPrivateAttachmentArtifact } from '../../scripts/verify-private-attachment-artifact.mjs'

const roots: string[] = []
const fixture = async (files: string[] = ['node_modules/payload/index.js']) => {
  const root = await mkdtemp(path.join(tmpdir(), 'private-artifact-test-'))
  roots.push(root)
  await mkdir(path.join(root, 'server'), { recursive: true })
  await mkdir(path.join(root, 'standalone'), { recursive: true })
  await writeFile(path.join(root, 'server/route.js.nft.json'), JSON.stringify({ files }))
  return root
}
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})
describe('private upload production artifact boundary', () => {
  it('accepts a clean standalone artifact', async () =>
    expect(await verifyPrivateAttachmentArtifact(await fixture())).toEqual({
      traces: 1,
      privateUploadsIncluded: false,
    }))
  it.each(['../../.private/form-attachments/uuid', '..\\..\\.private\\form-attachments\\uuid'])(
    'rejects private paths in a trace: %s',
    async (value) =>
      await expect(verifyPrivateAttachmentArtifact(await fixture([value]))).rejects.toThrow(
        /[Pp]rivate/,
      ),
  )
  it('rejects a private directory in the standalone bundle', async () => {
    const root = await fixture()
    await mkdir(path.join(root, 'standalone/.private'))
    await expect(verifyPrivateAttachmentArtifact(root)).rejects.toThrow('Private local uploads')
  })
  it('fails closed without verifiable traces', async () => {
    const root = await fixture()
    await rm(path.join(root, 'server/route.js.nft.json'))
    await expect(verifyPrivateAttachmentArtifact(root)).rejects.toThrow('No production file traces')
  })
  it('keeps private data out of Docker context and gates every production build', () => {
    expect(readFileSync('.dockerignore', 'utf8').split(/\r?\n/)).toContain('.private')
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    expect(scripts.build).toMatch(
      /next build && node scripts\/verify-private-attachment-artifact\.mjs$/,
    )
    expect(readFileSync('next.config.ts', 'utf8')).toContain(
      "outputFileTracingExcludes: { '**/*': ['./.private/**/*'] }",
    )
  })
})
