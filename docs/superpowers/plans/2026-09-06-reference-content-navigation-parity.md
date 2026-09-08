# Reference Content and Navigation Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the approved REST/redirect, block-anchor navigation, and News & Events discovery behavior from `SNMIH-Website` while retaining this repository's newer governance and runtime contracts.

**Architecture:** Port behavior manually from reference commits `60cd251`, `63a52d2`, `c2edede`, and `5f26c3d` instead of cherry-picking. Keep current access functions, audit hooks, runtime origin handling, cache invalidation, block catalog, and design system; add shared anchor primitives and adapt News & Events queries at their existing domain-service boundary.

**Tech Stack:** Payload CMS 3.88, Next.js 16 App Router, React 19, TypeScript, MongoDB, Vitest, Testing Library, Tailwind CSS 4.

## Global Constraints

- Match the approved reference repository's Event-only Highlights behavior: at most three eligible manually Featured Events followed by three eligible non-featured upcoming Events.
- Keep Admin and Site Manager feature permissions, publication policy, operational audit hooks, cache tags, runtime validation, themes, and unrelated blocks unchanged.
- Do not modify `/Users/tanishraj/Tanishraj/Personal Projects/SNMIH-Website`; it is read-only behavior reference.
- Do not mutate Atlas or local database content and do not add a data migration.
- Retain removed `itemCount` values in stored documents for reversibility, but remove the field from the active schema and runtime contract.
- Regenerate `src/payload-types.ts`; never copy the generated file from the reference repository.
- Thread `req` through nested Payload operations and preserve current collection access enforcement.
- Complete the project-context update/check loop after implementation.

---

### Task 1: Restore Payload Redirect REST Ownership

**Files:**

- Create: `src/app/api/public-redirects/route.ts`
- Delete: `src/app/api/redirects/route.ts`
- Modify: `src/proxy.ts`
- Modify: `src/hooks/createRedirectsForChangedPagePath.ts`
- Modify: `tests/int/proxy.int.spec.ts`
- Modify: `tests/int/redirects.int.spec.ts`
- Modify: `tests/int/api.int.spec.ts`

**Interfaces:**

- Consumes: Payload's existing catch-all exports at `src/app/(payload)/api/[...slug]/route.ts`.
- Produces: `GET /api/public-redirects`, unshadowed Payload CRUD at `/api/redirects`, and string-safe `createRedirectsForChangedPagePath` behavior.

- [ ] **Step 1: Add failing route-ownership and MongoDB-ID tests**

In `tests/int/proxy.int.spec.ts`, require the proxy to fetch the public-only endpoint and prove the conflicting route is absent:

```ts
expect(fetchMock).toHaveBeenCalledWith('https://snmih.in/api/public-redirects', {
  cache: 'no-store',
})
expect(existsSync('src/app/api/redirects/route.ts')).toBe(false)
expect(existsSync('src/app/api/public-redirects/route.ts')).toBe(true)
```

In `tests/int/redirects.int.spec.ts`, pass a MongoDB string ID through a published Page rename and assert the redirect relationship keeps the same value:

```ts
const pageID = '6a851324d90681b916813985'

expect(spies.create).toHaveBeenCalledWith(
  expect.objectContaining({
    collection: 'redirects',
    data: expect.objectContaining({ fromPath: '/departments', page: pageID }),
  }),
)
```

In `tests/int/api.int.spec.ts`, mock `next/cache`, rename a real published Page through the Local API, and assert one published 301 Redirect targets `page.id`.

- [ ] **Step 2: Run focused tests and confirm the current conflicts**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/proxy.int.spec.ts tests/int/redirects.int.spec.ts tests/int/api.int.spec.ts
```

Expected: route ownership and string-ID assertions fail because `/api/redirects` is custom-owned and `doc.id` is coerced to a number.

- [ ] **Step 3: Move the public map and preserve native Page IDs**

Recreate the existing redirect-map route unchanged at `src/app/api/public-redirects/route.ts`, remove the old custom route, and update `src/proxy.ts`:

```ts
import type { RedirectEntry, RedirectsResponse } from './app/api/public-redirects/route'

const res = await fetch(`${baseUrl}/api/public-redirects`, {
  cache: 'no-store',
})
if (!res.ok) throw new Error(`/api/public-redirects returned ${res.status}`)
```

In `createRedirectsForChangedPagePath`, preserve the relationship ID:

```ts
const pageID = doc.id
```

Keep the current `runtimeConfig`, canonical-origin calculation, self-loop rejection, cache, access hooks, and descendant redirect behavior intact.

- [ ] **Step 4: Run the focused tests and verify success**

Run the Step 2 command.

Expected: all three files pass, including the database-backed published Page rename.

- [ ] **Step 5: Commit the route boundary**

```bash
git add src/app/api/public-redirects/route.ts src/app/api/redirects/route.ts src/proxy.ts src/hooks/createRedirectsForChangedPagePath.ts tests/int/proxy.int.spec.ts tests/int/redirects.int.spec.ts tests/int/api.int.spec.ts
git commit -m "fix(api): restore redirect collection writes"
```

### Task 2: Add Block Anchor Schema and Rendering

**Files:**

- Create: `src/blocks/shared/blockAnchor.ts`
- Create: `src/blocks/shared/BlockAnchorWrapper.tsx`
- Modify: `src/blocks/blockCatalog.ts`
- Modify: `src/collections/Pages.ts`
- Modify: `src/collections/ReusableSections.ts`
- Modify: `src/globals/NewsEventsDetailTemplate.ts`
- Modify: `src/blocks/renderPageBlocks.tsx`
- Modify: `src/blocks/renderLivePreviewPageBlocks.tsx`
- Modify: `src/blocks/renderNewsEventDetailBlocks.tsx`
- Modify: `src/blocks/renderLivePreviewNewsEventDetailBlocks.tsx`
- Create: `tests/int/block-anchor-navigation.int.spec.tsx`

**Interfaces:**

- Produces: `createBlockAnchorField()`, `validateUniqueBlockAnchorIDs(value)`, `claimBlockAnchorID(value, usedAnchorIDs)`, and `BlockAnchorWrapper`.
- Consumers: all block registries and production/live-preview Page and News/Event detail renderers.

- [ ] **Step 1: Write failing anchor schema and renderer tests**

Create `tests/int/block-anchor-navigation.int.spec.tsx` from the reference test and adapt preview arguments to the current signatures. Assert:

```ts
expect(registry.every((block) => hasAnchorField(block.fields))).toBe(true)
expect(validateBlockAnchorID('research-2026')).toBe(true)
expect(validateBlockAnchorID('main-content')).toContain('reserved')
expect(
  validateUniqueBlockAnchorIDs([
    { anchorId: 'admissions', blockType: 'pageHeader' },
    { anchorId: 'admissions', blockType: 'richText' },
  ]),
).toContain('used more than once')
expect(html.match(/id="campus-life"/g)).toHaveLength(1)
expect(html).toContain('id="inside-shared"')
```

Cover `pageBuilderBlocks`, `reusableSectionBuilderBlocks`, and
`newsEventsDetailBuilderBlocks`, plus production and live-preview rendering.

- [ ] **Step 2: Run the anchor test and verify it fails**

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/block-anchor-navigation.int.spec.tsx
```

Expected: FAIL because the shared anchor modules and fields do not exist.

- [ ] **Step 3: Add the shared anchor contract**

Create `src/blocks/shared/blockAnchor.ts` with the reference constants and functions:

```ts
export const BLOCK_ANCHOR_ID_MAX_LENGTH = 80
const BLOCK_ANCHOR_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
const RESERVED_BLOCK_ANCHOR_IDS = new Set(['main-content'])

export const normalizeBlockAnchorID = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const anchorID = value.trim()
  return anchorID &&
    anchorID.length <= BLOCK_ANCHOR_ID_MAX_LENGTH &&
    BLOCK_ANCHOR_ID_PATTERN.test(anchorID) &&
    !RESERVED_BLOCK_ANCHOR_IDS.has(anchorID)
    ? anchorID
    : undefined
}
```

Implement the reference validation copy, 80-character `TextField`, duplicate-layout validator, and first-wins claim function. Create the neutral wrapper:

```tsx
export function BlockAnchorWrapper({ anchorID, children }: BlockAnchorWrapperProps) {
  if (!anchorID) return children
  return (
    <div data-block-anchor="true" id={anchorID}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Decorate all current registries and validate layouts**

Append one field in `decorateBlock`:

```ts
fields: [...block.fields, createBlockAnchorField()],
```

Apply `validateUniqueBlockAnchorIDs` to `Pages.layout` and `ReusableSections.layout`. At the start of `validateNewsEventsDetailLayout`, return an anchor error before checking the required dynamic-content block:

```ts
const anchorValidation = validateUniqueBlockAnchorIDs(value)
if (anchorValidation !== true) return anchorValidation
```

- [ ] **Step 5: Wrap every effective render tree with first-wins IDs**

Add `usedAnchorIDs: Set<string>` to both renderer argument types, initialize each root with:

```ts
usedAnchorIDs: new Set(['main-content'])
```

Split each Page renderer's current switch into an internal content function. The exported node renderer claims and wraps the block while preserving existing error boundaries, preload state, nesting depth, preview snapshots, and Reusable Section recursion:

```tsx
const anchorID = claimBlockAnchorID(block.anchorId, args.usedAnchorIDs)
const content = renderPageBlockContent(block, index, args, depth)

return content ? (
  <BlockAnchorWrapper anchorID={anchorID} key={key}>
    {content}
  </BlockAnchorWrapper>
) : null
```

In both News/Event detail renderers, use the same `usedAnchorIDs` set for Page-compatible blocks and wrap the dynamic `newsEventsContent` block explicitly.

- [ ] **Step 6: Run the anchor and affected renderer tests**

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/block-anchor-navigation.int.spec.tsx tests/int/news-events-detail-template.int.spec.tsx tests/int/reusable-sections.int.spec.tsx
```

Expected: PASS. If the repository has no `reusable-sections.int.spec.tsx`, omit only that nonexistent path and keep the reusable rendering assertions in the anchor test.

- [ ] **Step 7: Commit schema and rendering support**

```bash
git add src/blocks/shared/blockAnchor.ts src/blocks/shared/BlockAnchorWrapper.tsx src/blocks/blockCatalog.ts src/collections/Pages.ts src/collections/ReusableSections.ts src/globals/NewsEventsDetailTemplate.ts src/blocks/renderPageBlocks.tsx src/blocks/renderLivePreviewPageBlocks.tsx src/blocks/renderNewsEventDetailBlocks.tsx src/blocks/renderLivePreviewNewsEventDetailBlocks.tsx tests/int/block-anchor-navigation.int.spec.tsx
git commit -m "feat(blocks): add section anchors"
```

### Task 3: Add Offset-Aware Anchor Navigation

**Files:**

- Create: `src/components/global/RouteTransitionScrollGuard.tsx`
- Create: `src/app/(frontend)/template.tsx`
- Modify: `src/app/(frontend)/layout.tsx`
- Modify: `src/components/global/GlobalHeader.tsx`
- Modify: `src/components/header/HeaderNavMenu.tsx`
- Modify: `src/blocks/HeaderNavbar12/config.ts`
- Modify: `src/blocks/HeroBanner/config.ts`
- Modify: `src/blocks/HeroCarousel/config.ts`
- Modify: `src/blocks/shared/contentActionsFields.ts`
- Modify: `src/collections/NavigationLinks.ts`
- Modify: `src/styles/globals.css`
- Modify: `tests/int/block-anchor-navigation.int.spec.tsx`
- Create: `tests/int/route-transition-scroll-guard.int.spec.tsx`

**Interfaces:**

- Produces: `RouteTransitionScrollGuard` and `RouteTransitionCommitSignal` using the private `snmih:frontend-route-commit` browser event.
- Consumes: `isGlobalHeaderSticky`, `--cms-toolbar-offset`, `--global-announcement-height`, and rendered DOM anchor IDs from Task 2.

- [ ] **Step 1: Add failing CSS/layout and route-transition tests**

Extend the anchor contract to assert:

```ts
expect(globalStyles).toContain('scroll-behavior: smooth')
expect(globalStyles).toContain('scroll-padding-top: var(--block-anchor-offset, 1rem)')
expect(globalStyles).toMatch(
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?scroll-behavior: auto/,
)
expect(frontendLayout).toContain("'--block-anchor-offset': blockAnchorOffset")
expect(frontendLayout).toContain('data-scroll-behavior="smooth"')
```

Create the reference route-transition test suite covering destination commit, cross-page fragments,
same-page fragments, dropdown focus, excluded links, and cancellation timeout.

- [ ] **Step 2: Run tests and verify missing navigation behavior**

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/block-anchor-navigation.int.spec.tsx tests/int/route-transition-scroll-guard.int.spec.tsx
```

Expected: FAIL because the guard, template, root data attribute, offset, and CSS do not exist.

- [ ] **Step 3: Port the current reference route-transition guard**

Port `RouteTransitionScrollGuard.tsx` from reference commit `5f26c3d` without introducing server imports. Retain these navigation boundaries:

```ts
if (
  destinationURL.origin !== currentURL.origin ||
  !['http:', 'https:'].includes(destinationURL.protocol) ||
  destinationURL.pathname.startsWith('/api/') ||
  destinationURL.pathname.startsWith('/_next/') ||
  destinationURL.pathname === '/admin' ||
  destinationURL.pathname.startsWith('/admin/') ||
  destinationURL.pathname === currentURL.pathname
) {
  return null
}
```

Use `router.push(pathWithSearchAndHash, { scroll: false })`, dispatch the commit event from the new frontend template in `useLayoutEffect`, position a committed fragment with `behavior: 'auto'`, and restore the prior root style after success or 15 seconds.

- [ ] **Step 4: Add site-chrome offset and CSS behavior**

Import `isGlobalHeaderSticky`, compute the announcement fallback once, and add:

```ts
const blockAnchorOffset = isGlobalHeaderSticky(activeHeader)
  ? `calc(${cmsToolbarOffset} + var(--global-announcement-height, ${announcementHeight}) + 6rem)`
  : '1rem'
```

Set the CSS variable in `htmlStyle`, add `data-scroll-behavior="smooth"` to `<html>`, mount the guard first in `<body>`, and add:

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: var(--block-anchor-offset, 1rem);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

Port the reference `HeaderNavMenu` client boundary and mouse `onPointerDown` prevention without changing its sizes, classes, links, or menu data.

- [ ] **Step 5: Run navigation tests and verify success**

Run the Step 2 command.

Expected: PASS with no navigation timer or DOM cleanup leaks.

- [ ] **Step 6: Commit navigation behavior**

```bash
git add src/components/global/RouteTransitionScrollGuard.tsx src/app/'(frontend)'/template.tsx src/app/'(frontend)'/layout.tsx src/components/header/HeaderNavMenu.tsx src/styles/globals.css tests/int/block-anchor-navigation.int.spec.tsx tests/int/route-transition-scroll-guard.int.spec.tsx
git commit -m "feat(navigation): add anchor scroll handling"
```

### Task 4: Add Featured Event Validation and Eligibility

**Files:**

- Modify: `src/collections/NewsEvents.ts`
- Modify: `src/hooks/resolveNewsEventClassification.ts`
- Modify: `src/lib/newsEvents.ts`
- Modify: `tests/int/news-events-collection.int.spec.ts`
- Modify: `tests/int/news-events-data.int.spec.ts`

**Interfaces:**

- Produces: optional indexed `featuredInHighlights`, timezone-aware `currentOrUpcomingEventWhere(nowISO, timeZone)`, and complementary `pastEventWhere(nowISO, timeZone)`.
- Consumers: Highlights, Tabs, News Grid, preview snapshots, and generated `NewsEvent` types.

- [ ] **Step 1: Add failing schema, validation, and boundary tests**

Assert the collection field contract:

```ts
expect(findNamedField(NewsEvents.fields, 'featuredInHighlights')).toMatchObject({
  defaultValue: false,
  index: true,
  type: 'checkbox',
})
```

Add hook tests proving Story behavior clears the flag, a timed Featured Event without `eventEnd` throws, and an all-day Featured Event without `eventEnd` remains valid.

Add data tests proving the where clauses distinguish all-day from timed Events:

```ts
expect(currentOrUpcomingEventWhere(nowISO, 'Asia/Kolkata')).toEqual({
  or: [
    { and: [{ eventAllDay: { equals: true } }, expect.any(Object)] },
    { and: [expect.any(Object), expect.any(Object)] },
  ],
})
expect(pastEventWhere(nowISO, 'Asia/Kolkata')).toEqual(
  expect.objectContaining({ or: expect.any(Array) }),
)
```

- [ ] **Step 2: Run focused collection and data tests**

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/news-events-collection.int.spec.ts tests/int/news-events-data.int.spec.ts
```

Expected: FAIL on the missing field, validation, and timezone-aware query helpers.

- [ ] **Step 3: Add the Event-only Featured field and hook behavior**

Add the reference checkbox after `eventAllDay`. In `validateEventFields`, use effective update values:

```ts
if (rawEventEnd === null || rawEventEnd === undefined || rawEventEnd === '') {
  const isFeatured = getEffectiveValue(data, originalDoc, 'featuredInHighlights') === true
  const isAllDay = getEffectiveValue(data, originalDoc, 'eventAllDay') === true
  if (isFeatured && !isAllDay) {
    throw new APIError('Event End is required when a timed Event is featured in Highlights.', 400)
  }
  return
}
```

Set `data.featuredInHighlights = false` in `clearNewsEventEventFields`.

- [ ] **Step 4: Implement timezone-aware complementary predicates**

Import `getZonedDayBounds` and `getZonedToday`, then add the reference `allDayEventWhere`, `timedEventWhere`, `eventEndingOnOrAfter`, and `eventEndingBefore` helpers. Implement:

```ts
export const currentOrUpcomingEventWhere = (nowISO: string, timeZone = DEFAULT_SITE_TIME_ZONE) => {
  const todayStartISO = getZonedDayBounds(getZonedToday(nowISO, timeZone), timeZone).startISO
  return {
    or: [
      { and: [allDayEventWhere, eventEndingOnOrAfter(todayStartISO)] },
      { and: [timedEventWhere, eventEndingOnOrAfter(nowISO)] },
    ],
  }
}
```

Implement `pastEventWhere` with `eventEndingBefore` and the same thresholds. Pass `timeZone` at every existing eligibility call, including News Grid.

- [ ] **Step 5: Run focused tests and verify success**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 6: Commit Event schema and eligibility**

```bash
git add src/collections/NewsEvents.ts src/hooks/resolveNewsEventClassification.ts src/lib/newsEvents.ts tests/int/news-events-collection.int.spec.ts tests/int/news-events-data.int.spec.ts
git commit -m "feat(events): add featured eligibility"
```

### Task 5: Adopt the Reference Event-Only Highlights Contract

**Files:**

- Modify: `src/blocks/NewsEventsHighlights/config.ts`
- Modify: `src/blocks/NewsEventsHighlights/newsEventsHighlightsShared.ts`
- Modify: `src/blocks/NewsEventsHighlights/Component.tsx`
- Modify: `src/blocks/NewsEventsHighlights/Presentation.tsx`
- Modify: `src/blocks/NewsEventsHighlights/PreviewComponent.tsx`
- Modify: `src/lib/newsEvents.ts`
- Modify: `src/lib/newsEventsPreviewShared.ts`
- Modify: `src/lib/newsEventsPreviewSnapshot.ts`
- Modify: `tests/int/news-events-highlights-loader.int.spec.ts`
- Modify: `tests/int/news-events-highlights.int.spec.tsx`
- Modify: `tests/int/news-grid.int.spec.tsx`
- Modify: `tests/int/news-events-detail-template.int.spec.tsx`
- Modify: `src/block-thumbnails/fixtures.tsx`

**Interfaces:**

- Produces: fixed `NEWS_EVENTS_HIGHLIGHTS_FEATURED_LIMIT = 3`, `NEWS_EVENTS_HIGHLIGHTS_UPCOMING_LIMIT = 3`, and `getNewsEventsHighlights(classificationIDs, nowISO)`.
- Consumes: `featuredInHighlights` and timezone-aware eligibility from Task 4.

- [ ] **Step 1: Replace automatic-mixed loader expectations with failing 3+3 tests**

Update loader fixtures to include `featuredInHighlights`. Require this result order:

```ts
expect(result.map(({ id }) => id)).toEqual([
  'featured-1',
  'featured-2',
  'featured-3',
  'upcoming-1',
  'upcoming-2',
  'upcoming-3',
])
```

Assert two Event-only queries use limits of three, the shared eligibility predicate, and respectively:

```ts
{
  featuredInHighlights: {
    equals: true
  }
}
{
  featuredInHighlights: {
    not_equals: true
  }
}
```

Keep strict selected-classification validation and add defensive overlap de-duplication.

- [ ] **Step 2: Run Highlights tests and confirm failure**

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/news-events-highlights-loader.int.spec.ts tests/int/news-events-highlights.int.spec.tsx tests/int/news-events-detail-template.int.spec.tsx
```

Expected: FAIL because Highlights still accepts item count and mixes Stories with Events.

- [ ] **Step 3: Fix the block schema and shared contract**

Remove `itemCount` from the active schema and presentation type. Limit classification options:

```ts
filterOptions: {
  active: { equals: true },
  behavior: { equals: 'event' },
}
```

Add the fixed constants and simplify the preview key:

```ts
export const NEWS_EVENTS_HIGHLIGHTS_FEATURED_LIMIT = 3
export const NEWS_EVENTS_HIGHLIGHTS_UPCOMING_LIMIT = 3
export const getNewsEventsHighlightsPreviewKey = (classificationIDs: readonly string[]) =>
  JSON.stringify(classificationIDs)
```

Update empty-state and classification help copy to the exact reference meaning.

- [ ] **Step 4: Replace the loader with two bounded Event queries**

Add `featuredInHighlights` to `NewsEventCardRecord` and `cardSelect`. Resolve only active Event behavior classifications; query both groups in parallel, concatenate Featured first, de-duplicate by string ID, and map with the current public-card converter.

The exported loader signature becomes:

```ts
export const getNewsEventsHighlights = cache(
  async (classificationIDs: readonly string[], nowISO: string) => {
    // load Payload and site timezone, then call fetchNewsEventsHighlights
  },
)
```

Update server, preview snapshot, preview renderer, thumbnail fixtures, and tests so no Highlights snapshot key or runtime call includes item count.

- [ ] **Step 5: Run all Highlights consumers**

Run the Step 2 command, then:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/news-events-metadata-routes.int.spec.ts tests/int/news-events-featured-carousel.int.spec.tsx
```

Expected: PASS with fixed 3+3 ordering and no stale `itemCount` assumptions.

- [ ] **Step 6: Commit Highlights parity**

```bash
git add src/blocks/NewsEventsHighlights src/lib/newsEvents.ts src/lib/newsEventsPreviewShared.ts src/lib/newsEventsPreviewSnapshot.ts src/block-thumbnails/fixtures.tsx tests/int/news-events-highlights-loader.int.spec.ts tests/int/news-events-highlights.int.spec.tsx tests/int/news-events-detail-template.int.spec.tsx tests/int/news-events-metadata-routes.int.spec.ts tests/int/news-events-featured-carousel.int.spec.tsx
git commit -m "feat(events): prioritize featured highlights"
```

### Task 6: Make News & Events Tabs Complete

**Files:**

- Modify: `src/lib/newsEvents.ts`
- Modify: `tests/int/news-events-data.int.spec.ts`
- Modify: `tests/int/news-events-tabs.int.spec.tsx`

**Interfaces:**

- Produces: complete Event directory prefixes: current/upcoming ascending followed by past descending.
- Consumes: `pastEventWhere`, `currentOrUpcomingEventWhere`, `classificationScopeWhere`, current public-card conversion, and existing deterministic interleaving.

- [ ] **Step 1: Add failing complete-directory pagination tests**

Add assertions that a specific Event tab returns current/upcoming Events before recent past Events and that page boundaries neither duplicate nor skip IDs:

```ts
expect(first.docs.map(({ id }) => id)).toEqual(['upcoming-1', 'upcoming-2'])
expect(second.docs.map(({ id }) => id)).toEqual(['past-2', 'past-1'])
expect(new Set([...first.docs, ...second.docs].map(({ id }) => id)).size).toBe(4)
```

Assert the loader performs one ascending current query and one descending past query with complementary predicates. In `tests/int/news-events-tabs.int.spec.tsx`, keep the existing Load More response test and change its Event fixtures so the appended response contains the first past Event after the current/upcoming prefix.

- [ ] **Step 2: Run data and Tabs tests and verify current omission**

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/news-events-data.int.spec.ts tests/int/news-events-tabs.int.spec.tsx
```

Expected: FAIL because past Events are filtered out.

- [ ] **Step 3: Add a de-duplicated Event directory prefix helper**

Implement the reference helper:

```ts
async function fetchEventDirectoryPrefix(payload, { limit, nowISO, scopeWhere, timeZone }) {
  const [currentResult, pastResult] = await Promise.all([
    payload.find({
      collection: 'news-events',
      depth: 1,
      limit,
      overrideAccess: true,
      select: cardSelect,
      sort: ['eventStart', 'id'],
      where: {
        and: [...publishedWhere, scopeWhere, currentOrUpcomingEventWhere(nowISO, timeZone)],
      },
    }),
    payload.find({
      collection: 'news-events',
      depth: 1,
      limit,
      overrideAccess: true,
      select: cardSelect,
      sort: ['-eventStart', '-id'],
      where: { and: [...publishedWhere, scopeWhere, pastEventWhere(nowISO, timeZone)] },
    }),
  ])

  return uniqueNewsEventRecords(currentResult.docs, pastResult.docs).slice(0, limit)
}
```

Use this helper in mixed `All` prefixes and specific Event pages. Keep specific Story tabs on current Payload pagination and sort. Retrieve `end + 1` records before slicing so `hasNextPage` remains accurate.

- [ ] **Step 4: Run complete-directory and regression tests**

Run the Step 2 command, then:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/news-grid.int.spec.tsx tests/int/news-events-feed-route.int.spec.ts
```

Expected: PASS. Tabs include history; Highlights and News Grid still exclude past Events.

- [ ] **Step 5: Commit complete listing behavior**

```bash
git add src/lib/newsEvents.ts tests/int/news-events-data.int.spec.ts tests/int/news-events-tabs.int.spec.tsx tests/int/news-grid.int.spec.tsx tests/int/news-events-feed-route.int.spec.ts
git commit -m "feat(events): include complete tab history"
```

### Task 7: Regenerate Contracts, Document Behavior, and Verify

**Files:**

- Modify: `src/payload-types.ts`
- Modify: `.agents/skills/project-context/references/architecture.md`
- Modify: `.agents/skills/project-context/references/payload-model.md`
- Modify: `.agents/skills/project-context/references/block-system.md`
- Modify: `.agents/skills/project-context/references/project-inventory.json`
- Modify: `docs/architecture/content-model-map.md`
- Modify: `docs/architecture/feature-inventory.md`
- Modify: `docs/guides/blocks.md`
- Modify: `docs/guides/news-events.md`
- Modify: `docs/guides/redirects.md`

**Interfaces:**

- Consumes: all implemented source changes.
- Produces: regenerated Payload types, accurate maintained documentation, and a verified release candidate.

- [ ] **Step 1: Regenerate Payload-owned artifacts**

```bash
pnpm generate:types
pnpm generate:importmap
```

Expected: `src/payload-types.ts` contains optional `anchorId` on current block types and optional `featuredInHighlights` on News/Event entries. The import map should remain unchanged unless the new client modules are referenced through Payload Admin component paths.

- [ ] **Step 2: Run focused formatting and static checks**

```bash
pnpm exec prettier --check src tests docs .agents/skills/project-context/references
pnpm exec tsc --noEmit
pnpm lint
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 3: Run the complete integration suite**

```bash
pnpm test:int
```

Expected: all integration files pass without feature-permission, preview, cache, or renderer regressions.

- [ ] **Step 4: Run the production build**

```bash
pnpm build
```

Expected: Next.js production build succeeds, including frontend template, server/client boundaries, generated Open Graph routes, and Payload Admin.

- [ ] **Step 5: Update project knowledge and editor/operator guides**

Run:

```bash
pnpm project-context:update
```

Inspect the generated inventory diff. Update maintained narratives to document:

- `/api/public-redirects` versus Payload-owned `/api/redirects`;
- Page/Reusable/News Detail anchor fields and route-transition behavior;
- Event-only fixed 3+3 Highlights;
- all-day/timed timezone eligibility; and
- complete Event history in News & Events Tabs.

Do not rewrite historical files under `docs/superpowers/**`.

- [ ] **Step 6: Verify project-context consistency and final diff scope**

```bash
pnpm project-context:check
git status --short
git diff --stat develop...HEAD
git diff --check develop...HEAD
```

Expected: context check succeeds. The final diff contains only the approved specification, plan, parity source/tests, regenerated types/inventory, and maintained documentation. The reference repository and database remain untouched.

- [ ] **Step 7: Commit generated contracts and documentation**

```bash
git add src/payload-types.ts .agents/skills/project-context/references docs/architecture docs/guides docs/superpowers/plans/2026-09-06-reference-content-navigation-parity.md
git commit -m "docs: record content navigation parity"
```

- [ ] **Step 8: Report verification without pushing or deploying**

Report the branch, commit list, exact commands run, any skipped command with reason, and the remaining operational step of deploying only after user approval. Do not push, merge, deploy, or mutate a database.
