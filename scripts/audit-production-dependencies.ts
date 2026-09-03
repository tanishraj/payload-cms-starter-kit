import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import {
  evaluateDependencyAudit,
  formatDependencyAuditResult,
  productionAuditArguments,
} from '../src/domains/governance/dependencyAudit'

const root = process.cwd()
const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(path.join(root, relativePath), 'utf8')) as unknown

const run = (): number => {
  let exceptionDocument: unknown
  let exceptionSchema: unknown

  try {
    exceptionDocument = readJson('security/dependency-audit-exceptions.json')
    exceptionSchema = readJson('security/dependency-audit-exceptions.schema.json')
  } catch {
    console.error('Production dependency audit: FAIL')
    console.error('Policy errors:')
    console.error('- Audit policy files could not be read as JSON.')
    return 1
  }

  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  const audit = spawnSync(command, [...productionAuditArguments], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const result = evaluateDependencyAudit({
    audit: {
      status: audit.status,
      signal: audit.signal,
      stdout: audit.stdout ?? '',
      error: audit.error,
    },
    exceptionDocument,
    exceptionSchema,
    now: new Date(),
  })

  const output = formatDependencyAuditResult(result)
  if (result.ok) console.log(output)
  else console.error(output)

  return result.ok ? 0 : 1
}

process.exitCode = run()
