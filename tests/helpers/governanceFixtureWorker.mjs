// Test-only process boundary: no Playwright transform hooks or application endpoint.
// Retain an IPC listener throughout async loading and stop if the parent disappears.
process.once('disconnect', () => process.exit(1))
process.once('message', async ({ command, fixture }) => {
  let stage = 'database guard'
  const report = (next) => {
    stage = next
    process.send?.({ type: 'stage', stage })
  }
  try {
    const { getRequiredTestDatabaseURI } = await import('./testDatabaseSafety.ts')
    process.env.MONGODB_URI = getRequiredTestDatabaseURI()
    if (!['seed', 'cleanup', 'seed-user'].includes(command))
      throw new Error('Unsupported fixture command')
    // Apply the upstream Lexical CLI resolution fix only in this test process.
    // Node's async register API supports the complete declared Node 22 range.
    const { register } = await import('node:module')
    register('./lexicalFixtureLoader.mjs', import.meta.url, {
      data: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    })
    report('Payload runtime import')
    const { getPayload } = await import('payload')
    // Boot the canonical application graph before loading fixture helpers, which
    // also import application hooks. Otherwise their graphs can wait on each other.
    report('Payload config import')
    const { default: config } = await import('../../src/payload.config.js')
    report('database initialization')
    const payload = await getPayload({ config })
    report('fixture module import')
    const helpers = await import(
      command === 'seed-user' ? './seedUser.ts' : './governanceFixtures.ts'
    )
    report(command === 'cleanup' ? 'fixture cleanup' : 'fixture seed')
    const result =
      command === 'seed-user'
        ? await helpers.seedTestUser()
        : command === 'seed'
          ? await helpers.seedGovernanceBase()
          : await helpers.cleanupGovernanceFixtures(fixture)
    report('database shutdown')
    await payload.destroy()
    process.send?.({ type: 'result', result }, () => process.exit(0))
  } catch {
    // Raw driver/config errors can include credentials. Emit only the known stage.
    process.send?.({ type: 'failure', stage }, () => process.exit(1))
  }
})
