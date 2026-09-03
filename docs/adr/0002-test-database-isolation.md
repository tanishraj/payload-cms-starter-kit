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

Playwright loads the committed non-secret `test.env` without overriding explicitly exported values,
validates the test URI during configuration, copies only that validated value into the application's
`MONGODB_URI`, and starts a fresh server with `reuseExistingServer: false`. Each helper that mutates
through Payload repeats the guard before dynamically importing Payload configuration.

Rejected alternatives were inheriting `MONGODB_URI`, allowing Atlas or non-loopback test-named
databases, relying only on a database-name suffix, and reusing an already-running application
server. None provides a sufficient fail-closed boundary for destructive fixtures.

## Consequences

E2E requires a loopback MongoDB replica set and a dedicated test database. Remote browser-test
databases are intentionally unsupported. Because the single local member advertises `mongo:27017`
inside Compose, host test clients also require `directConnection=true`. Operators may override the default only with another URI
that satisfies the same rules. Read-only export and migration-report tooling remains governed by
its own explicit operational workflow rather than this test-only guard.

The Compose-backed transaction proof is separately opt-in and skipped during ordinary integration
runs. Its verifier supplies both an explicit enable flag and a validated loopback `_test` URI, threads
one Payload request through nested writes, and proves rollback and commit behavior against the local
replica set.

## Verification

- `tests/int/test-database-safety.int.spec.ts` covers accepted and rejected URI classes and verifies
  sanitized errors.
- `tests/int/e2e-config.int.spec.ts` proves Playwright copies only a validated test URI, refuses
  unsafe configuration before startup, starts a fresh server, and statically checks each mutating
  helper for the guard-before-import contract.
- `TEST_MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true pnpm exec playwright test --list`
  verifies configuration evaluation without connecting to or mutating application data.
- `pnpm verify:docker-local` reserves the fixed isolated Compose identity, verifies PRIMARY health,
  runs the request-threaded transaction proof, and cleans only resources created by that invocation.
