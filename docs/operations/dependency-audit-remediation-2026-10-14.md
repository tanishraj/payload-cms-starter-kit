# PR #22 dependency remediation — 14 October 2026

## Applied security patch

Align the exact Next.js compatibility family (`next`, `@next/third-parties`, `eslint-config-next`) from 16.3.6 to 16.3.8. Retain compatible locked transitive versions; only the Next family/compiler/environment records and their peer references change. The initial broader `pnpm update` resolution was discarded and the lockfile regenerated with `pnpm install --lockfile-only` against the three changed exact pins. Payload remains 3.90.2, its scoped Undici patch is unchanged, and no environment setting is introduced.

## Braces renewal — explicitly approved and applied

The registry still reports Braces 3.0.3 as the latest available release on 14 October. `pnpm why braces` confirms the Sass/Chokidar and Payload storage module-discovery paths remain. Application source/scripts contain no direct imports of Braces, Micromatch or Fast Glob. This is a bounded reachability review, not proof that every transitive path is unreachable. Deeply nested patterns can still exhaust the process stack.

The previous exception expired on 13 October. The user explicitly approved this exact seven-day renewal in the conversation on 14 October; it has now replaced the expired entry in the active exception document. The audit evaluator remains unchanged. The repository [dependency policy](dependency-management.md#exception-workflow) states: “An exception requires explicit security approval before merge” and “Renewal is a new approval decision with new dates; do not extend an entry silently.”

The approved replacement retains the exact advisory identity, affected version, reachability, mitigation and named owner, with a new seven-day window from 14 to 21 October 2026. Approval applies only this entry, require the authoritative audit and remaining Quality checks to pass, and permit merging PR #22 only after those checks. It does not waive any other finding or authorize another renewal. The gate must fail after 21 October unless the finding is remediated or a separately reviewed renewal is explicitly approved.

```json
{
  "advisoryId": 1240992,
  "packageName": "braces",
  "vulnerableRange": "<=3.0.3",
  "installedVersions": [
    "3.0.3"
  ],
  "reachability": "Current production paths are Sass/Chokidar filesystem tooling and Payload cloud-storage module discovery via find-node-modules/findup-sync/micromatch. The inspected discovery pattern defaults to the literal node_modules; no direct application use accepting visitor-provided brace patterns was found. This review does not prove all transitive paths unreachable.",
  "mitigation": "Keep build/watch/module-discovery patterns controlled by trusted code and operators; do not route visitor input into glob patterns. Check for a fixed Braces or parent release, remove this exception immediately when a reviewed fixed graph is available, and let the gate fail at expiry if unresolved. Accept the remaining stack-exhaustion risk for at most seven days.",
  "owner": "Repository maintainer (tanishraj)",
  "createdAt": "2026-10-14",
  "expiresAt": "2026-10-21"
}
```

## Verification

Frozen installation, 50 focused dependency/policy/context tests, TypeScript and lint pass (one existing AdminUserMenu warning). Full isolated integration passes 2,370 tests with one Docker-dependent skip; the production build and both native form journeys pass without retry. Next.js findings are removed from the authoritative audit, which now reports 0 critical, 1 high, 17 moderate and 5 low. Braces is the only remaining blocker.

Before approval, the exact candidate above passed the unchanged audit evaluator and exception schema against a fresh registry audit in a dry run without changing the active exception. After the user’s explicit approval, only this exact entry was applied. The authoritative audit and GitHub Quality must pass before merge; no additional exception or gate bypass is authorized.

After applying the approved entry, the authoritative production audit passes with only advisory 1240992 excepted. All 46 dependency policy/version tests pass; project-context update/check pass. GitHub Quality at the approval commit remains the final merge gate.

## Inventory repair before merge

The first approved-renewal Quality run passed the audit and 2,369 integration tests but failed the deterministic inventory contract. The final approval documentation had been edited after inventory generation; operations documentation participates in the source digest. The exact failure was reproduced locally. Regenerate only after all monitored documentation edits, then rerun the unchanged inventory contract and CI setup sequence before pushing. This is a stale generated artifact, not a test-policy exception or application change.
