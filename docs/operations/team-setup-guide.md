# Native team setup and access preview

Admins manage accounts through Administration → Users. There are two roles:
Admin has complete access; Site Manager starts with no feature grants. The new
optional Team setup guide previews native selections without adding a wizard,
changing access or signing in as the target user.

## Preview and next actions

- Admin: explains full website/settings/user authority. Section/feature choices
  cannot limit this role; choose Site Manager for limited responsibilities.
- Site Manager with no features: sections alone grant nothing; choose only the
  required destinations. Supporting records remain read-only.
- Scoped features without sections: choose active root Pages under Manageable
  website sections. Descendants are included; unrelated grants remain site-wide.
- Selected scoped/site-wide features: summarize each group and selected section
  count. Long lists show the first three labels plus the remaining count; the
  native checkboxes and existing Feature Access overview retain the full details.
- Action Queue/Audit Log alone: explain that operational records still need
  otherwise authorized source features.
- Pending save: show an honest in-progress state and disable the guide action.

The preview describes selections, not a live authorization audit. It never claims
selected roots are still valid. Save validates active roots and applies access;
unsaved/new-account selections are explicitly unconfirmed. Changed role, features
or sections end active sessions through the existing server hook. Current access
is always rechecked by native destinations and operations. Last-Admin protection,
bootstrap, account security and least-access defaults remain unchanged.

## Ownership and implementation

A non-persisted UI field registers `TeamSetupGuideField` on Users. The server
requires the acting Admin, reads only that Admin's preference with user,
`overrideAccess: false` and current `req`, and passes visibility props. It does not
query the target account or root hierarchy. The client derives role, a stable
feature signature and unique selected-root count from native form state; it does
not subscribe to passwords/email or write account data.

Read-only, trashed, relationship drawer, other collection/account route and
other-editor lock contexts omit the guide. New unsaved accounts cannot have a
saved-document lock: inherited lock state is ignored until an ID exists. Existing
saved-account locks remain respected. The same new-record rule applies to Page
guidance, so parent selection cannot hide help on an unsaved Page. Site Managers and anonymous bootstrap never
receive the server guide.

The existing feature/dependency summary is now canonical in `adminFeatures.ts`,
with the old presentation export retained. Browser-safe `sectionScope.ts` owns
the unchanged four scoped feature keys and relationship/root normalization;
`sectionAccess.ts` reexports them and retains all server enforcement. No competing
permission engine or client import of Payload server access code is introduced.

## Presentation and personal visibility

The production presentation reuses authenticated
`@shadcnblocks/empty-empty-actions-2`, verified during this session, and the
single Admin / Getting started Storybook entry. It preserves sourced composition,
styles and native Payload palette integration. Stories cover both roles, missing
features/sections, mixed scopes, operational-only grants, long selections and
pending saves. Existing controls remain independent of optional help.

`forma-team-setup-guide-v1` stores only the acting Admin's dismissed preference.
It is independent of the target account and other guides. Confirmed preference
writes control hide/reopen and focus; they cannot save grants or mark onboarding
complete. No dependency, environment variable, persistence field, migration,
invitation or automatic grant is introduced.

## Evidence

The strengthened native Admin/Manager journey passes without retries (34.1s):
create another Admin, preview an initially ungranted Manager, identify missing
sections, assign a root and save, persist/reopen help, then exercise actual allowed
and denied Manager operations plus access-change session revocation. Native
light/dark scoped WCAG A/AA checks have no violations or incomplete results.
Focused contracts cover current selections, server ownership, shared dependency
semantics and lock/exclusion behavior. Full regression/build/CI results are owned
by the implementation checklist and feature PR; broader novice-user observation
and comprehensive permission diagnostics remain separate acceptance items.
