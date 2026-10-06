# Dependency Management

## Supported toolchain

Use the repository-declared Node.js 22 line (`>=22.13.0 <23`) and pnpm `11.17.0`. Keep Corepack signature verification enabled when activating pnpm; do not bypass signature checks or substitute another package manager when changing `pnpm-lock.yaml`.

Direct compatibility families and independently governed runtime packages are pinned deliberately. Next.js and its direct companion packages move together, all direct Payload packages move together, and Sharp stays on the reviewed exact version. A dependency change must preserve the assertions in `tests/int/dependency-version-contract.int.spec.ts`.

## Authoritative production audit gate

Run:

```bash
pnpm audit:prod
```

This is the sole pass/fail dependency-audit gate. It runs the repository-owned TypeScript policy CLI, which invokes `pnpm audit --prod --json --audit-level=low` without a shell, validates the checked-in exception document against its JSON Schema, and evaluates high and critical findings against the domain policy. The explicit low threshold preserves moderate and low advisory objects for visibility; the repository policy, rather than raw pnpm exit status, decides whether those findings block.

Raw `pnpm audit` output is a diagnostic source only and is not, by itself, a repository gate result. At the explicit low threshold, exit code `0` cannot carry an emitted low-or-higher advisory, while exit code `1` must carry at least one. Any other exit code, contradictory exit/report combination, duplicate or mismatched advisory identity, termination signal, empty output, malformed JSON, inconsistent emitted low-or-higher counts, or unsupported report shape makes `pnpm audit:prod` fail closed. pnpm may count informational findings in metadata while omitting their advisory objects, so informational metadata is reported but deliberately excluded from the emitted-advisory count consistency check. CLI output is intentionally limited to severity counts, advisory IDs, package names, affected installed versions and ranges, and policy reasons. Dependency paths and raw audit/process output must not be logged.

Moderate and low findings remain visible but do not fail the gate and must not be added to the exception document. As of the 2026-09-03 refresh, the production graph has `0 critical / 0 high / 14 moderate / 4 low`. The residual findings all affect DOMPurify `3.2.7`, which is pinned transitively by Monaco Editor `0.55.1`; Monaco upstream owns the available upgrade path. Recheck that path during every dependency refresh and remove the residual when an in-range or reviewed Monaco upgrade reaches a patched DOMPurify version.

## Exception workflow

The default policy is no exceptions. On 6 October 2026, the user explicitly approved
one exact Braces exception expiring 13 October; the checked-in exception document
records it, and the audit evaluator is unchanged. A reviewed Payload-scoped security patch is
configured in `pnpm-workspace.yaml`; it is dependency remediation, not an audit exception.

An exception requires explicit security approval before merge. The approver must identify one high or critical advisory and provide all nine fields required by `security/dependency-audit-exceptions.schema.json`: `advisoryId`, `packageName`, `vulnerableRange`, `installedVersions`, `reachability`, `mitigation`, `owner`, `createdAt`, and `expiresAt`.

The policy enforces these additional rules:

- Identity, package, vulnerable range, and the complete affected installed-version set must exactly match one current high or critical advisory.
- Reachability, mitigation, and owner must contain non-whitespace text.
- Dates must be real ISO calendar dates in `YYYY-MM-DD` form. Expiry cannot precede creation, cannot exceed 30 calendar days, and must not be in the past.
- Duplicate, ambiguous, structurally invalid, expired, unused, overly broad, and stale entries fail the gate.
- Moderate and low advisories remain visible and unexcepted.

The named owner must track remediation and remove the entry as soon as the patched graph lands. Renewal is a new approval decision with new dates; do not extend an entry silently.

## Narrow lockfile refresh

Before changing dependencies, confirm the branch and clean tracked worktree, then record `node --version` and `pnpm --version`. Edit only the approved direct manifest entries. Refresh explicitly mapped transitive packages within their existing parent ranges rather than adding overrides or upgrading unrelated direct dependencies. For the 2026-09-03 remediation, the reviewed targets were:

- Fast URI `3.1.6`
- js-yaml `4.3.1`
- Nanoid `3.3.18`
- Browserslist `4.28.7`
- direct PostCSS `8.5.26`

After any lock refresh:

```bash
pnpm install --frozen-lockfile
pnpm why fast-uri
pnpm why js-yaml
pnpm why browserslist
pnpm why nanoid
pnpm why undici
pnpm why image-size
pnpm why sharp
pnpm why postcss
pnpm audit:prod
pnpm exec vitest run --config ./vitest.config.mts tests/int/dependency-version-contract.int.spec.ts tests/int/dependency-audit-policy.int.spec.ts
pnpm exec tsc --noEmit
```

Inspect the manifest and full lockfile diff. Stop if the package-manager command updates packages beyond the approved graph; revert only that attempted dependency change and use a narrower supported refresh. Never solve an advisory by silently adding an override or broadening an exception.

## September 12 feature backport

The SNMIH backport adds exact dependencies `otpauth@9.5.2` and `react-fast-marquee@1.6.5`. Its audit exposed high advisory 1193727 in existing transitive `js-yaml@4.3.1`; a package-scoped in-range refresh moved only js-yaml to `4.3.2`. No overrides or audit exceptions were added. The authoritative audit passes with 0 critical, 0 high, 16 moderate and 4 low findings. The remaining visible findings include DOMPurify, Payload, and baseline-browser-mapping; these remain subject to the existing moderate/low policy.

## October 2026 remediation in progress

[Remediation and approval proposal](dependency-audit-remediation-2026-10-06.md)
records the Next.js patch-family refresh, narrow transitive changes, scoped Undici
patch and the remaining Braces finding. The exact Braces entry was explicitly approved by the user on 6 October and is
active until 13 October. Any renewal or different exception requires new approval;
the document's existence alone never supplies approval.
