# Payload and Sharp security refresh — 2026-10-07

During Contact6 acceptance, the authoritative production audit reported new high/critical advisories in Payload 3.88.0 and Sharp 0.35.4. This prerequisite is isolated on `fix/payload-sharp-security-patches` from develop; Contact6 remains a separate feature.

## Reviewed changes

- Align all eight direct Payload family packages at exact `3.90.2` and Sharp at exact `0.35.5`.
- Retarget the existing Payload-scoped Undici override to `payload@3.90.2>undici: 7.29.1`. Upstream still pins vulnerable 7.29.0; other Undici consumers remain unchanged.
- Preserve Next.js, React, runtime/provider choices and the existing Braces exception expiring 2026-10-13. No new exception or approval is inferred.
- Update the real-S3 compatibility assertion: disabled client uploads no longer mount a provider under Payload 3.90; its import-map dependency stays available, and no signed-upload endpoint is exposed.
- Regenerate Payload types/import map and inspect the graph diff. No live data migration is run.
- Supply title-derived create slugs before validation: Payload 3.90 moved its experimental helper to beforeChange, which can validate the still-empty required slug first. Preserve explicit URLs and upstream update/duplicate behavior. Real Payload/MongoDB regression covers publication, rename stability and chosen URLs.
- Initialize disposable governance collection/version models before transactional fixture writes to avoid index/catalog creation races.
- Make browser login wait for DOM plus Dashboard readiness; inspect the actual grant-group collapsed state rather than treating temporarily absent conditional children as collapse.
- Correct the existing TOTP replay test to reuse the enrollment code. Generating a new code at assertion time can cross a 30-second step and validly succeed; the test must reject replay of the exact used code.

## Upstream upgrade review

[Payload 3.90.0 upgrade notes](https://github.com/payloadcms/payload/releases/tag/v3.90.0) and [3.90.2 fixes](https://github.com/payloadcms/payload/releases/tag/v3.90.2) were read. [Sharp 0.35.5](https://github.com/lovell/sharp/releases/tag/v0.35.5) supplies the fixed release.

This starter uses MongoDB, so no relational migration is needed. Regenerated auth types include the new reset-password timestamp. Existing upload policy allows raster images/PDF only, caps at 10MiB, performs server validation and disables direct client uploads; do not opt back into restricted XML/SVG files or unsafe fetch. Configured application URL/CORS/CSRF provide the trusted origin. No custom polymorphic join filter or secondary auth collection is introduced; generic forms use custom collections and explicit access rather than the form-builder plugin. Password changes/reset now revoke other sessions. Existing scheduled publishing jobs must be recreated by the operator after upgrading if any are pending; no jobs or content are rewritten by this dependency change.

## Verification

[PR #20](https://github.com/tanishraj/payload-cms-starter-kit/pull/20) merged into develop at `f440365ebed26e5fb02bf171c6b3d95bec6e9db8`. [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37529400212) passed 2,336 integration tests (one Docker-dependent test skipped), governance/native-form browser journeys, production build, dependency audit, generated-artifact consistency and TypeScript/lint. The authoritative audit reports no critical findings; the sole high finding remains the exact approved Braces exception through October 13. Focused dependency/storage/auth/context checks passed locally. No environment settings were introduced.

The Admin grant/revoke browser journey required one CI retry after its conditional permissions field was not ready within the assertion window. The retry exercises the full access assertions and passed; deterministic first-attempt browser readiness remains tracked for ADMINUX/VERIFY follow-up. The final combined Contact6 run passed both governance journeys without retry.
