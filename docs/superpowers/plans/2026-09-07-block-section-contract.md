# Block Section Contract Implementation Plan

## Completion

Implemented and verified on 2026-09-07. Production and live-preview switches already forwarded
complete block objects, so parity was enforced with render tests instead of no-op renderer edits.
Verification passed 240 focused tests, the complete 2,127-test integration suite (with one intentional
skip), TypeScript, lint with one pre-existing warning, project-context validation, and a production
build under the required Node 22 engine with a temporary HTTPS verification origin.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize section anatomy, action behavior, theme settings, validation, and compatibility across all 57 registered Page blocks without breaking existing content.

**Architecture:** Add small Payload field factories, a catalog-owned block-profile registry, and server-safe section presentation primitives. Migrate standard blocks in bounded batches, retain hidden or runtime legacy fallbacks for renamed fields, and enforce the result with catalog-derived schema and render tests.

**Tech Stack:** Payload CMS 3, Next.js 16 App Router, React 19 Server Components, TypeScript, Tailwind CSS, Vitest, existing Payload generators.

## Global Constraints

- Preserve every existing block slug, block ID, stored relationship, action value, and reusable-section behavior.
- Do not bulk rewrite local or production MongoDB data.
- Do not delete compatibility fields during this implementation.
- Keep general actions on `createContentActionsField`, `resolveCmsActions`, and `ContentActions`.
- Section Content Alignment affects introductions and section action groups, not card, table, calendar, gallery, form, or carousel body geometry.
- Shared presentation primitives must remain server-capable and must not add a client boundary.
- Preserve production/live-preview parity and the existing hero preload assignment.
- Do not add dependencies.
- Do not push commits to a remote.

---

### Task 1: Add catalog-owned section profiles and schema factories

**Files:**

- Create: `src/blocks/shared/blockSectionProfiles.ts`
- Create: `src/blocks/shared/sectionFields.ts`
- Create: `tests/int/block-section-schema-contract.int.spec.ts`
- Modify: `tests/int/block-catalog.int.spec.ts`

**Interfaces:**

- Consumes: `pageBuilderBlocks`, `createBlockAppearanceFields`, and `createContentActionsField`.
- Produces: `blockSectionProfiles`, `BlockSectionProfile`, `createSectionAlignmentField`,
  `createSectionPaddingField`, `createIntroductionActionsField`, `createFooterActionsField`, and
  `createSectionThemeFields`.

- [ ] **Step 1: Write the failing profile-coverage test**

```ts
import { pageBuilderBlocks } from '@/blocks/blockCatalog'
import { blockSectionProfiles } from '@/blocks/shared/blockSectionProfiles'

it('classifies every registered Page block exactly once', () => {
  expect(Object.keys(blockSectionProfiles).sort()).toEqual(
    pageBuilderBlocks.map(({ slug }) => slug).sort(),
  )
})
```

The registry must classify blocks as `standard`, `hero`, `contentOnly`, `utility`, or `structural`.
Hero Banner and Hero Carousel are `hero`; Rich Text, Stats Strip, and Quote are `contentOnly`;
Announcement and Breadcrumb are `utility`; Reusable Section is `structural`; every other Page block
is `standard`.

- [ ] **Step 2: Write failing field-factory tests**

```ts
expect(createSectionAlignmentField()).toMatchObject({
  name: 'contentAlignment',
  type: 'select',
  defaultValue: 'left',
  required: true,
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
})

expect(createSectionPaddingField()).toMatchObject({
  name: 'size',
  type: 'select',
  defaultValue: 'default',
  required: true,
})

expect(createIntroductionActionsField()).toMatchObject({
  name: 'actions',
  label: 'Introduction Actions',
  maxRows: 2,
})

expect(createFooterActionsField()).toMatchObject({
  name: 'footerActions',
  label: 'Footer Actions',
  maxRows: 2,
})
```

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```bash
pnpm exec vitest run tests/int/block-section-schema-contract.int.spec.ts tests/int/block-catalog.int.spec.ts
```

Expected: FAIL because the new modules do not exist.

- [ ] **Step 4: Implement the profile registry**

```ts
export type BlockSectionProfile =
  | 'contentOnly'
  | 'hero'
  | 'standard'
  | 'structural'
  | 'utility'

export const blockSectionProfiles = {
  pageHeader: 'standard',
  heroBanner: 'hero',
  reusableSection: 'structural',
  richText: 'contentOnly',
  aboutSection: 'standard',
  featureSpotlight: 'standard',
  contentHighlights: 'standard',
  academicProgrammes: 'standard',
  newsEventsTabs: 'standard',
  calendar: 'standard',
  annualCalendar: 'standard',
  departmentProfiles: 'standard',
  galleryAlbumTabs: 'standard',
  qaAccordion: 'standard',
  statsStrip: 'contentOnly',
  testimonialSpotlight: 'standard',
  accreditationCards: 'standard',
  bannerCta: 'standard',
  contact24: 'standard',
  downloadList: 'standard',
  heroCarousel: 'hero',
  announcement: 'utility',
  newsGrid: 'standard',
  cta39: 'standard',
  galleryCoverflow: 'standard',
  featureMatrix: 'standard',
  editorialReasons: 'standard',
  leadershipProfiles: 'standard',
  newsEventsHighlights: 'standard',
  profileCarousel: 'standard',
  galleryShowcase: 'standard',
  eventGallery: 'standard',
  imageMosaic: 'standard',
  studentExperience: 'standard',
  ratingSpotlight: 'standard',
  reviewFeed: 'standard',
  reviewSubmission: 'standard',
  contact33: 'standard',
  teamShowcase: 'standard',
  services21: 'standard',
  videoEmbed: 'standard',
  mediaCarousel: 'standard',
  programMatrix: 'standard',
  logoStrip: 'standard',
  breadcrumb: 'utility',
  timeline: 'standard',
  iconCardShowcase: 'standard',
  iconGrid: 'standard',
  quoteBlock: 'contentOnly',
  tabsContent: 'standard',
  feeStructure: 'standard',
  pgFeeStructure: 'standard',
  bankDetails: 'standard',
  numberedSteps: 'standard',
  bentoGrid: 'standard',
  testimonialGrid: 'standard',
  awardsList: 'standard',
} as const satisfies Record<string, BlockSectionProfile>
```

Do not import block configs into this client-safe metadata module.

- [ ] **Step 5: Implement focused field factories**

```ts
export type SectionContentAlignment = 'center' | 'left' | 'right'

export const createSectionAlignmentField = ({
  defaultValue = 'left',
  name = 'contentAlignment',
}: {
  defaultValue?: SectionContentAlignment
  name?: string
} = {}): SelectField => ({
  name,
  label: 'Section Content Alignment',
  type: 'select',
  defaultValue,
  required: true,
  options: sectionAlignmentOptions,
  admin: {
    description:
      'Aligns the section introduction, Introduction Actions, and Footer Actions. Block content keeps its own layout.',
  },
})

export const createSectionPaddingField = ({ name = 'size' } = {}): SelectField => ({
  name,
  label: 'Section Padding',
  type: 'select',
  defaultValue: 'default',
  required: true,
  options: sectionPaddingOptions,
})

export const createIntroductionActionsField = (options = {}) =>
  createContentActionsField({ label: 'Introduction Actions', maxRows: 2, ...options })

export const createFooterActionsField = (options = {}) =>
  createContentActionsField({ name: 'footerActions', label: 'Footer Actions', maxRows: 2, ...options })
```

`createSectionThemeFields` returns appearance, alignment, and padding fields while accepting field
name/default overrides for compatibility cases.

- [ ] **Step 6: Run the focused tests**

Run the command from Step 3. Expected: PASS.

- [ ] **Step 7: Commit the contract foundation**

```bash
git add src/blocks/shared/blockSectionProfiles.ts src/blocks/shared/sectionFields.ts tests/int/block-section-schema-contract.int.spec.ts tests/int/block-catalog.int.spec.ts
git commit -m "refactor(blocks): define section contracts"
```

---

### Task 2: Normalize standard block authoring order and theme fields

**Files:**

- Modify: `src/blocks/PageHeader/config.ts`
- Modify: `src/blocks/AboutSection/config.ts`
- Modify: `src/blocks/FeatureSpotlight/config.ts`
- Modify: `src/blocks/ContentHighlights/config.ts`
- Modify: `src/blocks/AcademicProgrammes/config.ts`
- Modify: `src/blocks/NewsEventsTabs/config.ts`
- Modify: `src/blocks/Calendar/config.ts`
- Modify: `src/blocks/AnnualCalendar/config.ts`
- Modify: `src/blocks/DepartmentProfiles/config.ts`
- Modify: `src/blocks/GalleryAlbumTabs/config.ts`
- Modify: `src/blocks/QaAccordion/config.ts`
- Modify: `src/blocks/TestimonialSpotlight/config.ts`
- Modify: `src/blocks/AccreditationCards/config.ts`
- Modify: `src/blocks/BannerCta/config.ts`
- Modify: `src/blocks/Contact24/config.ts`
- Modify: `src/blocks/DownloadList/config.ts`
- Modify: `src/blocks/NewsGrid/config.ts`
- Modify: `src/blocks/Cta39/config.ts`
- Modify: `src/blocks/GalleryCoverflow/config.ts`
- Modify: `src/blocks/FeatureMatrix/config.ts`
- Modify: `src/blocks/EditorialReasons/config.ts`
- Modify: `src/blocks/LeadershipProfiles/config.ts`
- Modify: `src/blocks/NewsEventsHighlights/config.ts`
- Modify: `src/blocks/ProfileCarousel/config.ts`
- Modify: `src/blocks/GalleryShowcase/config.ts`
- Modify: `src/blocks/EventGallery/config.ts`
- Modify: `src/blocks/ImageMosaic/config.ts`
- Modify: `src/blocks/StudentExperience/config.ts`
- Modify: `src/blocks/RatingSpotlight/config.ts`
- Modify: `src/blocks/ReviewFeed/config.ts`
- Modify: `src/blocks/ReviewSubmission/config.ts`
- Modify: `src/blocks/Contact33/config.ts`
- Modify: `src/blocks/TeamShowcase/config.ts`
- Modify: `src/blocks/Services21/config.ts`
- Modify: `src/blocks/VideoEmbed/config.ts`
- Modify: `src/blocks/MediaCarousel/config.ts`
- Modify: `src/blocks/ProgramMatrix/config.ts`
- Modify: `src/blocks/LogoStrip/config.ts`
- Modify: `src/blocks/Timeline/config.ts`
- Modify: `src/blocks/IconCardShowcase/config.ts`
- Modify: `src/blocks/IconGrid/config.ts`
- Modify: `src/blocks/TabsContent/config.ts`
- Modify: `src/blocks/FeeStructure/config.ts`
- Modify: `src/blocks/PGFeeStructure/config.ts`
- Modify: `src/blocks/BankDetails/config.ts`
- Modify: `src/blocks/NumberedSteps/config.ts`
- Modify: `src/blocks/BentoGrid/config.ts`
- Modify: `src/blocks/TestimonialGrid/config.ts`
- Modify: `src/blocks/AwardsList/config.ts`
- Modify: `tests/int/block-section-schema-contract.int.spec.ts`
- Modify: `tests/int/block-theme-tabs.int.spec.ts`
- Modify: `tests/int/regular-block-spacing.int.spec.tsx`

**Interfaces:**

- Consumes: the factories and profile registry from Task 1.
- Produces: one consistent standard-section Content order and Theme Settings contract.

- [ ] **Step 1: Add catalog-derived failing assertions for standard blocks**

The test must recursively unwrap only the top-level Content and Theme Settings tabs, then assert:

```ts
expect(contentFieldNames.indexOf('actions')).toBeGreaterThan(descriptionIndex)
expect(contentFieldNames.at(-1)).toBe('footerActions')
expect(alignmentField.options).toEqual(sectionAlignmentOptions)
expect(alignmentField.required).toBe(true)
expect(paddingField.options).toEqual(sectionPaddingOptions)
expect(paddingField.required).toBe(true)
```

Represent Page Header `subtitle`, About Section `body`, and Testimonial Spotlight `section*` fields
as declared compatibility aliases in the test rather than treating nested testimonial fields as the
outer section introduction.

- [ ] **Step 2: Run the schema contract test and verify it reports the known drift**

Run:

```bash
pnpm exec vitest run tests/int/block-section-schema-contract.int.spec.ts tests/int/block-theme-tabs.int.spec.ts tests/int/regular-block-spacing.int.spec.tsx
```

Expected: FAIL for footer ordering, alignment options/requiredness, duplicated padding definitions,
and the two missing standard eyebrows.

- [ ] **Step 3: Replace duplicated standard theme fields with factories**

For each standard config, replace the local `contentAlignment` and section-padding select objects
with:

```ts
createSectionAlignmentField({ defaultValue: 'center' })
createSectionPaddingField()
```

Use Center for About Section, Feature Spotlight, Q&A Accordion, Testimonial Spotlight, Contact 24,
CTA 39, Gallery Coverflow, Feature Matrix, News & Events Highlights, Profile Carousel, Gallery
Showcase, Event Gallery, Image Mosaic, Rating Spotlight, Review Feed, Review Submission, Contact 33,
Team Showcase, Services 21, Video Embed, Media Carousel, Logo Strip, Timeline, Icon Card Showcase,
Icon Grid, Tabs Content, Numbered Steps, Bento Grid, and Testimonial Grid. Use Left for every other
standard block, preserving current defaults. Add Right to every standard section. Remove only
now-unused `SelectField` imports. Page Header may keep its banner-specific factory, but that factory
must expose the same three alignment values and shared padding values.

- [ ] **Step 4: Normalize Content labels and order**

Use:

```ts
createIntroductionActionsField({ maxRows: currentMaximum })
// block-specific fields remain here
createFooterActionsField()
```

Move `footerActions` to the final Content-tab position in the 24 affected standard blocks. Keep
hidden compatibility fields beside the body field they support, before the visible footer action.
Do not move fields across Content and Theme Settings tabs.

- [ ] **Step 5: Add missing standard introduction fields**

Add an optional `eyebrow` text field before `title` in:

- `src/blocks/QaAccordion/config.ts`
- `src/blocks/TeamShowcase/config.ts`

Use the existing description: `Small label above the section title.`

- [ ] **Step 6: Align title validation with runtime requirements**

Set `required: true` on title fields whose current renderer returns `null` without a title:

- `src/blocks/PageHeader/config.ts`
- `src/blocks/Contact24/config.ts`
- `src/blocks/Contact33/config.ts`
- `src/blocks/GalleryShowcase/config.ts`
- `src/blocks/ImageMosaic/config.ts`
- `src/blocks/MediaCarousel/config.ts`
- `src/blocks/NumberedSteps/config.ts`
- `src/blocks/ProfileCarousel/config.ts`
- `src/blocks/RatingSpotlight/config.ts`
- `src/blocks/ReviewFeed/config.ts`
- `src/blocks/Timeline/config.ts`

Do not make title required in blocks whose renderer already supports title-less content.

- [ ] **Step 7: Run schema, theme, and spacing tests**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 8: Commit the authoring normalization**

```bash
git add src/blocks tests/int/block-section-schema-contract.int.spec.ts tests/int/block-theme-tabs.int.spec.ts tests/int/regular-block-spacing.int.spec.tsx
git commit -m "refactor(blocks): align section authoring"
```

---

### Task 3: Preserve renamed-field compatibility and fill missing capabilities

**Files:**

- Modify: `src/blocks/MediaCarousel/config.ts`
- Modify: `src/blocks/MediaCarousel/Component.tsx`
- Modify: `src/blocks/TestimonialSpotlight/config.ts`
- Modify: `src/blocks/TestimonialSpotlight/Component.tsx`
- Modify: `src/blocks/EditorialReasons/config.ts`
- Modify: `src/blocks/LogoStrip/config.ts`
- Create: `src/blocks/shared/legacySectionFields.ts`
- Create: `tests/int/block-section-compatibility.int.spec.tsx`

**Interfaces:**

- Consumes: Task 1 field factories and current generated action shapes.
- Produces: `preferCanonicalActions`, `resolveSectionAlignment`, and backward-compatible Admin fields.

- [ ] **Step 1: Write failing compatibility tests**

```ts
expect(preferCanonicalActions([{ label: 'New' }], [{ label: 'Old' }])).toEqual([
  { label: 'New' },
])
expect(preferCanonicalActions([], [{ label: 'Old' }])).toEqual([{ label: 'Old' }])
expect(resolveSectionAlignment(undefined, 'right', 'center')).toBe('right')
expect(resolveSectionAlignment('left', 'right', 'center')).toBe('left')
```

Render Media Carousel with only legacy `sectionActions` and Testimonial Spotlight with only legacy
`sectionContentAlignment`; assert the action remains present and the saved alignment remains active.

- [ ] **Step 2: Verify the focused test fails**

```bash
pnpm exec vitest run tests/int/block-section-compatibility.int.spec.tsx
```

Expected: FAIL because the compatibility helpers and canonical fields do not exist.

- [ ] **Step 3: Add pure compatibility helpers**

```ts
export const preferCanonicalActions = <T>(
  canonical?: T[] | null,
  legacy?: T[] | null,
): T[] => (canonical?.length ? canonical : legacy) ?? []

export const resolveSectionAlignment = (
  canonical: SectionContentAlignment | null | undefined,
  legacy: SectionContentAlignment | null | undefined,
  fallback: SectionContentAlignment,
) => canonical ?? legacy ?? fallback
```

- [ ] **Step 4: Normalize Media Carousel without deleting `sectionActions`**

Add visible canonical `actions` using `createIntroductionActionsField`. Retain `sectionActions` as a
hidden compatibility array with its current shape. Update the component to accept both and resolve:

```ts
const resolvedIntroductionActions = resolveCmsActions(
  preferCanonicalActions(actions, sectionActions),
)
```

Place the hidden compatibility field immediately after canonical actions and keep `footerActions`
last after `items`.

- [ ] **Step 5: Normalize Testimonial Spotlight alignment safely**

Add canonical `contentAlignment`, keep `sectionContentAlignment` hidden, and resolve canonical then
legacy then Center. Use a field `afterRead` fallback only if a focused Payload field-hook test proves
old Left values appear correctly in Admin without being overwritten by the new default. Otherwise
leave the canonical field optional and use the explicit runtime fallback until a data migration is
approved.

- [ ] **Step 6: Expose intended footer capabilities**

Add `createFooterActionsField()` after `reasons`/`listActions` in Editorial Reasons and after `logos`
in Logo Strip. Keep Editorial Reasons `listActions` distinct because it belongs to the reasons list,
not the outer section footer.

- [ ] **Step 7: Run compatibility and affected renderer tests**

```bash
pnpm exec vitest run tests/int/block-section-compatibility.int.spec.tsx tests/int/carousel-blocks.int.spec.tsx tests/int/section-eyebrow.int.spec.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit compatibility changes**

```bash
git add src/blocks/MediaCarousel src/blocks/TestimonialSpotlight src/blocks/EditorialReasons src/blocks/LogoStrip src/blocks/shared/legacySectionFields.ts tests/int/block-section-compatibility.int.spec.tsx
git commit -m "fix(blocks): preserve section field aliases"
```

---

### Task 4: Standardize section introduction and action alignment at runtime

**Files:**

- Create: `src/blocks/shared/SectionIntro.tsx`
- Create: `src/blocks/shared/SectionShell.tsx`
- Modify: `src/blocks/shared/BlockFooterActions.tsx`
- Modify: `src/blocks/shared/contentStyles.ts`
- Modify: `src/blocks/AboutSection/Component.tsx`
- Modify: `src/blocks/AccreditationCards/Component.tsx`
- Modify: `src/blocks/AwardsList/Component.tsx`
- Modify: `src/blocks/BentoGrid/Component.tsx`
- Modify: `src/blocks/Contact24/Presentation.tsx`
- Modify: `src/blocks/Contact33/Component.tsx`
- Modify: `src/blocks/DownloadList/Component.tsx`
- Modify: `src/blocks/EditorialReasons/Component.tsx`
- Modify: `src/blocks/EventGallery/Presentation.tsx`
- Modify: `src/blocks/FeatureMatrix/Component.tsx`
- Modify: `src/blocks/FeatureSpotlight/Component.tsx`
- Modify: `src/blocks/GalleryCoverflow/Component.tsx`
- Modify: `src/blocks/GalleryShowcase/Component.tsx`
- Modify: `src/blocks/IconGrid/Component.tsx`
- Modify: `src/blocks/ImageMosaic/Presentation.tsx`
- Modify: `src/blocks/LogoStrip/Component.tsx`
- Modify: `src/blocks/MediaCarousel/Component.tsx`
- Modify: `src/blocks/NumberedSteps/Component.tsx`
- Modify: `src/blocks/ProfileCarousel/Component.tsx`
- Modify: `src/blocks/ProgramMatrix/Component.tsx`
- Modify: `src/blocks/QaAccordion/Component.tsx`
- Modify: `src/blocks/RatingSpotlight/Presentation.tsx`
- Modify: `src/blocks/ReviewFeed/Presentation.tsx`
- Modify: `src/blocks/ReviewSubmission/Component.tsx`
- Modify: `src/blocks/Services21/Component.tsx`
- Modify: `src/blocks/StudentExperience/Component.tsx`
- Modify: `src/blocks/TabsContent/Component.tsx`
- Modify: `src/blocks/TeamShowcase/Component.tsx`
- Modify: `src/blocks/TestimonialGrid/Component.tsx`
- Modify: `src/blocks/TestimonialSpotlight/Component.tsx`
- Modify: `src/blocks/Timeline/Component.tsx`
- Modify: `src/blocks/VideoEmbed/Component.tsx`
- Create: `tests/int/block-section-presentation-contract.int.spec.tsx`
- Modify: `tests/int/content-action-presentation.int.spec.tsx`
- Modify: `tests/int/section-eyebrow.int.spec.tsx`

**Interfaces:**

- Consumes: `SectionContentAlignment`, `BlockAppearance`, `RegularBlockSize`, resolved CMS actions,
  and existing typography classes.
- Produces: `SectionIntro`, `SectionShell`, and an explicit-alignment `BlockFooterActions` contract.

- [ ] **Step 1: Write failing presentation tests**

```tsx
const html = renderToStaticMarkup(
  <SectionIntro
    actions={[resolvedAction]}
    alignment="right"
    description="Supporting copy"
    eyebrow="Admissions"
    surface="none"
    title="Apply now"
  />,
)

expect(html).toContain('data-section-intro="true"')
expect(html).toContain('text-right')
expect(html).toContain('justify-end')
expect(html.indexOf('Admissions')).toBeLessThan(html.indexOf('Apply now'))
expect(html.indexOf('Apply now')).toBeLessThan(html.indexOf('Supporting copy'))
```

Add one render assertion for each of Left, Center, and Right plus an empty-introduction assertion.
Add a TypeScript assertion or source contract proving every standard `BlockFooterActions` call passes
an `alignment` prop.

- [ ] **Step 2: Verify presentation tests fail**

```bash
pnpm exec vitest run tests/int/block-section-presentation-contract.int.spec.tsx tests/int/content-action-presentation.int.spec.tsx tests/int/section-eyebrow.int.spec.tsx
```

Expected: FAIL because the shared presentation modules and explicit footer contract do not exist.

- [ ] **Step 3: Implement `SectionIntro`**

```tsx
export function SectionIntro({
  accentTitle,
  actions,
  alignment = 'left',
  description,
  eyebrow,
  headingAs: Heading = 'h2',
  surface = 'none',
  title,
}: SectionIntroProps) {
  if (!accentTitle && !actions.length && !description && !eyebrow && !title) return null

  return (
    <div className={cn(contentIntroClasses, sectionIntroAlignmentClasses[alignment])} data-section-intro="true">
      {eyebrow ? <SectionEyebrow surface={surface}>{eyebrow}</SectionEyebrow> : null}
      {title || accentTitle ? <Heading className={contentSectionHeadingClasses}>{/* title parts */}</Heading> : null}
      {description ? <p className={contentSectionDescriptionClasses}>{description}</p> : null}
      {actions.length ? <ContentActions actions={actions} alignment={alignment} /> : null}
    </div>
  )
}
```

Preserve title/accent ordering and omit empty elements. `headingAs` accepts only `h1`, `h2`, or `h3`.

- [ ] **Step 4: Implement `SectionShell` without a client boundary**

```tsx
export function SectionShell({ appearance, children, className, size = 'default' }: SectionShellProps) {
  const resolved = resolveBlockAppearanceClasses(appearance)
  return (
    <section className={cn(regularBlockMobilePaddingClasses[size], resolved.className, className)}>
      <div className={regularBlockContainerClasses}>{children}</div>
    </section>
  )
}
```

Allow blocks with bespoke full-bleed containers to keep their existing shell.

- [ ] **Step 5: Require explicit footer alignment**

Remove the hidden Center default:

```ts
type BlockFooterActionsProps = {
  actions?: CmsActionValue[] | null
  alignment: SectionContentAlignment
  className?: string
}
```

Update every standard block call site to pass its resolved content alignment. Utility/content-only
exceptions may pass an explicit fixed alignment documented by their profile.

- [ ] **Step 6: Fix introduction action alignment in the 14 affected blocks**

Pass the resolved section alignment in About Section, Awards List, Bento Grid, Contact 24, Contact
33, Download List, Event Gallery, Icon Grid, Logo Strip, Media Carousel, Numbered Steps, Review Feed,
Testimonial Grid, and Timeline:

```tsx
<ContentActions actions={resolvedActions} alignment={resolvedContentAlignment} />
```

Remove local defaults that disagree with the configured field default.

- [ ] **Step 7: Adopt shared introductions where layout-equivalent**

Use `SectionIntro` directly in simple stacked presentations. Complex split/sticky/banner
presentations retain their layout wrapper but reuse `SectionEyebrow`, shared heading/description
classes, and explicit `ContentActions` alignment. Do not flatten Testimonial Spotlight's outer and
inner introductions.

- [ ] **Step 8: Run focused presentation tests**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 9: Commit runtime normalization**

```bash
git add src/blocks src/components tests/int/block-section-presentation-contract.int.spec.tsx tests/int/content-action-presentation.int.spec.tsx tests/int/section-eyebrow.int.spec.tsx
git commit -m "refactor(blocks): align section presentation"
```

---

### Task 5: Give Hero actions the complete shared behavior

**Files:**

- Modify: `src/blocks/shared/contentActionsFields.ts`
- Modify: `src/blocks/HeroBanner/config.ts`
- Modify: `src/blocks/HeroBanner/Component.tsx`
- Modify: `src/blocks/HeroCarousel/config.ts`
- Modify: `src/blocks/HeroCarousel/Component.tsx`
- Modify: `src/blocks/HeroCarousel/HeroCarouselClient.tsx`
- Modify: `tests/int/content-action-presentation.int.spec.tsx`
- Modify: `tests/int/hero-banner-render.int.spec.ts`
- Modify: `tests/int/carousel-blocks.int.spec.tsx`
- Modify: `tests/int/hero-carousel-motion.int.spec.tsx`

**Interfaces:**

- Consumes: existing `buttons` storage paths and `resolveCmsActions`.
- Produces: `defaultMode` support in `createContentActionsField` and full shared Hero action rows.

- [ ] **Step 1: Write failing action-factory and Hero schema tests**

```ts
const heroButtons = createContentActionsField({
  defaultMode: 'button',
  defaultVariant: 'secondary',
  label: 'Buttons',
  name: 'buttons',
})

expect(getNestedField(heroButtons, 'mode')).toMatchObject({ defaultValue: 'button' })
expect(getNestedField(heroButtons, 'file')).toMatchObject({ relationTo: 'media' })
expect(getNestedField(heroButtons, 'fileBehavior')).toBeDefined()
```

Render old Hero button data without `mode` and assert it remains a button. Render a new File Download
action and assert its `download` attribute and indicator are preserved.

- [ ] **Step 2: Run Hero tests and verify failure**

```bash
pnpm exec vitest run tests/int/content-action-presentation.int.spec.tsx tests/int/hero-banner-render.int.spec.ts tests/int/carousel-blocks.int.spec.tsx tests/int/hero-carousel-motion.int.spec.tsx
```

Expected: FAIL because private Hero button schemas lack File and display-mode fields.

- [ ] **Step 3: Add `defaultMode` to the shared field factory**

```ts
type CreateContentActionsFieldOptions = {
  defaultMode?: ContentActionMode
  // existing options remain unchanged
}
```

Thread it into `createActionLayoutFields` and use it as the `mode` select's default. Preserve the
existing Link default for every current caller.

- [ ] **Step 4: Replace both private Hero button schemas**

Keep the stored name `buttons`:

```ts
const buttonsField = createContentActionsField({
  defaultMode: 'button',
  defaultVariant: 'secondary',
  label: 'Buttons',
  maxRows: 2,
  name: 'buttons',
})
```

Remove duplicated Page/Custom URL and variant field builders from both configs.

- [ ] **Step 5: Resolve Hero actions centrally**

Use:

```ts
const resolvedButtons = resolveCmsActions(buttons, 'button')
```

The fallback keeps pre-existing rows without `mode` rendered as buttons. Preserve `variant: 'link'`
as an editorial link, even when `mode` is absent. Forward download, indicator, indicator position,
new-tab, arrow, and variant values into the existing Hero visual renderer.

- [ ] **Step 6: Run Hero tests**

Run the command from Step 2. Expected: PASS, including motion and keyboard tests.

- [ ] **Step 7: Commit Hero parity**

```bash
git add src/blocks/shared/contentActionsFields.ts src/blocks/HeroBanner src/blocks/HeroCarousel tests/int/content-action-presentation.int.spec.tsx tests/int/hero-banner-render.int.spec.ts tests/int/carousel-blocks.int.spec.tsx tests/int/hero-carousel-motion.int.spec.tsx
git commit -m "feat(blocks): unify hero actions"
```

---

### Task 6: Enforce production and live-preview parity

**Files:**

- Modify: `src/blocks/renderPageBlocks.tsx`
- Modify: `src/blocks/renderLivePreviewPageBlocks.tsx`
- Modify: `tests/int/page-blocks.int.spec.ts`
- Modify: `tests/int/live-preview-renderer.int.spec.tsx`
- Modify: `tests/int/live-preview-import-boundary.int.spec.ts`
- Regenerate: `src/payload-types.ts`

**Interfaces:**

- Consumes: normalized block props and compatibility helpers from Tasks 1–5.
- Produces: equal prop forwarding in both renderers and generated canonical/legacy field types.

- [ ] **Step 1: Add failing renderer-parity assertions**

Assert Media Carousel forwards both `actions` and `sectionActions`, Testimonial Spotlight forwards
both alignment values, new eyebrow/footer fields reach their components, and Hero `buttons` carry the
expanded generated action shape in both render paths.

```ts
expect(read('src/blocks/renderPageBlocks.tsx')).toContain('actions')
expect(read('src/blocks/renderLivePreviewPageBlocks.tsx')).toContain('actions')
```

Prefer render assertions over source assertions where the renderer can be safely imported.

- [ ] **Step 2: Run parity tests and verify failure**

```bash
pnpm exec vitest run tests/int/page-blocks.int.spec.ts tests/int/live-preview-renderer.int.spec.tsx tests/int/live-preview-import-boundary.int.spec.ts
```

Expected: FAIL for newly added canonical or compatibility props not yet forwarded.

- [ ] **Step 3: Update both renderer switches together**

Pass the same normalized fields to production and live-preview components. Do not import Payload
server configuration into the live-preview renderer. Preserve block anchor wrapping and hero preload
assignment in production.

- [ ] **Step 4: Regenerate Payload types**

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` contains canonical fields, retained compatibility fields, expanded
Hero action rows, and the new optional footer/eyebrow fields.

- [ ] **Step 5: Run parity and generated-type tests**

```bash
pnpm exec vitest run tests/int/page-blocks.int.spec.ts tests/int/live-preview-renderer.int.spec.tsx tests/int/live-preview-import-boundary.int.spec.ts tests/int/content-action-presentation.int.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit renderer and type parity**

```bash
git add src/blocks/renderPageBlocks.tsx src/blocks/renderLivePreviewPageBlocks.tsx src/payload-types.ts tests/int/page-blocks.int.spec.ts tests/int/live-preview-renderer.int.spec.tsx tests/int/live-preview-import-boundary.int.spec.ts
git commit -m "test(blocks): enforce renderer parity"
```

---

### Task 7: Update architecture documentation and run the complete verification gate

**Files:**

- Modify: `.agents/skills/project-context/references/block-system.md`
- Update if generated facts change: `.agents/skills/project-context/references/project-inventory.json`
- Modify: `docs/superpowers/specs/2026-09-07-block-section-contract-design.md`
- Modify: `docs/superpowers/plans/2026-09-07-block-section-contract.md`

**Interfaces:**

- Consumes: completed implementation and tests.
- Produces: maintained architecture context and a verified handoff.

- [ ] **Step 1: Update the block-system reference**

Document the five block profiles, canonical standard-section anatomy, shared field/presentation
owners, compatibility aliases, action inheritance, alignment scope, and catalog-derived tests.
Remove or revise any sentence that claims a superseded private Hero action or implicit footer
alignment behavior.

- [ ] **Step 2: Run focused block verification**

```bash
pnpm exec vitest run tests/int/block-catalog.int.spec.ts tests/int/block-section-schema-contract.int.spec.ts tests/int/block-section-compatibility.int.spec.tsx tests/int/block-section-presentation-contract.int.spec.tsx tests/int/block-theme-tabs.int.spec.ts tests/int/block-appearance-contract.int.spec.ts tests/int/regular-block-spacing.int.spec.tsx tests/int/content-action-presentation.int.spec.tsx tests/int/section-eyebrow.int.spec.tsx tests/int/page-blocks.int.spec.ts tests/int/live-preview-renderer.int.spec.tsx tests/int/live-preview-import-boundary.int.spec.ts tests/int/hero-banner-render.int.spec.ts tests/int/carousel-blocks.int.spec.tsx tests/int/hero-carousel-motion.int.spec.tsx
```

Expected: all focused files PASS.

- [ ] **Step 3: Run complete static and integration verification**

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm build
```

Expected: every command exits 0. If the repository's documented Node 22 engine is unavailable, rerun
the build under Node `>=22.13.0 <23` rather than weakening the engine contract.

- [ ] **Step 4: Refresh and validate project context**

```bash
pnpm project-context:update
pnpm project-context:check
```

Inspect `project-inventory.json`; retain it only when generated facts changed. Treat a stale external
knowledge-graph commit as a warning unless the structural update command produces an in-repository
graph change.

- [ ] **Step 5: Inspect the final change impact**

```bash
git diff --check
git status --short
git diff --stat
```

Review every changed `src/blocks/**` producer together with both renderers, generated types, focused
tests, and `block-system.md`. Confirm the unrelated `.impeccable/critique` file remains untouched.

- [ ] **Step 6: Commit maintained context**

```bash
git add .agents/skills/project-context/references/block-system.md .agents/skills/project-context/references/project-inventory.json docs/superpowers/specs/2026-09-07-block-section-contract-design.md docs/superpowers/plans/2026-09-07-block-section-contract.md
git commit -m "docs(blocks): record section contracts"
```

Omit `project-inventory.json` from staging when the update is a no-op. Do not stage unrelated files.
