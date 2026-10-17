import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { getRequiredTestDatabaseURI } from './testDatabaseSafety'
import type { GovernanceFixture } from './governanceFixtures'

export { accessManager, governanceSecondAdmin } from './governanceAccounts'
export type { GovernanceFixture } from './governanceFixtures'

type CleanupFixture = Pick<GovernanceFixture, 'queueSources' | 'pageIDs' | 'mediaIDs'>
type WorkerMessage =
  | { type: 'stage'; stage: string }
  | { type: 'result'; result?: GovernanceFixture }
  | { type: 'failure'; stage: string }

/** Keep Payload's config graph outside Playwright's worker transformer. */
function runFixture(
  command: 'seed' | 'cleanup' | 'seed-user',
  fixture?: CleanupFixture,
): Promise<GovernanceFixture | undefined> {
  // Validate before any child or database operation; never forward the URI to logs.
  const uri = getRequiredTestDatabaseURI()
  return new Promise((resolve, reject) => {
    let stage = 'starting'
    let received = false
    let result: GovernanceFixture | undefined
    const child = fork(
      fileURLToPath(new URL('./governanceFixtureWorker.mjs', import.meta.url)),
      [],
      {
        execArgv: [
          '--no-deprecation',
          '--no-experimental-strip-types',
          '--conditions=react-server',
          '--import=tsx/esm',
        ],
        env: { ...process.env, MONGODB_URI: uri, TEST_MONGODB_URI: uri, NODE_OPTIONS: '' },
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      },
    )
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`Governance fixture ${command} timed out during ${stage}.`))
    }, 90_000)
    child.on('message', (message: WorkerMessage) => {
      if (message.type === 'stage') stage = message.stage
      else if (message.type === 'result') {
        received = true
        result = message.result
      } else if (message.type === 'failure') {
        clearTimeout(timer)
        reject(new Error(`Governance fixture ${command} failed during ${message.stage}.`))
      }
    })
    child.once('error', () => {
      clearTimeout(timer)
      reject(new Error(`Governance fixture ${command} could not start.`))
    })
    child.once('close', (code, signal) => {
      clearTimeout(timer)
      if (code === 0 && received) resolve(result)
      else
        reject(
          new Error(
            `Governance fixture ${command} exited during ${stage}. Exit code: ${code}; signal: ${signal ?? 'none'}.`,
          ),
        )
    })
    child.send({ command, fixture })
  })
}

export async function seedGovernanceBase(): Promise<GovernanceFixture> {
  const result = await runFixture('seed')
  if (!result) throw new Error('Governance fixture seed returned no result.')
  return result
}

export async function cleanupGovernanceFixtures(fixture?: CleanupFixture): Promise<void> {
  await runFixture('cleanup', fixture)
}

/** Form journeys must not import Payload into Playwright's transformed worker. */
export async function seedBrowserTestUser(): Promise<void> {
  await runFixture('seed-user')
}
