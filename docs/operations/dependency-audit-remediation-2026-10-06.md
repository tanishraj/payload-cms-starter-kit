# Dependency audit remediation — 6 October 2026

Status: patches verified locally; exact seven-day Braces exception approved by the
user on 6 October 2026. GitHub verification remains required before merge.

The Quality run for the planning merge failed before application checks at the
production dependency audit. The separate `fix/production-dependency-audit` branch
keeps remediation out of the dynamic-form implementation commit.

## Applied patch changes

- Move the direct Next.js compatibility family from 16.3.4 to 16.3.6 together.
  This addresses the [Next.js advisory](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j).
- Refresh Fast URI to 3.1.8 and Source Map JS to 1.2.2 within the existing parent
  ranges. The Sass mapping is explicitly refreshed within its `>=0.6.2 <2.0.0`
  constraint; no direct source-map dependency is added.
- Apply the exact scoped workspace override `payload@3.88.0>undici: 7.29.1`.
  Payload 3.88.0 pins 7.29.0 exactly, so a range-preserving refresh cannot fix it;
  no 3.88.1 release is available and 3.89.0 still has that pin. This compatible
  security patch preserves the existing full Payload family rather than expanding
  the task into a CMS upgrade. Other in-range Undici consumers refresh to 7.30.0.
  Remove the override when a reviewed Payload release carries the patch upstream.
- Keep the audit evaluator unchanged. Apply only the explicitly approved Braces
  exception below, with no renewal or other advisory waiver.

The current authoritative audit reports **0 critical, 1 high, 18 moderate and 5
low**. Moderate/low entries remain visible under the existing policy. The remaining
high finding is Braces, retained visibly and covered only by the approved bounded
exception below. The authoritative gate passes with exactly this one exception applied.

## Remaining Braces finding and approval proposal

The [Braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) describes
stack exhaustion from deeply nested patterns and lists a patched range starting at
3.0.4. On 6 October, the registry's available release list ends at 3.0.3; requesting
3.0.4 returns no matching version. No fixed release was installed or claimed.

Production dependency paths include Sass → Chokidar → Braces and Payload cloud
storage tooling → Find Node Modules → Findup Sync → Micromatch → Braces. The
inspected module-discovery default pattern is the literal `node_modules`. No direct
application use of Braces/Micromatch taking visitor patterns was found. This is a
bounded source/dependency review, not a proof that every transitive execution path
is unreachable. Crafted nested patterns may still exhaust the process stack if
they reach this package.

The existing [dependency management policy](dependency-management.md#exception-workflow)
states: “An exception requires explicit security approval before merge.” The user explicitly approved the exact entry below and its temporary risk in the
conversation on 6 October 2026. It is now recorded in
`security/dependency-audit-exceptions.json`; the owner and expiry remain unchanged.

```json
{
  "advisoryId": 1240992,
  "packageName": "braces",
  "vulnerableRange": "<=3.0.3",
  "installedVersions": ["3.0.3"],
  "reachability": "Current production paths are Sass/Chokidar filesystem tooling and Payload cloud-storage module discovery via find-node-modules/findup-sync/micromatch. The inspected discovery pattern defaults to the literal node_modules; no direct application use accepting visitor-provided brace patterns was found. This review does not prove all transitive paths unreachable.",
  "mitigation": "Keep build/watch/module-discovery patterns controlled by trusted code and operators; do not route visitor input into glob patterns. Check for a fixed Braces or parent release, remove this exception immediately when a reviewed fixed graph is available, and let the gate fail at expiry if unresolved. Accept the remaining stack-exhaustion risk for at most seven days.",
  "owner": "Repository maintainer (tanishraj)",
  "createdAt": "2026-10-06",
  "expiresAt": "2026-10-13"
}
```

Approval permits applying only this exact entry, rerunning the authoritative audit
and CI, and merging after other checks pass. It does not waive any other advisory
or authorize renewal. The audit continues to reject expired, mismatched or unrelated
exceptions; the owner must remove this entry when a reviewed fixed graph is available.

## Validation before the approval decision

Frozen installation, both Payload generators, TypeScript, 46 dependency/version
policy tests and project-context checks pass on Node 22.13.1. The full integration
suite initially found 2,266 passing tests, one skipped test and one existing
Storybook/public-radius boundary failure. Full lint found only generated
`storybook-static` bundle violations. Those workshop-boundary issues were fixed in a separate focused commit: generated
Storybook output is excluded from lint, and public import enforcement protects
the isolated workshop while the public radius contract remains active. At that initial checkpoint, the audit still failed on the sole Braces high advisory
and no exception was active. The later explicit user approval is recorded above.

Final local verification: 2,268 integration tests pass with one opt-in Docker test
skipped; all 64 affected quality/dependency/documentation tests pass. TypeScript
and full lint pass (one pre-existing AdminUserMenu navigation warning). Payload
generators have no artifact drift; project context is current. After the explicit
approval, the production audit passes with only advisory 1240992 exempted. GitHub
CI must verify the governance browser journeys and production build before merge.
Review [PR #15](https://github.com/tanishraj/payload-cms-starter-kit/pull/15).
