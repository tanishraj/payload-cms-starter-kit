# Reference Content and Navigation Parity Design

## Goal

Port the approved content-management, page-navigation, and News & Events behavior from
`/Users/tanishraj/Tanishraj/Personal Projects/SNMIH-Website` into this repository without replacing
this repository's newer permissions, security, caching, design-system, block, or operational
architecture.

The requested parity covers eight outcomes:

1. Payload REST `POST`, `PATCH`, and `DELETE` operations remain reachable.
2. Published Page path changes create permanent redirects from former paths.
3. Every composable Page section supports a configurable anchor ID.
4. Same-page and cross-page anchor navigation accounts for sticky site chrome.
5. Event editors can manually mark entries as Featured.
6. Event eligibility respects start, end, all-day state, site timezone, and publication state.
7. Highlights show up to three eligible Featured Events followed by three eligible upcoming Events.
8. News & Events Tabs provide complete News and Event directories, including past Events after
   current and upcoming Events.

## Source of Truth and Porting Strategy

The behavior source is the current implementation in `SNMIH-Website`, including the fixes represented
by commits `63a52d2`, `60cd251`, `c2edede`, and `5f26c3d`. The implementation will be ported manually at
the behavior boundary instead of cherry-picking those commits. This repository has since gained a
two-role feature-permission model, operational audits, stricter runtime boundaries, additional blocks,
and newer documentation; a raw cherry-pick could overwrite or bypass those contracts.

Reference source will be adapted only where current interfaces require it. Existing access functions,
cache tags, runtime-origin validation, Page recipes, publication policy, audit hooks, block appearance,
and active-classification relationships remain authoritative here. Generated Payload types will be
regenerated locally rather than copied from the reference repository.

## Existing Gaps

The comparison found that this repository contains parts of the requested behavior but not the final
reference contract:

- The Payload catch-all route exports all REST handlers, but the custom `src/app/api/redirects/route.ts`
  owns `/api/redirects` and shadows Payload's Redirects collection REST endpoint.
- Page path-change redirect logic exists, but it coerces a MongoDB string document ID through
  `Number(doc.id)`, producing an invalid relationship target.
- Composable blocks do not currently receive the shared `anchorId` field and renderers do not create
  stable anchor targets.
- The frontend does not include the reference anchor offset or route-transition scroll guard.
- News & Events Highlights currently interleaves Story and Event entries using a configurable item
  count. It does not expose the Event Featured flag or implement the reference Event-only 3+3 order.
- Event filtering uses an instant-only condition and does not keep all-day Events eligible through the
  end of their calendar date in the configured site timezone.
- News & Events Tabs already exist, but Event tabs omit past Events instead of continuing into a
  complete chronological directory.

## API Route Ownership and Page Redirects

The cached public redirect-map route will move from `/api/redirects` to
`/api/public-redirects`. The request proxy will import its response types from the new module and fetch
the new path. Its existing canonical-origin validation, in-process cache, failure behavior, and request
matcher remain unchanged.

Removing the custom route at `/api/redirects` returns that path to Payload's generated Redirects
collection REST API. The existing Payload catch-all continues exporting `GET`, `POST`, `PATCH`,
`DELETE`, `PUT`, and `OPTIONS`, and Payload access control remains the only authorization authority for
collection writes.

`createRedirectsForChangedPagePath` will preserve `doc.id` in its native string-or-number form. When a
published Page remains published and its resolved path changes, the hook will continue to:

- remove a conflicting enabled redirect at the new live path;
- avoid creating a reverse redirect when a Page reclaims its former path;
- create or update a permanent redirect from the former path;
- target `/` when the renamed Page is the configured homepage; and
- create equivalent redirects for published descendant Pages when a parent path moves.

The hook's nested Payload operations will continue receiving `req`, preserving transaction and access
context.

## Block Anchor Schema

A shared optional `anchorId` text field will be appended by the block-catalog decorator to every block
in the Page, Reusable Section, and News & Events Detail Template registries. This automatically covers
the complete current catalog, including blocks that do not exist in the reference repository.

Anchor IDs will:

- be at most 80 characters;
- begin with a lowercase letter;
- contain only lowercase letters, numbers, and single hyphen separators;
- reject surrounding whitespace and malformed separators;
- reserve `main-content` for the site shell; and
- be unique within each directly edited block layout.

Pages, Reusable Sections, and the News & Events Detail Template will apply layout-level duplicate
validation. Runtime rendering remains defensive: a valid anchor is claimed only once across the
effective render tree, so the first duplicate wins while all duplicate block content remains visible.
This is important when separately valid Reusable Sections are composed into one Page.

The field is additive and optional. Existing Page documents require no content migration.

## Anchor Rendering and Navigation

Production and live-preview renderers will wrap anchored blocks with a neutral element carrying the
resolved `id` and `data-block-anchor="true"`. The wrapper will cover:

- ordinary Page blocks;
- blocks nested in populated Reusable Sections;
- ordinary News & Events detail-template blocks; and
- the dynamic News & Events content block.

The wrapper adds no presentation classes. Blocks without an anchor preserve their existing rendered
structure.

The frontend root will enable smooth fragment scrolling and set
`scroll-padding-top: var(--block-anchor-offset, 1rem)`. The offset will include the CMS toolbar, a
persistent announcement, and the sticky Global Header when those surfaces are present. Reduced-motion
preferences switch smooth scrolling back to immediate scrolling.

The reference route-transition guard will handle same-origin cross-page navigation without animating
the outgoing document to the top before the new route commits. It will:

- intercept only unmodified, same-window, same-origin HTTP(S) links outside API and Admin paths;
- temporarily disable smooth scrolling;
- navigate with Next.js scrolling disabled;
- wait for the frontend route template's commit signal;
- position the committed fragment target, or the top when no target exists; and
- restore the previous scroll behavior, including after a cancelled navigation timeout.

Same-page fragment links remain browser-driven and smooth. External links, downloads, modified clicks,
new-tab links, API links, and Admin links keep their current behavior. The header navigation adjustment
from the reference implementation will be included to prevent dropdown focus restoration from causing
a pre-navigation scroll jump.

## Featured Event Schema and Validation

News & Events entries will gain an indexed `featuredInHighlights` checkbox in Event Details. It will
default to `false` and explain that no more than three eligible manually Featured Events appear.

The field is meaningful only for classifications whose behavior is `event`:

- changing or saving an entry as Story behavior clears `featuredInHighlights` to `false` together with
  other Event-only values;
- an Event still requires Event Start and Event Location;
- Event End cannot precede Event Start; and
- a timed Featured Event requires Event End so it has an unambiguous eligibility boundary.

An all-day Featured Event may omit Event End; in that case Event Start is also its final eligible
calendar date. Existing records are compatible because missing Featured values behave as false.

## Event Eligibility

Eligibility will use the configured site timezone:

- For an all-day Event, the comparison threshold is the start of the current local calendar day. The
  Event remains current through the local day containing Event End, or Event Start when End is absent.
- For a timed Event, the comparison threshold is the current instant. The Event remains current until
  Event End, or until Event Start when End is absent.
- The complementary past filter uses the same boundaries, preventing gaps or overlap between current
  and past Event directories.
- Only published entries in active Event classifications are eligible for Highlights.

News Grid retains its current mixed-entry behavior but will consume the corrected timezone-aware Event
eligibility predicate.

## News & Events Highlights

Highlights will adopt the reference Event-only contract. The classification relationship will allow
only active classifications with Event behavior. An empty selection means all active Event
classifications.

The loader will run two bounded queries in parallel:

1. Up to three eligible published Events where `featuredInHighlights` is true, ordered by Event Start
   and ID.
2. Up to three eligible published Events where `featuredInHighlights` is not true, ordered by Event
   Start and ID.

Results will be concatenated in that order and defensively de-duplicated by document ID. A manual
Featured flag changes priority, not eligibility: expired, unpublished, Story-classified, inactive, or
out-of-scope entries never appear.

The Highlights block's configurable `itemCount` control will be removed from the active schema and
runtime contract to match the reference implementation. Existing stored values will not be deleted by
a migration; Payload will ignore them. Autoplay, controls position, image treatment, classification
scope, actions, appearance, alignment, spacing, and empty-state customization remain available.

Preview snapshot keys and server loaders will no longer include item count because the 3+3 limits are
fixed.

## Complete News & Events Tabs

The existing tabs, selected-classification order, `All` tab, layout choices, appearance settings, and
Load More interaction remain intact. Only Event chronology changes.

Each Event classification directory will be assembled as:

1. current and upcoming Events ordered by Event Start ascending; then
2. past Events ordered by Event Start descending.

For the `All` tab, Story entries remain ordered newest-first and are interleaved with the complete
Event sequence using the existing deterministic interleaving behavior. Prefix-based retrieval will
provide stable pagination without duplicates as visitors load subsequent pages. Specific Story tabs
continue using Payload pagination and newest-first publication ordering.

Highlights and News Grid continue excluding past Events; the complete historical sequence is specific
to the News & Events Tabs directory and detail/feed behavior remains unchanged.

## Compatibility and Security

This change intentionally replaces only the current Highlights selection semantics with the approved
reference behavior. It does not remove or weaken:

- Admin and Site Manager feature grants;
- collection read, create, update, delete, or version access controls;
- publication policy and Review moderation;
- operational audit hooks;
- Payload request threading and transactions;
- public/draft query separation;
- cache tags or revalidation hooks;
- active classification validation;
- media delivery and URL handling;
- current themes, block appearance options, or unrelated Page blocks; or
- request limits and runtime-secret boundaries.

No Atlas or local database content will be mutated as part of implementation. The schema additions are
backward-compatible, and removed `itemCount` data is left untouched for reversibility.

## Failure Handling

- A public redirect-map fetch failure retains the proxy's current safe fallback to its last cached map
  or no redirect.
- Invalid or duplicate saved anchor values never create unsafe or duplicate DOM IDs; block content
  still renders.
- A missing cross-page fragment falls back to the destination page top after commit.
- A cancelled route transition restores scrolling behavior after the bounded timeout.
- Missing or inactive selected classifications fail closed rather than widening a configured scope.
- A failed Highlights query keeps the existing block-level failure handling and empty-state behavior.
- News & Events Tabs pagination errors retain the current Retry state and do not discard loaded items.

## Verification

Focused automated coverage will prove:

- `/api/redirects` is no longer shadowed and `/api/public-redirects` serves the proxy map;
- the Payload catch-all continues exporting write handlers;
- MongoDB string Page IDs produce valid permanent redirects after a published path change;
- every composable block registry contains exactly one anchor field;
- anchor syntax, reserved names, and layout duplicates are rejected;
- production, live preview, nested Reusable Sections, and News & Events detail rendering agree;
- same-page anchors scroll smoothly with sticky-chrome offset and reduced-motion fallback;
- cross-page navigation waits for route commit without pre-navigation jumps;
- Story behavior clears the Featured flag and timed Featured Events require Event End;
- all-day and timed eligibility boundaries use the configured site timezone;
- up to three manually Featured Events precede three automatic upcoming Events;
- Highlight results exclude expired, unpublished, inactive, Story, and out-of-scope entries;
- Event tabs include upcoming/current Events and then past Events in the approved order;
- All-tab pagination remains deterministic and duplicate-free; and
- existing feature permissions still govern all affected Payload collections.

After implementation:

1. Regenerate Payload types and the Admin import map if generation reports an affected component map.
2. Run focused API, redirect, block-anchor, route-transition, News & Events collection, data, Highlights,
   Tabs, and permission tests.
3. Run TypeScript, ESLint, the complete integration suite, and the production build in proportion to
   failures and risk.
4. Run `pnpm project-context:update`, inspect the generated impact, update maintained architecture and
   editor documentation, and finish with `pnpm project-context:check`.

## Acceptance Criteria

- All eight requested behaviors match the reference repository in the current application.
- Current repository-only blocks automatically receive anchor support.
- Existing security, roles, feature permissions, caching, auditing, and unrelated frontend behavior
  remain intact.
- No database dump, migration, deployment, commit beyond the approved workflow, or reference-repository
  modification occurs during implementation.
