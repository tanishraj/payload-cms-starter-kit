# SNMIH Feature Backport Implementation Plan

> Use subagent-driven-development for independent subsystem implementation and review. User authorization covers implementation of the comparison findings.

**Goal:** Bring missing SNMIH capabilities into the starter while preserving its stronger existing contracts.
**Architecture:** Adapt sibling source at 0dc8f89 selectively; maintain explicit server/client block registrations and central runtime configuration.
**Tech Stack:** Existing Payload 3.88, Next 16, React 19, Node 22, pnpm 11, MongoDB.

## Constraints
No production reads/writes or deployment. Do not edit SNMIH. Do not replace starter access/validation/section contracts. Root owns package/lock files, generated artifacts, common context references, and final checks.

- [x] Authentication: copy TwoFactorCredentials, twoFactor endpoints/helpers, admin forms/settings and reset view; merge Users and config registration preserving first-admin behavior and plugins. Adapt issuer to site identity. Port crypto/auth/browser tests. Validate password, replay, recovery and session behavior.
- [x] Forms: adapt forms.ts, Contact33, FormSubmissions, submission route and notification helpers. Retain request limits and introduce phone validation and fixed-review-field validation. Port targeted tests; document behavior.
- [x] Blocks: add Integration23 and Logos20 configs/components/row labels, register catalog and both renderers and thumbnails, apply section contract; adapt fee action fields/renderers with legacy compatibility; Q&A supporting action positions and About widths. Port tests and block count expectations.
- [x] Delivery: add ranked search helper and shared queries using starter public-review helper; adapt remote download route using runtimeConfig and shared link helpers; extend cache invalidation without losing CLI skip context; lean navigation population and stripping; route scroll fixes. Port regression tests.
- [x] Backups: adapt scripts/backup-prod-db.ts and policy into configurable private storage/database settings; workflow opt-in and current pinned CI toolchain; document setup and restore steps; port policy tests without executing backup.
- [x] Integration: add required dependency via package runner, regenerate types/import map, update context and docs, run focused/full checks, review final diff and resolve regressions.

Subsystem owners report changed paths and test outcomes to the controller. Controller reviews each subsystem and performs whole-diff review. Track final validation below.


## Validation and integration decisions

- Preserve the starter's request limits, rate limiter, public-review query boundary, native first-admin bootstrap and block section contracts.
- Cap ranked search at 20 batches / 2,000 candidates per type; exhaustive ranking beyond that bound is deliberately excluded to keep requests bounded.
- Expanded publication hooks honor the CLI skip context through nested Navigation Link writes.
- Database backups require explicit database/private bucket settings and stay opt-in; no production backup was run.
- New dependencies match SNMIH: otpauth 9.5.2 and react-fast-marquee 1.6.5. Existing js-yaml patched to 4.3.2 to pass the production audit, with no exceptions or overrides.
- Complete integration run: 230 files / 2,267 tests passed; existing Docker-dependent transaction test skipped.
- Production build with isolated MongoDB passed. TypeScript passed. Lint passed with one pre-existing AdminUserMenu navigation warning. Frozen install and production dependency audit passed.
- Focused real-DB ranked-search regression verifies pending/rejected Reviews remain hidden.
- Project-context narratives and generated inventory refreshed; optional knowledge graph retains its pre-existing stale-analysis warning.
- Browser verification passed in system Chrome: enrollment, login, recovery-code download and disable journey; JSON reset rejects missing/wrong factors (401), accepts the correct factor (200), and reset UI validates password confirmation. The fixture uses Payload’s normalized runtime secret when seeding encrypted credentials. Tests ran against a disposable local database and copied-source development server; no production operations ran.
