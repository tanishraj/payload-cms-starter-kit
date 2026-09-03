import Ajv, { type AnySchema, type ErrorObject } from 'ajv'

const severities = ['info', 'low', 'moderate', 'high', 'critical'] as const
const emittedSeverities = ['low', 'moderate', 'high', 'critical'] as const
const blockingSeverities = new Set<DependencySeverity>(['high', 'critical'])
const millisecondsPerDay = 24 * 60 * 60 * 1_000

export const productionAuditArguments = ['audit', '--prod', '--json', '--audit-level=low'] as const

export type DependencySeverity = (typeof severities)[number]

export type AuditCommandResult = {
  status: number | null
  signal: string | null
  stdout: string
  error?: unknown
}

export type DependencyAuditException = {
  advisoryId: number
  packageName: string
  vulnerableRange: string
  installedVersions: string[]
  reachability: string
  mitigation: string
  owner: string
  createdAt: string
  expiresAt: string
}

export type DependencyAuditExceptionDocument = {
  schemaVersion: 1
  exceptions: DependencyAuditException[]
}

export type DependencyAuditFinding = {
  advisoryId: number
  packageName: string
  vulnerableRange: string
  installedVersions: string[]
  severity: DependencySeverity
}

export type DependencyAuditCounts = Record<DependencySeverity, number>

export type DependencyAuditPolicyResult = {
  ok: boolean
  counts: DependencyAuditCounts
  findings: DependencyAuditFinding[]
  usedExceptionIdentities: string[]
  errors: string[]
}

type EvaluateDependencyAuditInput = {
  audit: AuditCommandResult
  exceptionDocument: unknown
  exceptionSchema: unknown
  now: Date
}

const emptyCounts = (): DependencyAuditCounts => ({
  info: 0,
  low: 0,
  moderate: 0,
  high: 0,
  critical: 0,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isSeverity = (value: unknown): value is DependencySeverity =>
  typeof value === 'string' && severities.includes(value as DependencySeverity)

const parseCalendarDate = (value: string): number | undefined => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined

  const timestamp = Date.parse(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return undefined

  return new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : undefined
}

const exceptionIdentity = (entry: DependencyAuditException): string =>
  `${entry.advisoryId}:${entry.packageName}`

const formatSchemaError = (error: ErrorObject | null | undefined): string => {
  const location = error?.instancePath || '/'
  const message = error?.message ?? 'schema validation failed'

  return `Exception document is invalid: ${location} ${message}.`
}

const validateExceptionDocument = (
  document: unknown,
  schema: unknown,
): { document?: DependencyAuditExceptionDocument; errors: string[] } => {
  try {
    const validator = new Ajv({ allErrors: true, strict: true }).compile(schema as AnySchema)

    if (!validator(document)) {
      return { errors: [formatSchemaError(validator.errors?.[0])] }
    }
  } catch {
    return { errors: ['Exception document is invalid: its JSON Schema could not be compiled.'] }
  }

  return { document: document as DependencyAuditExceptionDocument, errors: [] }
}

const parseAuditReport = (
  audit: AuditCommandResult,
): { counts?: DependencyAuditCounts; findings?: DependencyAuditFinding[]; error?: string } => {
  if (audit.error) {
    return { error: 'Audit execution failed: pnpm could not be started.' }
  }

  if (audit.signal !== null) {
    return { error: 'Audit execution failed: pnpm terminated before producing a report.' }
  }

  if (audit.status !== 0 && audit.status !== 1) {
    return { error: 'Audit execution failed: pnpm returned an unsupported exit code.' }
  }

  if (audit.stdout.trim().length === 0) {
    return { error: 'Audit execution failed: pnpm returned an empty report.' }
  }

  let report: unknown
  try {
    report = JSON.parse(audit.stdout) as unknown
  } catch {
    return { error: 'Audit execution failed: pnpm returned malformed JSON.' }
  }

  if (!isRecord(report) || !isRecord(report.advisories) || !isRecord(report.metadata)) {
    return { error: 'Audit execution failed: pnpm returned an unsupported report shape.' }
  }

  const vulnerabilities = report.metadata.vulnerabilities
  if (!isRecord(vulnerabilities)) {
    return { error: 'Audit execution failed: pnpm returned an unsupported report shape.' }
  }

  const counts = emptyCounts()
  for (const severity of severities) {
    const count = vulnerabilities[severity]
    if (!Number.isInteger(count) || (count as number) < 0) {
      return { error: 'Audit execution failed: pnpm returned an unsupported report shape.' }
    }
    counts[severity] = count as number
  }

  const findings: DependencyAuditFinding[] = []
  const advisoryIdentities = new Set<string>()
  for (const [advisoryKey, advisoryValue] of Object.entries(report.advisories)) {
    if (
      !isRecord(advisoryValue) ||
      !Number.isInteger(advisoryValue.id) ||
      typeof advisoryValue.module_name !== 'string' ||
      advisoryValue.module_name.length === 0 ||
      typeof advisoryValue.vulnerable_versions !== 'string' ||
      advisoryValue.vulnerable_versions.length === 0 ||
      !isSeverity(advisoryValue.severity) ||
      !Array.isArray(advisoryValue.findings) ||
      advisoryValue.findings.length === 0
    ) {
      return { error: 'Audit execution failed: pnpm returned an unsupported report shape.' }
    }

    const canonicalIdentity = String(advisoryValue.id)
    if (advisoryIdentities.has(canonicalIdentity)) {
      return { error: 'Audit execution failed: pnpm returned duplicate advisory identities.' }
    }
    advisoryIdentities.add(canonicalIdentity)

    if (advisoryKey !== canonicalIdentity) {
      return { error: 'Audit execution failed: pnpm returned a mismatched advisory identity.' }
    }

    const installedVersions = new Set<string>()
    for (const finding of advisoryValue.findings) {
      if (
        !isRecord(finding) ||
        typeof finding.version !== 'string' ||
        finding.version.length === 0 ||
        !Array.isArray(finding.paths) ||
        !finding.paths.every((path) => typeof path === 'string')
      ) {
        return { error: 'Audit execution failed: pnpm returned an unsupported report shape.' }
      }
      installedVersions.add(finding.version)
    }

    findings.push({
      advisoryId: advisoryValue.id as number,
      packageName: advisoryValue.module_name,
      vulnerableRange: advisoryValue.vulnerable_versions,
      installedVersions: [...installedVersions].sort(),
      severity: advisoryValue.severity,
    })
  }

  const derivedCounts = emptyCounts()
  for (const finding of findings) derivedCounts[finding.severity] += 1
  if (emittedSeverities.some((severity) => derivedCounts[severity] !== counts[severity])) {
    return { error: 'Audit execution failed: pnpm returned inconsistent severity counts.' }
  }

  const hasEmittedFinding = findings.some(({ severity }) => severity !== 'info')
  if ((audit.status === 0 && hasEmittedFinding) || (audit.status === 1 && !hasEmittedFinding)) {
    return {
      error: 'Audit execution failed: pnpm exit code did not match the low audit threshold.',
    }
  }

  return { counts, findings }
}

const equalVersionSets = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false

  const leftSet = new Set(left)
  return leftSet.size === right.length && right.every((version) => leftSet.has(version))
}

export const evaluateDependencyAudit = ({
  audit,
  exceptionDocument,
  exceptionSchema,
  now,
}: EvaluateDependencyAuditInput): DependencyAuditPolicyResult => {
  const schemaValidation = validateExceptionDocument(exceptionDocument, exceptionSchema)
  const parsedAudit = parseAuditReport(audit)
  const counts = parsedAudit.counts ?? emptyCounts()
  const findings = parsedAudit.findings ?? []
  const errors = [...schemaValidation.errors]

  if (parsedAudit.error) errors.push(parsedAudit.error)
  if (!schemaValidation.document || parsedAudit.error) {
    return { ok: false, counts, findings, usedExceptionIdentities: [], errors }
  }

  const document = schemaValidation.document
  const validEntryIndexes = new Set<number>()
  const identityCounts = new Map<string, number>()
  const currentDate = now.toISOString().slice(0, 10)

  document.exceptions.forEach((entry, index) => {
    const identity = exceptionIdentity(entry)
    identityCounts.set(identity, (identityCounts.get(identity) ?? 0) + 1)

    if (
      [
        entry.packageName,
        entry.vulnerableRange,
        entry.reachability,
        entry.mitigation,
        entry.owner,
      ].some((value) => value.trim().length === 0) ||
      entry.installedVersions.some((version) => version.trim().length === 0)
    ) {
      errors.push(`Exception ${identity} must use non-empty, non-whitespace values.`)
      return
    }

    const createdAt = parseCalendarDate(entry.createdAt)
    const expiresAt = parseCalendarDate(entry.expiresAt)
    if (createdAt === undefined || expiresAt === undefined) {
      errors.push(`Exception ${identity} must use valid YYYY-MM-DD calendar dates.`)
      return
    }
    if (expiresAt < createdAt) {
      errors.push(`Exception ${identity} expires before it is created.`)
      return
    }
    if ((expiresAt - createdAt) / millisecondsPerDay > 30) {
      errors.push(`Exception ${identity} spans more than 30 calendar days.`)
      return
    }
    if (entry.expiresAt < currentDate) {
      errors.push(`Exception ${identity} is expired.`)
      return
    }

    validEntryIndexes.add(index)
  })

  for (const [identity, count] of identityCounts) {
    if (count > 1) errors.push(`Duplicate exception identity ${identity} is not allowed.`)
  }

  const usedEntryIndexes = new Set<number>()
  const usedExceptionIdentities: string[] = []

  for (const finding of findings.filter(({ severity }) => blockingSeverities.has(severity))) {
    const matchingIndexes = document.exceptions.flatMap((entry, index) =>
      validEntryIndexes.has(index) &&
      entry.advisoryId === finding.advisoryId &&
      entry.packageName === finding.packageName &&
      entry.vulnerableRange === finding.vulnerableRange &&
      equalVersionSets(entry.installedVersions, finding.installedVersions)
        ? [index]
        : [],
    )

    if (matchingIndexes.length === 1) {
      usedEntryIndexes.add(matchingIndexes[0]!)
      usedExceptionIdentities.push(exceptionIdentity(document.exceptions[matchingIndexes[0]!]!))
    } else if (matchingIndexes.length > 1) {
      errors.push(
        `Ambiguous exception match for advisory ${finding.advisoryId} affecting ${finding.packageName}.`,
      )
    } else {
      errors.push(
        `Unexcepted ${finding.severity} advisory ${finding.advisoryId} affects ${finding.packageName} ${finding.installedVersions.join(', ')} (${finding.vulnerableRange}).`,
      )
    }
  }

  document.exceptions.forEach((entry, index) => {
    if (!usedEntryIndexes.has(index)) {
      errors.push(`Unused exception ${exceptionIdentity(entry)} is not allowed.`)
    }
  })

  const uniqueErrors = [...new Set(errors)]
  return {
    ok: uniqueErrors.length === 0,
    counts,
    findings,
    usedExceptionIdentities: [...new Set(usedExceptionIdentities)].sort(),
    errors: uniqueErrors,
  }
}

export const formatDependencyAuditResult = (result: DependencyAuditPolicyResult): string => {
  const lines = [
    `Production dependency audit: ${result.ok ? 'PASS' : 'FAIL'}`,
    `Severity counts: critical ${result.counts.critical}, high ${result.counts.high}, moderate ${result.counts.moderate}, low ${result.counts.low}, info ${result.counts.info}`,
  ]

  if (result.findings.length > 0) {
    lines.push('Visible findings:')
    for (const finding of result.findings) {
      lines.push(
        `- ${finding.severity} advisory ${finding.advisoryId}: ${finding.packageName} ${finding.installedVersions.join(', ')} (${finding.vulnerableRange})`,
      )
    }
  }

  if (result.usedExceptionIdentities.length > 0) {
    lines.push(`Applied exceptions: ${result.usedExceptionIdentities.join(', ')}`)
  }

  if (result.errors.length > 0) {
    lines.push('Policy errors:', ...result.errors.map((error) => `- ${error}`))
  }

  return lines.join('\n')
}
