# SNMIH feature backport

The user approved bringing the gaps identified by the September 12 repository comparison into the starter. Source reference: sibling SNMIH-Website at 0dc8f89; target baseline: cc2c68c. Work is local; no deployment, production access, or source-repository changes.

Use selective adaptation of existing SNMIH implementations. Whole-file replacement where the starter diverges would discard its security and section contracts; reimplementation from scratch would duplicate already reviewed behavior. Keep existing starter Node/pnpm/Payload versions, server-only runtime configuration, upload policy, first-admin rules, public-review filtering, bounded request/rate limits, and block schema/presentation compatibility.

Deliver optional per-account TOTP and recovery codes; Contact33 phone capture and form validation/email improvements; Partner Directory and Logo Marquee with both renderers/thumbnails; unified fee file actions; remote attachment downloads; ranked search; publication cache freshness and lean shell relationships; route scroll fixes; Q&A supporting action positioning and About widths; configurable opt-in scheduled MongoDB backups. Preserve legacy fields. Use configurable site identity rather than new SNMIH branding. Backup workflow must remain inactive unless configured and target a dedicated private bucket/prefix.

Validate focused behavior tests per subsystem, Payload generators, integration suite, lint, TypeScript, production build and relevant browser checks where available. Refresh deterministic project context and maintained operator documentation. Report genuine environmental limits without claiming unrun checks pass.
