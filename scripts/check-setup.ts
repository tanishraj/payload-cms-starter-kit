import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import nextEnv from '@next/env'

import { checkSetup, formatSetupChecks } from './lib/setupChecks'

export async function main(args = process.argv.slice(2)): Promise<number> {
  if (args.some((arg) => arg !== '--production') || args.length > 1) {
    console.log('Usage: pnpm setup:check [--production]')
    return 2
  }
  const root = fileURLToPath(new URL('../', import.meta.url))
  const production = args.includes('--production') || process.env.NODE_ENV === 'production'
  Object.assign(process.env, { NODE_ENV: production ? 'production' : 'development' })
  let loadFailed = false
  // Match Next's precedence and $ expansion; never forward dotenv errors or filenames.
  nextEnv.loadEnvConfig(root, !production, {
    info: () => {},
    error: () => {
      loadFailed = true
    },
  })
  if (loadFailed) {
    console.log(
      '[FAIL] Environment loading failed. Check the local Next.js environment files; no values or parser errors are printed.',
    )
    return 1
  }
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const checks = await checkSetup({
    env: { ...process.env },
    root,
    nodeVersion: process.versions.node,
    userAgent: process.env.npm_config_user_agent ?? '',
    engines: pkg.engines,
  })
  console.log(formatSetupChecks(checks))
  return checks.some(({ status }) => status === 'fail') ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then((code) => {
      process.exitCode = code
    })
    .catch(() => {
      console.log(
        '[FAIL] Setup checks could not complete. Verify dependencies are installed and consult docs/operations/developer-quickstart.md. Internal error details are withheld.',
      )
      process.exitCode = 1
    })
}
