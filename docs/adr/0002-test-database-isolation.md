# ADR 0002: Test Database Isolation

- Status: Accepted
- Date: 2026-09-03

## Context

Playwright setup and cleanup create, update, and delete Payload records. Inheriting the application's
general `MONGODB_URI`, loading a broad environment file, or reusing an arbitrary server on port 3000
could direct those mutations at development, shared, or production data.

## Decision

Browser tests and their mutating helpers use only `TEST_MONGODB_URI`. The URI must use the
`mongodb:` protocol, resolve every host to explicit loopback (`localhost`, `127.0.0.1`, or `::1`),
name exactly one non-reserved database, and end that database name in `_test` or `-test`. Validation
errors describe the failed rule without echoing credentials, query parameters, or the full URI.

Playwright loads the committed non-secret `test.env` with override enabled, validates that test URI
during configuration, and starts a fresh server with `reuseExistingServer: false`. Its web-server
environment explicitly replaces every runtime-sensitive database, Payload, origin, deployment,
bootstrap, email, token, and storage input, so hostile parent-process values cannot configure the
test application. Configuration also replaces ambient `NODE_OPTIONS` with the fixed flags required
by Playwright workers and the directly launched Next.js server to import Payload configuration.
Each helper that mutates through Payload repeats the database guard before dynamically importing
Payload configuration.

Rejected alternatives were inheriting `MONGODB_URI`, allowing Atlas or non-loopback test-named
databases, relying only on a database-name suffix, and reusing an already-running application
server. None provides a sufficient fail-closed boundary for destructive fixtures.

## Consequences

E2E requires a loopback MongoDB replica set and a dedicated test database. Remote browser-test
databases are intentionally unsupported. Because the single local member advertises `mongo:27017`
inside Compose, host test clients also require `directConnection=true`. The committed `test.env`
controls the E2E URI and overrides an ambient `TEST_MONGODB_URI`; changing the default requires a
deliberate change to that tracked non-secret fixture, and the replacement must satisfy the same
rules. Read-only export and migration-report tooling remains governed by its own explicit
operational workflow rather than this test-only guard.

The Compose-backed transaction proof is separately opt-in and skipped during ordinary integration
runs. Its verifier supplies both an explicit enable flag and a validated loopback `_test` URI, threads
one Payload request through nested writes, and proves rollback and commit behavior against the local
replica set.

## Verification

- `tests/int/test-database-safety.int.spec.ts` covers accepted and rejected URI classes and verifies
  sanitized errors.
- `tests/int/e2e-config.int.spec.ts` proves Playwright overrides hostile parent configuration with
  the committed isolated values, starts a fresh server, and statically checks each mutating helper
  for the guard-before-import contract.
- `pnpm exec playwright test --config=playwright.runtime-import.config.ts` runs a real Playwright
  worker and proves an E2E helper can dynamically import Payload configuration without starting a
  server, opening a browser, connecting to MongoDB, or mutating application data.
- `pnpm verify:docker-local` reserves the fixed isolated Compose identity, verifies PRIMARY health,
  runs the request-threaded transaction proof, and cleans only resources created by that invocation.
