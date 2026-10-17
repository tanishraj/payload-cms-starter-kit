# Section-aware Page recipes

Admins and Site Managers can create a Page from Blank or Landing. Blank creates an
empty layout; Landing creates Page Header followed by automatic Breadcrumb. The
existing recipe descriptions and included-block labels describe those exact
code-owned layouts. All supported Page blocks remain available in native editing.

## Site Manager flow

1. Open Create a Page, enter a title and choose the starting point.
2. Choose Website section. A single available section is preselected; multiple
   sections require a deliberate choice. Options show the title and current root
   slug (or ID when no slug is available), so matching titles remain distinguishable.
3. Create draft. The Page is created directly under that section root, then opens
   in Payload's native editor. Nothing is published or assigned as the homepage.
4. To create beneath a deeper parent immediately, choose **Use the native Page
   editor** before creating. The same option is available to Admins. A Manager can
   also change the saved draft's parent within that section using native fields.

Native editing of existing Pages and relationship-drawer creation are unchanged.
The native alternative uses the ordinary create route with `?editor=native`; it
changes only presentation, never grants or server policy. It does not transfer an
unsaved recipe title to a separate native form. Choose the editing path first.

## Availability and recovery

The client reads the native Pages collection REST API using current session
credentials, no-store, draft reads, depth zero, a root-only filter and selected
ID/title/slug/parent fields. It never enumerates another account or supplies its
own access decision. Payload's Mongo adapter treats `parent exists false` as
missing/null/empty; real database tests verify this query returns only assigned
roots, excluding descendants and another section.

The first release supports the existing maximum of 50 root grants. It rejects a
partial/paginated or malformed response rather than presenting an incomplete
choice. No extra permission endpoint or cross-request permission cache exists.

Loading disables creation but leaves title/recipe editing available. A real empty
result or native 403 explains that active sections and Pages access are needed.
Network errors, 401, other HTTP failures and malformed/partial responses use a
separate load-error state. Retry reloads availability while retaining the entered
title and recipe; outstanding reads are aborted on unmount/retry. A lost grant
still fails on the server even if its old option remains on screen.

Creation reuses `POST /api/pages/create-from-recipe`, with the selected root as
`parent`. Its existing Payload call retains `draft: true`, current `req`, `user`
and `overrideAccess: false`; collection access and section hooks remain the
security boundary. An error preserves title, recipe and selected section. After
a confirmed save, the Create action stays disabled and **Open the created draft**
remains available, including if client navigation fails. This prevents a second
creation after a known successful save; ambiguous network outcomes are not a new
idempotency guarantee.

## Presentation and verification

The new section selector comes from authenticated Shadcnblocks
`@shadcnblocks/field-field-selects-2` and `@shadcnblocks/select-select-full-width`,
using existing field/select/button dependencies. Production owns data and access;
**Admin / Page section** imports that presentation with synthetic options, controls,
loading/empty/error/pending/long-content states and interaction examples. Scoped
native styles inherit Payload's palette; Storybook uses official Neutral. The
existing recipe-card presentation is preserved.

Focused tests cover the controller, native alternative, partial/invalid reads,
recovery, single/multiple choices and the real Payload/Mongo draft/access path.
The native browser journey creates a two-section Manager, simulates a section-load
outage, preserves inputs on retry, requires an explicit choice, excludes another
root, creates a Landing draft and verifies native editing, stored layout,
anonymous denial and forged-parent rejection. The existing Manager native-create
journey explicitly takes the alternative, preserving both paths as regressions.
Release results belong to the implementation checklist and feature PR. This is
not a novice-user study or certification of all onboarding. No environment
variable, dependency, schema field, migration, provider or automatic seed changes.
