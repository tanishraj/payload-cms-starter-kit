import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const composeSource = readFileSync('docker-compose.yml', 'utf8')
const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>
}
const localVerifierSource = readFileSync('scripts/verify-local-compose.ts', 'utf8')
const imageVerifierSource = readFileSync('scripts/verify-production-image.ts', 'utf8')
const safetySource = existsSync('scripts/docker-verifier-safety.ts')
  ? readFileSync('scripts/docker-verifier-safety.ts', 'utf8')
  : ''

describe('local Docker Compose contract', () => {
  it('pins exact supported toolchain images and a frozen pnpm install', () => {
    expect(composeSource).toContain('image: node:22.17.0-alpine')
    expect(composeSource).toContain('image: mongo:8.0.29')
    expect(composeSource).toContain('corepack prepare pnpm@11.17.0 --activate')
    expect(composeSource).toContain('pnpm install --frozen-lockfile')
    expect(composeSource).not.toContain('pnpm@latest')
    expect(composeSource).not.toMatch(/^version:/m)
  })

  it('publishes Mongo only on loopback and configures one rs0 member', () => {
    expect(composeSource).toContain("'127.0.0.1:${MONGO_HOST_PORT:-27017}:27017'")
    expect(composeSource).toContain('--replSet')
    expect(composeSource).toContain('rs0')
    expect(composeSource).toContain('--bind_ip_all')
    expect(composeSource).toContain("host: 'mongo:27017'")
    expect(composeSource).toContain('members: [{ _id: 0')
  })

  it('reports healthy only after Mongo is writable PRIMARY', () => {
    expect(composeSource).toContain('rs.status().myState === 1')
    expect(composeSource).toContain('rs.initiate')
    expect(composeSource).toContain('quit(ok ? 0 : 1)')
  })

  it('uses the exact container URI and waits for Mongo health', () => {
    expect(composeSource).toContain(
      'mongodb://mongo:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true',
    )
    expect(composeSource).toMatch(/mongo:\s*\n\s*condition: service_healthy/)
  })

  it('allows a verifier-owned env file and labels every created resource', () => {
    expect(composeSource).toContain('${PAYLOAD_ENV_FILE:-.env}')
    expect(composeSource).toContain('${PAYLOAD_VERIFY_OWNER:-developer}')
    expect(
      composeSource.match(/com\.payloadcms\.hardening\.owner/g)?.length,
    ).toBeGreaterThanOrEqual(4)
  })
})

describe('isolated Docker verifiers', () => {
  it('registers both shell-free TypeScript verifier entry points', () => {
    expect(packageJSON.scripts['verify:docker-local']).toBe('tsx scripts/verify-local-compose.ts')
    expect(packageJSON.scripts['verify:docker-image']).toBe(
      'tsx scripts/verify-production-image.ts',
    )

    expect(safetySource).toContain("VERIFY_PROJECT = 'payload_hardening_verify'")
    for (const source of [localVerifierSource, imageVerifierSource]) {
      expect(source).toContain('VERIFY_PROJECT,')
      expect(source).toContain('shell: false')
      expect(source).toContain('timeout')
      expect(source).not.toMatch(/\bexecSync\b|shell:\s*true/)
      expect(source).not.toContain('docker compose down')
      expect(source).not.toContain('...process.env')
      expect(source).toContain('composeCommandArgs(')
      expect(source).toContain('createSafeComposeEnvironmentFile(')
      expect(source).toContain('acquireVerifierLock(')
      expect(source).toContain('releaseVerifierLock(')
    }
  })

  it('pins the verification identities and refuses collisions before mutation', () => {
    expect(safetySource).toContain("VERIFY_NETWORK = 'payload_hardening_verify_default'")
    expect(safetySource).toContain(
      "VERIFY_MONGO_VOLUME = 'payload_hardening_verify_mongo_data_8_0'",
    )
    expect(safetySource).toContain(
      "VERIFY_NODE_MODULES_VOLUME = 'payload_hardening_verify_node_modules'",
    )
    expect(imageVerifierSource).toContain(
      "const VERIFY_IMAGE = 'payload-cms-starter-kit:hardening-verify'",
    )
    expect(localVerifierSource).toContain('assertProjectIsUnused')
    expect(imageVerifierSource).toContain('assertProjectIsUnused')
    expect(imageVerifierSource).toContain('assertImageTagIsUnused')
    expect(imageVerifierSource).toContain(
      "const VERIFY_BUILDER = 'payload_hardening_verify_builder'",
    )
    expect(imageVerifierSource).toContain('assertBuilderIsUnused')
    expect(imageVerifierSource).toContain("'docker-container'")
    expect(imageVerifierSource).toContain('`network=${VERIFY_NETWORK}`')
    expect(imageVerifierSource).toContain("'--allow-insecure-entitlement network.host'")
    expect(imageVerifierSource).toContain("'--allow',\n        'network.host'")
    expect(imageVerifierSource).toContain("'--network',\n        'host'")
    expect(imageVerifierSource).toContain("['buildx', 'rm', VERIFY_BUILDER]")
    expect(imageVerifierSource).toContain("'--load'")
    expect(imageVerifierSource.match(/allow-insecure-entitlement/g)).toHaveLength(1)
    expect(localVerifierSource).toContain("MONGO_HOST_PORT: '0'")
    expect(imageVerifierSource).toContain("MONGO_HOST_PORT: '0'")
    expect(localVerifierSource).toContain("COMPOSE_DISABLE_ENV_FILE: '1'")
    expect(imageVerifierSource).toContain("COMPOSE_DISABLE_ENV_FILE: '1'")
    expect(localVerifierSource).toContain('PAYLOAD_ENV_FILE: composeEnvironmentPath')
    expect(imageVerifierSource).toContain('PAYLOAD_ENV_FILE: composeEnvironmentPath')
    expect(localVerifierSource).toContain('DOTENV_CONFIG_PATH: composeEnvironmentPath')
    expect(imageVerifierSource).toContain("'--label'")
    expect(imageVerifierSource).toContain('`${VERIFY_OWNER_LABEL}=${runToken}`')
    expect(localVerifierSource).toContain('assertComposeResourcesOwned')
    expect(imageVerifierSource).toContain('assertComposeResourcesOwned')
    expect(imageVerifierSource).toContain('assertImageOwned')

    const builderCreateEnd = imageVerifierSource.indexOf("'Isolated BuildKit builder creation'")
    expect(builderCreateEnd).toBeGreaterThan(0)
    expect(imageVerifierSource.slice(0, builderCreateEnd)).not.toContain("'--bootstrap'")
    expect(
      imageVerifierSource.indexOf('builderCreatedByThisRun = true', builderCreateEnd),
    ).toBeGreaterThan(builderCreateEnd)
    expect(imageVerifierSource).toContain("['buildx', 'inspect', '--bootstrap', VERIFY_BUILDER]")
  })

  it('pins Compose to this repository and strips ambient Compose controls', () => {
    expect(safetySource).toContain("new URL('../docker-compose.yml', import.meta.url)")
    expect(safetySource).toContain("'-f',")
    expect(safetySource).toContain("'--project-directory',")
    expect(safetySource).toContain("'-p',")
    expect(safetySource).toContain("'COMPOSE_DISABLE_ENV_FILE'")
    expect(safetySource).not.toContain('...process.env')

    for (const forbiddenName of [
      'COMPOSE_FILE',
      'COMPOSE_PATH_SEPARATOR',
      'COMPOSE_PROJECT_NAME',
      'COMPOSE_PROFILES',
    ]) {
      expect(safetySource).toContain(forbiddenName)
    }
  })

  it('serializes verifiers with one owner-checked atomic OS-temp lock', () => {
    expect(safetySource).toContain("'payload-hardening-docker-verifier.lock'")
    expect(safetySource).toContain("openSync(lockPath, 'wx', 0o600)")
    expect(safetySource).toContain('assertVerifierLockOwned')
    expect(safetySource).toContain('Refusing to replace or remove')
  })

  it('uses only isolated test database URIs', () => {
    expect(localVerifierSource).toContain(
      "const TEST_DATABASE_NAME = 'payload-hardening-compose_test'",
    )
    expect(localVerifierSource).toContain('/^127\\.0\\.0\\.1:(\\d{1,5})$/')
    expect(localVerifierSource).toContain('?replicaSet=rs0&directConnection=true')
    expect(imageVerifierSource).toContain(
      'mongodb://mongo:27017/payload-hardening-build_test?replicaSet=rs0&directConnection=true',
    )
    for (const source of [localVerifierSource, imageVerifierSource]) {
      expect(source).toContain('VERIFY_MONGO_VOLUME')
      expect(source).toContain('VERIFY_NODE_MODULES_VOLUME')
    }
  })
})
