# Homepage and navigation guidance

This increment connects the native Page journey to existing Layout Defaults. It
adds guidance, not another editor or an automatic setup operation.

## Editor journey

1. Create and save a Page, preview it, then publish deliberately when ready.
2. On a clean Page with a public version, users granted Layout Defaults can choose
   **Review homepage and navigation**. Admins also have this Dashboard shortcut.
   Private drafts and unsaved changes retain the saved-preview guidance.
3. In Layout Defaults → Site Structure, Homepage selects a published Page for `/`.
   Publishing a Page alone never selects it here or inserts a visible menu item.
4. Header and Footer select site defaults. Edit menu items in the selected Header
   or Footer's Layout and publish that record separately. Individual Page settings
   can override those defaults. A reusable Navigation Link is a destination, not
   proof that a visible menu uses it.
5. Save Draft stages Layout Defaults; Publish applies them. Check `/`, the intended
   Page URL and its menu entry on the website. A selection, saved draft or hidden
   guide never certifies public reachability or launch readiness.

The guide offers **Choose a homepage** when the current form has no selection.
With a selection, it offers Headers, or Footers when that is the granted editor.
Without either editing grant, it keeps a homepage anchor and explains contacting
an Admin for menu changes. No ungranted edit destination is offered. Native
relationship controls remain available independently of the guide.

## Permissions and native state

Only Admin and Site Manager roles exist. Page permissions remain section-scoped.
Layout Defaults, Header and Footer grants retain their existing explicitly
site-wide meaning; a section assignment alone does not grant these settings.
Dependency-read permissions do not become editing capabilities. Every destination
and write is still checked by the existing Payload access policy.

A non-persisted UI field is explicitly registered within Site Structure.
`SiteStructureGuideField` checks the actual Layout Defaults grant, then loads only
the account-owned preference with `overrideAccess: false`, user and current `req`.
It passes minimal capability props, not another copy of settings or hidden records.
The client selects only the native homepage-presence boolean and observes native
dirty/processing/public-version/lock facts. It does not fetch or write settings.
Onward navigation is disabled while dirty or processing. Drawers, other globals,
read-only, trashed and other-editor locks omit the guide; the current lock owner
keeps it. No existing validation, default, publication or storage path changes.

## Presentation and visibility

The presentation reuses authenticated `@shadcnblocks/empty-empty-actions-2`,
reverified 17 October 2026, with its existing Empty/Button composition and native
Payload palette bridge. The sole **Admin / Getting started** Storybook entry adds
homepage absent/selected, limited access, unsaved, processing, public version,
hide/reopen and published-Page navigation states. No duplicate component catalogue
or public website styling is introduced.

`forma-site-structure-guide-v1` stores only this account's dismissed preference,
independent of Site setup, Dashboard and Page help. The shared confirmed-write
adapter handles failure and restores focus. Guidance is optional; its visibility
never grants access or marks a task complete.

## Verification boundary

Focused tests cover capability selection, dependency-read boundaries, native form
states and exclusions, independent confirmed preference writes/failures, request
ownership and the Page-to-settings transition. Existing homepage routing and
feature-access contracts remain applicable. The native journey passes without retries (26.5s), including draft/public
isolation and a denied Page-only Manager update. All six governance journeys pass
without retries (2.3m); full integration has 2,862 passes and one existing Docker
skip. Production build and the private-artifact guard pass (73 traces; no private uploads).
Final release/CI evidence is recorded in the implementation checklist and
feature PR. Broader novice-user
study and launch/handoff acceptance remain separate.

No environment variable, dependency, migration, example seed, automatic menu
insertion or publication is introduced.
