# Confirmed catalogue planning brief

Recorded: 2026-10-14 (Asia/Dubai). This is a charting input, not a resolved child decision or an implementation acceptance record.

## User-confirmed destination and direction

The user chose to **plan the entire feature catalogue**, preserving the selected dynamic-forms-first delivery sequence. All new implementation remains in payload-cms-starter-kit; Forma is preserved. Use Payload’s native admin, page/block editing and Live Preview.

The user explicitly accepted these four directions:

1. **Ownership:** Managers create/manage section-owned Forms and reusable content; Admins control resources shared across sections. Submission-inbox access is granted separately from permission to place a Form block. Exact overlapping-grant, move, sharing and migration rules remain a child-ticket decision.
2. **Changed questions:** Stale published form definitions trigger an explicit refresh/recovery flow preserving compatible answers. Never silently reinterpret old answers using a new schema. Compatibility and revision identity still need precise rules.
3. **Responsive rollout:** Selected upstream blocks retain fixed breakpoints initially. Site-configurable breakpoints remain a later planned capability; this is a deliberate deferral, not removal.
4. **Registration:** Keep explicit typed Payload schemas, production components and Storybook stories. Add small shared helpers/generators where useful; do not introduce a separate schema-definition language now.

Forms remain reusable records selected by presentation blocks, editable through native relationship drawers. Blocks own styling and layout; the schema supplies editor-chosen supported fields, valid custom names and labels. Do not add a competing form-specific design system. Admin has all access; Managers may create, save, preview and publish within their granted scope. Source/license rules and Storybook-first conventions remain in force.

## Read-only review findings

Reviewed the implementation checklist, scope archive, dynamic-forms audit, onboarding plan and technical inventory against selected current source contracts at commit `08036dbd182a2a5dc1c3c5a8b9057e7ae5882ddd`.

- The checklist contains 242 feature groups (206 carried forward plus 36 onboarding/admin UX groups) and 10 separate DF proof steps. One full feature (FORM-02) and two proof steps (DF-01/03) are checked. Open boxes are not evidence that the starter lacks those capabilities.
- Native pages/blocks, reusable content, preview, navigation, media, SEO/search, submissions, authentication and operational tooling already provide substantial reuse. Baseline tickets must distinguish source presence, recorded tests and fresh verification.
- Generic Form and Contact Cards & Form use reusable custom questions. Six controls are currently supported: text, email, phone, textarea, select and checkbox. The broader sixteen-control catalogue, display entries, conditions, private files, revision negotiation and server idempotency remain open.
- Published intake snapshots/fingerprints and readable historical answer rows exist; they do not establish the full revision/recovery protocol. Client pending state does not prove server duplicate protection.
- Page authorization is currently feature-wide; section/root/descendant enforcement remains an enhancement. Shared-resource ownership and independent inbox permissions need corresponding enforcement.
- Native drafts/version features do not alone certify autosave, conflicts, shared-draft isolation, restore or delivery-failure guarantees. Proposed onboarding journeys/pilot targets are not measured usability results.

## Evidence and documentation follow-ups

Current source remains authoritative. The technical inventory contains stale dependency/exception and some workflow/route descriptions; checklist workshop counts also need review against canonical registrations. Baseline tasks should correct maintained documentation after verifying facts, without rewriting historical scope archives or checking implementation boxes from source alone.

The checked-in Braces dependency exception expires on **2026-10-13**. As of this review date it is expired. No fresh production audit was run in this planning review, and no claim is made about today’s advisory status. Run the existing audit/remediation workflow before the next implementation merge; the earlier seven-day approval does not authorize an extension.

## Completion boundary

This charting session creates open questions and coverage routing. It does not resolve their detailed policies, certify all feature acceptance, change app behavior, migrate data or introduce environment variables. Release assignment and ownership become decisions after baseline evidence and relevant policies are available.

## Current direction addendum — 17 October 2026

The October 14 findings above are historical, not current absence-of-feature claims.
Core forms were subsequently accepted and advanced forms deferred. Section access,
scoped recipes and several native onboarding guides have shipped; the maintained
checklist/source owns their evidence. The user now asks to organize remaining work
around an uncomplicated working website and client onboarding, and confirmed that
the team configures sites as Admin while clients normally edit as scoped Site
Managers. [Current source baseline](../../docs/planning/composition-publishing-baseline-2026-10-17.md)
and [delivery proposal](../../docs/planning/client-website-delivery-roadmap.md) distinguish
source presence, recorded runtime evidence and proposed release placement. No
remaining policy ticket is resolved by this input alone. The historical expired
Braces observation above is not the current approval status; current dependency
policy/exception records and exact-head audit remain authoritative.
