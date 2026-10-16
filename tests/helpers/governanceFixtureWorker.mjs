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
    if (command !== 'seed' && command !== 'cleanup') throw new Error('Unsupported fixture command')
    report('Payload runtime import')
    const { getPayload } = await import('payload')
    report('fixture module import')
    const helpers = await import('./governanceFixtures.ts')
    report(command === 'seed' ? 'fixture seed' : 'fixture cleanup')
    const result =
      command === 'seed'
        ? await helpers.seedGovernanceBase()
        : await helpers.cleanupGovernanceFixtures(fixture)
    report('database shutdown')
    const { default: config } = await import('../../src/payload.config.ts')
    const payload = await getPayload({ config })
    await payload.destroy()
    process.send?.({ type: 'result', result }, () => process.exit(0))
  } catch {
    // Raw driver/config errors can include credentials. Emit only the known stage.
    process.send?.({ type: 'failure', stage }, () => process.exit(1))
  }
})
