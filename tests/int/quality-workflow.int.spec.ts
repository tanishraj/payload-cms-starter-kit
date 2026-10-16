import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { assertSafeTestDatabaseURI } from '../helpers/testDatabaseSafety'

const leastPrivilegePermissions = 'permissions:\n  contents: read'
const approvedActions = [
  'actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4',
  'pnpm/action-setup@f40ffcd9367d9f12939873eb1018b921a783ffaa # v4',
  'actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4',
  'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4',
] as const

const expectedRunSteps = [
  ['Install dependencies', 'pnpm install --frozen-lockfile'],
  ['Audit production dependencies', 'pnpm audit:prod'],
  ['Install Playwright Chromium', 'pnpm exec playwright install --with-deps chromium'],
  ['Start isolated MongoDB replica', 'pnpm ci:mongodb:start'],
  ['Generate Payload types', 'pnpm generate:types'],
  ['Generate Payload Admin import map', 'pnpm generate:importmap'],
  [
    'Reject generated artifact drift',
    "git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'",
  ],
  ['Check TypeScript', 'pnpm exec tsc --noEmit'],
  ['Lint', 'pnpm lint'],
  ['Run integration tests', 'pnpm test:int'],
  ['Run critical governance journeys', 'pnpm test:e2e:governance'],
  ['Run native dynamic-form journey', 'pnpm test:e2e:forms'],
  ['Clean generated Next output', 'rm -rf .next'],
  ['Build the Vercel production application', 'pnpm build'],
  ['Stop isolated MongoDB replica', 'pnpm ci:mongodb:stop'],
] as const

const safeCIEnvironment = {
  ALLOW_FIRST_ADMIN_CREATION: 'false',
  ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'false',
  CI_MONGO_CONTAINER: 'payload-hardening-ci-${{ github.run_id }}-${{ github.run_attempt }}',
  CI_MONGO_OWNER: '${{ github.run_id }}:${{ github.run_attempt }}',
  EMAIL_PROVIDER: 'none',
  FIRST_ADMIN_EMAIL: '',
  MEDIA_PROVIDER: 'localDisk',
  MEDIA_RECONCILE_TOKEN: '',
  MONGODB_URI:
    'mongodb://127.0.0.1:27017/payload-hardening-ci_test?replicaSet=rs0&directConnection=true',
  MONGOMS_VERSION: '8.0.29',
  NEXT_PUBLIC_SERVER_URL: 'https://ci.example.invalid',
  PAYLOAD_SECRET: 'ci-only-payload-secret-32-characters',
  RESEND_API_KEY: '',
  RESEND_FROM_EMAIL: '',
  RESEND_FROM_NAME: '',
  RESEND_OVERRIDE_TO_EMAIL: '',
  S3_ACCESS_KEY_ID: '',
  S3_ACL: '',
  S3_BUCKET: '',
  S3_CLIENT_UPLOADS: '',
  S3_ENDPOINT: '',
  S3_FORCE_PATH_STYLE: '',
  S3_PUBLIC_URL: '',
  S3_REGION: '',
  S3_SECRET_ACCESS_KEY: '',
  TEST_MONGODB_URI:
    'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true',
  VERCEL: '',
} as const

function unquoteYAMLValue(value: string): string {
  return value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value
}

function getTopLevelPermissionsBlock(source: string): string | undefined {
  return source.match(/^permissions:[^\n]*(?:\n {2}[^\n]*)*/m)?.[0]
}

function getPermissionContractViolations(source: string): string[] {
  const violations: string[] = []
  const jobsStart = source.indexOf('\njobs:\n')
  const jobsSource = jobsStart >= 0 ? source.slice(jobsStart + 1) : source

  if (getTopLevelPermissionsBlock(source) !== leastPrivilegePermissions) {
    violations.push('top-level permissions are not exactly contents: read')
  }
  if (/^    permissions:(?:[ \t]+[^\n]+)?[ \t]*$/m.test(jobsSource)) {
    violations.push('verify job overrides top-level permissions')
  }
  if (/^[ \t]+[a-z][a-z-]*:[ \t]*write[ \t]*$/m.test(source)) {
    violations.push('workflow grants a write-capable permission scope')
  }

  return violations
}

function collectWorkflowActions(source: string): string[] {
  return [
    ...source.matchAll(/^[ \t]*(?:-[ \t]+)?uses:[ \t]+([^ \t#\n]+)(?:[ \t]+#[ \t]*(.+))?[ \t]*$/gm),
  ].map((match) => `${match[1]}${match[2] ? ` # ${match[2].trim()}` : ''}`)
}

function collectWorkflowRunCommands(source: string): string[] {
  return [...source.matchAll(/^[ \t]*(?:-[ \t]+)?run:[ \t]*(.*)$/gm)].map((match) => {
    const command = match[1]?.trim() ?? ''

    if (/^[|>][+-]?$/.test(command)) {
      throw new Error('Block-scalar run commands are unsupported by this workflow contract.')
    }
    if (!command) {
      throw new Error('Every run command must use a non-empty inline scalar.')
    }

    return command
  })
}

describe('quality workflow contract', () => {
  it('keeps one bounded read-only job with immutable setup actions and replica cleanup', () => {
    const source = readFileSync('.github/workflows/quality.yml', 'utf8')
    const jobsSource = source.slice(source.indexOf('\njobs:\n') + '\njobs:\n'.length)
    const jobNames = [...jobsSource.matchAll(/^  ([a-z][a-z0-9_-]*):$/gm)].map((match) => match[1])

    expect(jobNames).toEqual(['verify'])
    expect(getTopLevelPermissionsBlock(source)).toBe(leastPrivilegePermissions)
    expect(getPermissionContractViolations(source)).toEqual([])
    expect(jobsSource).toMatch(/^    timeout-minutes: 45$/m)
    expect(jobsSource).not.toMatch(/^    services:$/m)

    const checkoutStep = source.match(
      /^      - uses: actions\/checkout@[0-9a-f]{40} # v4\n(?: {8,}.+\n)*/m,
    )?.[0]
    const persistCredentialValues = [
      ...(checkoutStep ?? '').matchAll(/^ {10}persist-credentials:[ \t]*(.+)$/gm),
    ].map((match) => match[1])

    expect(collectWorkflowActions(source)).toEqual(approvedActions)
    expect(persistCredentialValues).toEqual(['false'])
    expect(approvedActions).toEqual(
      approvedActions.filter((action) =>
        /^(actions\/checkout|pnpm\/action-setup|actions\/setup-node|actions\/upload-artifact)@[0-9a-f]{40} # v4$/.test(
          action,
        ),
      ),
    )
    expect(source).not.toMatch(/@(main|master|v\d+)(?:\s|$)/)
    expect(source).toContain('pnpm ci:mongodb:start')
    expect(source).toMatch(/if:\s*always\(\)[\s\S]*pnpm ci:mongodb:stop/)
    expect(source).not.toContain('services:')
  })

  it('detects every action and block-scalar run command in mutation fixtures', () => {
    const source = readFileSync('.github/workflows/quality.yml', 'utf8')
    const extraActionSource = source.replace(
      '    steps:\n',
      `    steps:\n      - uses: example/unsupported@${'a'.repeat(40)} # v1\n`,
    )
    const blockRunSource = source.replace(
      '    steps:\n',
      '    steps:\n      - name: Unsupported block command\n        run: |\n          echo unsupported\n',
    )

    expect(collectWorkflowActions(extraActionSource)).toEqual([
      `example/unsupported@${'a'.repeat(40)} # v1`,
      ...approvedActions,
    ])
    expect(collectWorkflowActions(extraActionSource)).not.toEqual(approvedActions)
    expect(() => collectWorkflowRunCommands(blockRunSource)).toThrow(/Block-scalar run commands/)
  })

  it('runs only the mandatory release commands in order', () => {
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
    const runCommands = collectWorkflowRunCommands(workflow)
    const namedRunSteps = [
      ...workflow.matchAll(/^\s+- name:\s*(.+)\n(?:\s+if:\s*.+\n)?\s+run:\s*(.+)$/gm),
    ].map((match) => [match[1], match[2]])

    expect(runCommands).toEqual(expectedRunSteps.map(([, command]) => command))
    expect(namedRunSteps).toEqual(expectedRunSteps)

    const importMapIndex = runCommands.indexOf('pnpm generate:importmap')
    const driftIndex = runCommands.indexOf(
      "git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'",
    )
    expect(importMapIndex).toBeGreaterThan(-1)
    expect(driftIndex).toBe(importMapIndex + 1)
    expect(runCommands.filter((command) => command.includes('test:e2e'))).toEqual([
      'pnpm test:e2e:governance',
      'pnpm test:e2e:forms',
    ])

    for (const forbidden of [
      'project-context:check',
      'project-context:update',
      'dependency-review-action',
      'gitleaks',
      'trufflehog',
      'verify:docker-image',
      'pnpm audit --prod',
      '.env.atlas.local',
      'cat .env',
      'source .env',
      'secrets.',
    ]) {
      expect(workflow).not.toContain(forbidden)
    }
  })

  it.each([
    [
      'top-level scalar write-all',
      'permissions: write-all\n',
      'top-level permissions are not exactly contents: read',
    ],
    [
      'top-level contents write',
      'permissions:\n  contents: write\n',
      'workflow grants a write-capable permission scope',
    ],
    [
      'job-level scalar override',
      'permissions:\n  contents: read\n\njobs:\n  verify:\n    permissions: read-all\n',
      'verify job overrides top-level permissions',
    ],
    [
      'job-level mapping override',
      'permissions:\n  contents: read\n\njobs:\n  verify:\n    permissions:\n      contents: read\n',
      'verify job overrides top-level permissions',
    ],
    [
      'job-level pull-request write',
      'permissions:\n  contents: read\n\njobs:\n  verify:\n    permissions:\n      pull-requests: write\n',
      'workflow grants a write-capable permission scope',
    ],
  ])('rejects an invalid permission contract: %s', (_label, invalidSource, expectedViolation) => {
    expect(getPermissionContractViolations(invalidSource)).toContain(expectedViolation)
  })

  it('keeps the exact safe CI environment and fail-closed final cleanup', () => {
    const source = readFileSync('.github/workflows/quality.yml', 'utf8')
    const envStart = source.indexOf('    env:\n')
    const stepsStart = source.indexOf('    steps:\n', envStart)
    const envSource = source.slice(envStart + '    env:\n'.length, stepsStart)
    const environment = Object.fromEntries(
      [...envSource.matchAll(/^      ([A-Z][A-Z0-9_]+):(?: (.*))?$/gm)].map((match) => [
        match[1],
        unquoteYAMLValue(match[2] ?? ''),
      ]),
    )
    const jobSource = source.slice(source.indexOf('  verify:\n'))
    const stepsSource = source.slice(stepsStart + '    steps:\n'.length)
    const stepBlocks = stepsSource.split(/(?=^      - )/m).filter(Boolean)

    expect(environment).toEqual(safeCIEnvironment)
    expect(() => assertSafeTestDatabaseURI(environment.MONGODB_URI)).not.toThrow()
    expect(() => assertSafeTestDatabaseURI(environment.TEST_MONGODB_URI)).not.toThrow()
    expect(jobSource).not.toMatch(/^    environment:/m)
    expect(jobSource).not.toMatch(/^    services:/m)
    expect(source).not.toContain('continue-on-error')
    expect(stepBlocks.at(-1)).toMatch(
      /^      - name: Stop isolated MongoDB replica\n        if: always\(\)\n        run: pnpm ci:mongodb:stop\n?$/,
    )
    expect(source).not.toMatch(/^\s+run:\s*.*(?:cat|source).*\.env/m)
  })

  it('always preserves browser diagnostics with bounded retention and explicit paths', () => {
    const source = readFileSync('.github/workflows/quality.yml', 'utf8')
    const diagnostics = source.split(/(?=^      - )/m).find(
      (step) => step.startsWith('      - name: Preserve browser diagnostics\n'),
    )
    expect(diagnostics).toContain('        if: always()\n')
    expect(diagnostics).toContain('        uses: actions/upload-artifact@')
    expect(diagnostics).toContain('          retention-days: 7\n')
    expect(diagnostics).toContain('          if-no-files-found: ignore\n')
    expect(diagnostics?.match(/          path: \|\n((?:            .+\n)+)/)?.[1]).toBe(
      '            playwright-report/\n            test-results/\n',
    )
  })

  it('maps the focused governance command to only the two-test browser file', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJSON.scripts?.['test:e2e:governance']).toBe(
      'cross-env NODE_OPTIONS="--no-deprecation --conditions=react-server --import=tsx/esm" playwright test --config=playwright.config.ts tests/e2e/governance.e2e.spec.ts',
    )
  })

  it('clears caller-controlled public origin and bootstrap policy for integration tests', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJSON.scripts?.['test:int']).toBe(
      'cross-env NODE_OPTIONS=--no-deprecation NEXT_PUBLIC_SERVER_URL= ALLOW_FIRST_ADMIN_CREATION= vitest run --config ./vitest.config.mts',
    )
  })

  it('keeps project-context checking available for local maintenance', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJSON.scripts?.['project-context:check']).toBe(
      'node .agents/skills/project-context/scripts/check-project-context.mjs',
    )
  })
})
