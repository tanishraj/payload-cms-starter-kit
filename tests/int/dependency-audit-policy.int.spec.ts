import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  evaluateDependencyAudit,
  formatDependencyAuditResult,
  productionAuditArguments,
  type AuditCommandResult,
  type DependencyAuditException,
  type DependencyAuditExceptionDocument,
} from '@/domains/governance/dependencyAudit'

const exceptionSchema = JSON.parse(
  readFileSync('security/dependency-audit-exceptions.schema.json', 'utf8'),
) as unknown

const evaluationDate = new Date('2026-09-03T12:00:00.000Z')

const advisory = ({
  id = 1158521,
  packageName = 'fast-uri',
  range = '>=3.1.3 <3.1.6',
  severity = 'high',
  versions = ['3.1.3'],
}: {
  id?: number
  packageName?: string
  range?: string
  severity?: 'critical' | 'high' | 'moderate' | 'low' | 'info'
  versions?: string[]
} = {}) => ({
  findings: versions.map((version) => ({
    version,
    paths: [`payload-cms-next-tailwind-shadcn-starter-kit>private-parent>${packageName}`],
    dev: false,
    optional: false,
    bundled: false,
  })),
  id,
  title: `${packageName} advisory`,
  module_name: packageName,
  vulnerable_versions: range,
  patched_versions: '>=999.0.0',
  severity,
  cwe: ['CWE-1'],
  github_advisory_id: 'GHSA-test-test-test',
  url: `https://github.com/advisories/GHSA-test-test-test`,
})

const auditReport = (...entries: ReturnType<typeof advisory>[]) => {
  const counts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0 }

  for (const entry of entries) counts[entry.severity] += 1

  return JSON.stringify({
    advisories: Object.fromEntries(entries.map((entry) => [String(entry.id), entry])),
    metadata: {
      vulnerabilities: counts,
      dependencies: 100,
      devDependencies: 20,
      optionalDependencies: 0,
      totalDependencies: 120,
    },
  })
}

const auditReportFromMap = (
  advisories: Record<string, ReturnType<typeof advisory>>,
  countOverrides: Partial<Record<'info' | 'low' | 'moderate' | 'high' | 'critical', number>> = {},
) => {
  const entries = Object.values(advisories)
  const counts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0 }
  for (const entry of entries) counts[entry.severity] += 1

  return JSON.stringify({
    advisories,
    metadata: {
      vulnerabilities: { ...counts, ...countOverrides },
      dependencies: 100,
      devDependencies: 20,
      optionalDependencies: 0,
      totalDependencies: 120,
    },
  })
}

const command = (
  stdout: string,
  overrides: Partial<AuditCommandResult> = {},
): AuditCommandResult => ({
  status: 0,
  signal: null,
  stdout,
  error: undefined,
  ...overrides,
})

const emptyExceptions = (): DependencyAuditExceptionDocument => ({
  schemaVersion: 1,
  exceptions: [],
})

const validException = (
  overrides: Partial<DependencyAuditExceptionDocument['exceptions'][number]> = {},
): DependencyAuditExceptionDocument['exceptions'][number] => ({
  advisoryId: 1158521,
  packageName: 'fast-uri',
  vulnerableRange: '>=3.1.3 <3.1.6',
  installedVersions: ['3.1.3'],
  reachability: 'Reachable only while compiling trusted schemas.',
  mitigation: 'Restrict inputs and deploy the patched lockfile before expiry.',
  owner: 'Platform Security',
  createdAt: '2026-09-03',
  expiresAt: '2026-10-03',
  ...overrides,
})

const evaluate = ({
  audit = command(auditReport()),
  exceptions = emptyExceptions(),
}: {
  audit?: AuditCommandResult
  exceptions?: unknown
} = {}) =>
  evaluateDependencyAudit({
    audit,
    exceptionDocument: exceptions,
    exceptionSchema,
    now: evaluationDate,
  })

describe('production dependency audit execution contract', () => {
  it('pins the CLI to a low threshold so moderate and low findings stay visible', () => {
    expect(productionAuditArguments).toEqual(['audit', '--prod', '--json', '--audit-level=low'])
  })

  it('accepts a clean report with exit code zero', () => {
    const result = evaluate({ audit: command(auditReport()) })

    expect(result.ok).toBe(true)
    expect(result.counts).toEqual({ info: 0, low: 0, moderate: 0, high: 0, critical: 0 })
  })

  it('keeps parseable exit-one moderate findings visible without failing policy', () => {
    const result = evaluate({
      audit: command(auditReport(advisory({ severity: 'moderate' })), { status: 1 }),
    })

    expect(result.ok).toBe(true)
    expect(result.counts.moderate).toBe(1)
    expect(result.findings).toEqual([
      expect.objectContaining({
        advisoryId: 1158521,
        packageName: 'fast-uri',
        severity: 'moderate',
      }),
    ])
  })

  it('treats exit code one as parseable advisory data when a high advisory is emitted', () => {
    const result = evaluate({
      audit: command(auditReport(advisory()), { status: 1 }),
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'Unexcepted high advisory 1158521 affects fast-uri 3.1.3 (>=3.1.3 <3.1.6).',
    )
    expect(result.errors).not.toContainEqual(expect.stringMatching(/^Audit execution failed:/))
  })

  it('accepts exit zero when metadata has omitted info advisories', () => {
    const result = evaluate({
      audit: command(auditReportFromMap({}, { info: 2 })),
    })

    expect(result.ok).toBe(true)
    expect(result.counts.info).toBe(2)
    expect(result.findings).toEqual([])
  })

  it('rejects exit zero when an excepted high advisory is emitted', () => {
    const result = evaluate({
      audit: command(auditReport(advisory())),
      exceptions: { schemaVersion: 1, exceptions: [validException()] },
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'Audit execution failed: pnpm exit code did not match the low audit threshold.',
    )
  })

  it('rejects exit one without an advisory at the selected threshold', () => {
    const result = evaluate({ audit: command(auditReport(), { status: 1 }) })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'Audit execution failed: pnpm exit code did not match the low audit threshold.',
    )
  })

  it('rejects an advisory whose map key does not match its canonical identity', () => {
    const result = evaluate({
      audit: command(auditReportFromMap({ 'not-the-advisory-id': advisory() }), { status: 1 }),
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'Audit execution failed: pnpm returned a mismatched advisory identity.',
    )
  })

  it('rejects duplicate canonical advisory identities', () => {
    const duplicate = advisory()
    const result = evaluate({
      audit: command(
        auditReportFromMap({
          '1158521': advisory(),
          duplicate,
        }),
        { status: 1 },
      ),
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      'Audit execution failed: pnpm returned duplicate advisory identities.',
    )
  })

  it.each([
    { name: 'non-1 failure exit', audit: command('', { status: 2 }) },
    {
      name: 'terminated process',
      audit: command(auditReport(), { status: null, signal: 'SIGTERM' }),
    },
    {
      name: 'spawn error',
      audit: command('', { status: null, error: new Error('sensitive detail') }),
    },
    { name: 'empty output', audit: command('') },
    { name: 'malformed JSON', audit: command('{ definitely not JSON') },
    {
      name: 'unsupported JSON shape',
      audit: command(JSON.stringify({ auditReportVersion: 2, vulnerabilities: {} })),
    },
  ])('fails closed for $name', ({ audit }) => {
    const result = evaluate({ audit })

    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringMatching(/^Audit execution failed:/))
  })
})

describe('high and critical production audit policy', () => {
  it.each(['high', 'critical'] as const)('rejects an unexcepted %s advisory', (severity) => {
    const result = evaluate({
      audit: command(auditReport(advisory({ severity })), { status: 1 }),
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain(
      `Unexcepted ${severity} advisory 1158521 affects fast-uri 3.1.3 (${`>=3.1.3 <3.1.6`}).`,
    )
  })

  it('accepts exactly one fully matching exception', () => {
    const result = evaluate({
      audit: command(auditReport(advisory()), { status: 1 }),
      exceptions: { schemaVersion: 1, exceptions: [validException()] },
    })

    expect(result.ok).toBe(true)
    expect(result.usedExceptionIdentities).toEqual(['1158521:fast-uri'])
  })

  const mismatchCases: Array<[string, Partial<DependencyAuditException>]> = [
    ['advisory identity', { advisoryId: 1158522 }],
    ['package', { packageName: 'other-package' }],
    ['vulnerable range', { vulnerableRange: '<3.1.6' }],
    ['installed version', { installedVersions: ['3.1.2'] }],
    ['missing installed version', { installedVersions: ['3.1.3'] }],
    ['extra installed version', { installedVersions: ['3.1.3', '3.1.4', '99.0.0'] }],
  ]

  it.each(mismatchCases)(
    'rejects an exception with the wrong or incomplete %s match',
    (_name, overrides) => {
      const versions = _name === 'missing installed version' ? ['3.1.3', '3.1.4'] : ['3.1.3']
      const result = evaluate({
        audit: command(auditReport(advisory({ versions })), { status: 1 }),
        exceptions: { schemaVersion: 1, exceptions: [validException(overrides)] },
      })

      expect(result.ok).toBe(false)
      expect(result.usedExceptionIdentities).toEqual([])
    },
  )

  it('rejects duplicate and therefore ambiguous exception entries', () => {
    const duplicate = validException({ mitigation: 'A second proposed mitigation.' })
    const result = evaluate({
      audit: command(auditReport(advisory()), { status: 1 }),
      exceptions: { schemaVersion: 1, exceptions: [validException(), duplicate] },
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Duplicate exception identity 1158521:fast-uri is not allowed.')
    expect(result.errors).toContain(
      'Ambiguous exception match for advisory 1158521 affecting fast-uri.',
    )
  })

  it('rejects unused and overly broad exception entries', () => {
    const result = evaluate({
      audit: command(auditReport(advisory({ severity: 'moderate' })), { status: 1 }),
      exceptions: {
        schemaVersion: 1,
        exceptions: [validException({ installedVersions: ['3.1.3', '99.0.0'] })],
      },
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('Unused exception 1158521:fast-uri is not allowed.')
  })
})

describe('exception document validation', () => {
  const structuralCases: Array<[string, Record<string, unknown>]> = [
    ['unknown fields', { unexpected: 'not allowed' }],
    ['missing reachability', { reachability: undefined }],
    ['missing mitigation', { mitigation: undefined }],
    ['missing owner', { owner: undefined }],
  ]

  it.each(structuralCases)('rejects %s', (_name, mutation) => {
    const exception: Record<string, unknown> = { ...validException(), ...mutation }
    for (const [key, value] of Object.entries(exception)) {
      if (value === undefined) delete exception[key]
    }

    const result = evaluate({
      exceptions: { schemaVersion: 1, exceptions: [exception] },
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringMatching(/^Exception document is invalid:/))
  })

  it.each([
    ['invalid created date', { createdAt: '2026-02-30' }],
    ['invalid expiry date', { expiresAt: '03/10/2026' }],
    ['expiry before creation', { createdAt: '2026-09-03', expiresAt: '2026-09-02' }],
    ['more than 30 calendar days', { createdAt: '2026-09-03', expiresAt: '2026-10-04' }],
    ['expired', { createdAt: '2026-08-01', expiresAt: '2026-08-30' }],
    ['blank reachability', { reachability: '   ' }],
    ['blank mitigation', { mitigation: '\t' }],
    ['blank owner', { owner: ' ' }],
  ] as const)('rejects %s', (_name, overrides) => {
    const result = evaluate({
      exceptions: { schemaVersion: 1, exceptions: [validException(overrides)] },
    })

    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})

describe('sanitized policy output', () => {
  it('never includes dependency paths or raw process errors', () => {
    const privatePath =
      'payload-cms-next-tailwind-shadcn-starter-kit>private-parent>node_modules>fast-uri'
    const report = JSON.parse(auditReport(advisory())) as {
      advisories: Record<string, { findings: Array<{ paths: string[] }> }>
    }
    Object.values(report.advisories)[0]!.findings[0]!.paths = [privatePath]

    const auditResult = evaluate({
      audit: command(JSON.stringify(report), { status: 1 }),
    })
    const executionResult = evaluate({
      audit: command('', { status: null, error: new Error('/private/workspace secret-token') }),
    })
    const output = `${formatDependencyAuditResult(auditResult)}\n${formatDependencyAuditResult(executionResult)}`

    expect(output).not.toContain(privatePath)
    expect(output).not.toContain('/private/workspace')
    expect(output).not.toContain('secret-token')
    expect(output).toContain('1158521')
    expect(output).toContain('fast-uri')
  })
})
