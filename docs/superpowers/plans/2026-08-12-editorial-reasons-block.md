# Editorial Reasons Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable, theme-aware Editorial Reasons block with a sticky editorial introduction and a responsive ruled list of automatically numbered reasons.

**Architecture:** Keep Editorial Reasons independent from Content Highlights. A Payload config owns authoring and validation, a React server component normalizes links and renders the asymmetric layout, and the existing Page, Reusable Section, renderer, thumbnail, and documentation catalogs expose it everywhere normal Page blocks are available.

**Tech Stack:** Payload CMS 3, Next.js 16, React 19 server components, TypeScript, Tailwind CSS 4, Vitest, and the existing Playwright thumbnail generator.

## Global Constraints

- Use label **Editorial Reasons**, slug `editorialReasons`, and interface `EditorialReasonsBlock`.
- Keep the block independent from Content Highlights and preserve every existing block.
- Use standard `Content` and `Theme Settings` tabs.
- Permit one to eight reasons and generate `01`, `02`, and so on from array order.
- Use semantic appearance, eyebrow, action, spacing, foreground, and divider systems only.
- Keep the introduction left-aligned; support Top, Center, and Bottom desktop alignment.
- Default sticky behavior on at large breakpoints and disable stickiness in the stacked mobile layout.
- Link only reason titles, with visible focus and safe external-link attributes.
- Add no reason cards, icons, badges, per-item backgrounds, client state, or animation.
- Register Pages, Reusable Sections, production rendering, live preview, thumbnails, types, and docs.
- Keep all plan and implementation files unstaged and uncommitted until explicitly requested.

## File Map

- Create `src/blocks/EditorialReasons/config.ts` for the Payload schema.
- Create `src/blocks/EditorialReasons/Component.tsx` for normalization and rendering.
- Create `tests/int/editorial-reasons.int.spec.tsx` for focused coverage.
- Modify Page/Reusable Section collections and both page renderers.
- Modify thumbnail definitions/fixtures and generate `public/block-thumbnails/editorial-reasons.jpg`.
- Regenerate `src/payload-types.ts`.
- Modify `tests/int/page-blocks.int.spec.ts` for the new block count.
- Modify `docs/guides/blocks.md` and `docs/architecture/feature-inventory.md`.

---

### Task 1: Define the Payload schema

**Files:**

- Create: `src/blocks/EditorialReasons/config.ts`
- Create: `tests/int/editorial-reasons.int.spec.tsx`

**Interfaces:**

- Consumes: Payload field types and existing block field factories.
- Produces: `EditorialReasonsBlock: Block`.

- [ ] **Step 1: Write the failing schema test**

Create `tests/int/editorial-reasons.int.spec.tsx` with a recursive `findNamedField(fields, name)` helper matching `tests/int/program-matrix.int.spec.tsx`, then assert:

```tsx
describe('EditorialReasonsBlock schema', () => {
  it('defines its identity, content, and row limits', () => {
    expect(EditorialReasonsBlock).toMatchObject({
      slug: 'editorialReasons',
      interfaceName: 'EditorialReasonsBlock',
      labels: { singular: 'Editorial Reasons', plural: 'Editorial Reasons' },
    })
    expect(EditorialReasonsBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Editorial Reasons block preview',
      url: '/block-thumbnails/editorial-reasons.jpg',
    })
    const tabs = EditorialReasonsBlock.fields.find((field) => field.type === 'tabs')
    expect(tabs && tabs.type === 'tabs' ? tabs.tabs.map((tab) => tab.label) : []).toEqual([
      'Content',
      'Theme Settings',
    ])
    expect(findNamedField(EditorialReasonsBlock.fields, 'title')).toMatchObject({
      type: 'text',
      required: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'accentTitle')).toMatchObject({
      type: 'text',
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'actions')).toMatchObject({
      type: 'array',
      maxRows: 2,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'reasons')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 8,
    })
  })

  it('defines reason links and approved theme controls', () => {
    const reasons = findNamedField(EditorialReasonsBlock.fields, 'reasons') as ArrayField
    expect(findNamedField(reasons.fields, 'linkType')).toMatchObject({
      type: 'radio',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
    })
    expect(findNamedField(reasons.fields, 'page')).toMatchObject({
      type: 'relationship',
      relationTo: 'pages',
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'appearance')).toBeDefined()
    expect(findNamedField(EditorialReasonsBlock.fields, 'actionMode')).toMatchObject({
      type: 'select',
      defaultValue: 'link',
      required: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'introVerticalAlignment')).toMatchObject({
      type: 'select',
      defaultValue: 'top',
      required: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'stickyIntro')).toMatchObject({
      type: 'checkbox',
      defaultValue: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'size')).toMatchObject({
      type: 'select',
      defaultValue: 'default',
      required: true,
    })
  })
})
```

- [ ] **Step 2: Verify the test fails because the block is missing**

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx`.

Expected: FAIL resolving `@/blocks/EditorialReasons/config` and `Component`.

- [ ] **Step 3: Implement the schema**

Create `src/blocks/EditorialReasons/config.ts` with:

```ts
import type { ArrayField, Block, CheckboxField, RadioField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

type ReasonSiblingData = { linkType?: 'custom' | 'none' | 'page' | null }
const isPageLink = (_data: unknown, row: ReasonSiblingData) => row?.linkType === 'page'
const isCustomLink = (_data: unknown, row: ReasonSiblingData) => row?.linkType === 'custom'
const hasLink = (_data: unknown, row: ReasonSiblingData) =>
  row?.linkType === 'page' || row?.linkType === 'custom'

const reasonsField: ArrayField = {
  name: 'reasons',
  label: 'Reasons',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 8,
  admin: {
    initCollapsed: true,
    description: 'Rows are numbered automatically from their current order.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'linkType',
      label: 'Link',
      type: 'radio',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
      admin: { layout: 'horizontal' },
    } satisfies RadioField,
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: isPageLink },
    },
    {
      name: 'url',
      label: 'Custom URL',
      type: 'text',
      admin: { condition: isCustomLink },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: hasLink },
    } satisfies CheckboxField,
  ],
}

export const EditorialReasonsBlock: Block = {
  admin: getBlockThumbnailAdmin('editorialReasons'),
  slug: 'editorialReasons',
  interfaceName: 'EditorialReasonsBlock',
  labels: { singular: 'Editorial Reasons', plural: 'Editorial Reasons' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text' },
            { name: 'title', type: 'text', required: true },
            {
              name: 'accentTitle',
              label: 'Emphasized Title Line',
              type: 'text',
              admin: { description: 'Optional second line with restrained display emphasis.' },
            },
            { name: 'description', type: 'textarea' },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            reasonsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            createContentActionModeField(),
            {
              name: 'introVerticalAlignment',
              label: 'Introduction Vertical Alignment',
              type: 'select',
              defaultValue: 'top',
              required: true,
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Center', value: 'center' },
                { label: 'Bottom', value: 'bottom' },
              ],
            } satisfies SelectField,
            {
              name: 'stickyIntro',
              label: 'Keep Introduction Visible While Scrolling',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Applies only to the large-screen two-column layout.' },
            } satisfies CheckboxField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              required: true,
              options: [
                { label: 'None', value: 'none' },
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
```

- [ ] **Step 4: Add a temporary component export and pass schema tests**

Create `src/blocks/EditorialReasons/Component.tsx`:

```tsx
export function EditorialReasonsBlockComponent() {
  return null
}
```

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'schema'`.

Expected: both schema tests PASS.

---

### Task 2: Build the theme-aware server renderer

**Files:**

- Modify: `src/blocks/EditorialReasons/Component.tsx`
- Modify: `tests/int/editorial-reasons.int.spec.tsx`

**Interfaces:**

- Consumes: block appearance/spacing, shared actions, shared eyebrow, and CMS link resolution.
- Produces: `EditorialReasonsBlockComponent` with stable data hooks.

- [ ] **Step 1: Add failing renderer coverage**

Add `baseReasons` containing the four approved prototype reasons, then assert:

```tsx
describe('EditorialReasonsBlockComponent', () => {
  it('renders the responsive asymmetric layout and ruled numbered list', () => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        accentTitle="Driven by purpose."
        description="A learning environment shaped around development and service."
        eyebrow="Why SNMIH"
        reasons={baseReasons}
        title="Built for learning."
      />,
    )
    expect(html).toContain('data-editorial-reasons="true"')
    expect(html).toContain('lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]')
    expect(html).toContain('data-editorial-reasons-intro="true"')
    expect(html).toContain('data-editorial-reasons-list="true"')
    expect(html).toContain('border-t border-current/15')
    expect(html.match(/data-editorial-reason="true"/g)).toHaveLength(4)
    expect(html).toContain('>01<')
    expect(html).toContain('>04<')
    expect(html).toContain('font-[family-name:var(--font-display)] italic')
  })

  it.each([
    ['top', 'lg:self-start'],
    ['center', 'lg:self-center'],
    ['bottom', 'lg:self-end'],
  ] as const)('maps %s intro alignment', (introVerticalAlignment, expectedClass) => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        introVerticalAlignment={introVerticalAlignment}
        reasons={baseReasons}
        title="Why choose us"
      />,
    )
    expect(html).toContain(expectedClass)
    expect(html).toContain(`data-editorial-reasons-intro-alignment="${introVerticalAlignment}"`)
  })

  it('enables stickiness only from the large breakpoint', () => {
    const sticky = renderToStaticMarkup(
      <EditorialReasonsBlockComponent reasons={baseReasons} stickyIntro title="Why choose us" />,
    )
    const staticMarkup = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        reasons={baseReasons}
        stickyIntro={false}
        title="Why choose us"
      />,
    )
    expect(sticky).toContain('lg:sticky lg:top-28')
    expect(sticky).toContain('data-editorial-reasons-sticky="true"')
    expect(staticMarkup).not.toContain('lg:sticky')
  })

  it('filters invalid rows and resolves custom and hierarchical Page links', () => {
    const parent = { id: 'academics', slug: 'academics' } as unknown as Page
    const page = { id: 'why-us', parent, slug: 'why-us' } as unknown as Page
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        reasons={[
          { linkType: 'page', page, title: 'Clinical Exposure' },
          {
            linkType: 'custom',
            openInNewTab: true,
            title: 'Experienced Faculty',
            url: 'https://example.com/faculty',
          },
          { title: '   ' },
        ]}
        title="Why choose us"
      />,
    )
    expect(html.match(/data-editorial-reason="true"/g)).toHaveLength(2)
    expect(html).toContain('href="/academics/why-us"')
    expect(html).toContain('href="https://example.com/faculty"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
  })

  it('uses semantic appearance, spacing, and shared actions', () => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        actionMode="button"
        actions={[
          {
            label: 'Explore admissions',
            linkType: 'custom',
            showArrow: true,
            url: '/admissions',
            variant: 'default',
          },
        ]}
        appearance={{ background: 'primary', border: 'topAndBottom' }}
        eyebrow="Why us"
        reasons={baseReasons}
        size="comfortable"
        title="Built for learning"
      />,
    )
    expect(html).toContain('bg-primary text-primary-foreground border-y border-border')
    expect(html).toContain('py-20 md:py-28')
    expect(html).toContain('data-section-eyebrow-surface="primary"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-arrow="true"')
  })

  it('returns no markup without a title or usable reason', () => {
    expect(renderToStaticMarkup(<EditorialReasonsBlockComponent reasons={baseReasons} />)).toBe('')
    expect(
      renderToStaticMarkup(
        <EditorialReasonsBlockComponent reasons={[{ title: '   ' }]} title="Why choose us" />,
      ),
    ).toBe('')
  })
})
```

- [ ] **Step 2: Verify renderer tests fail against the stub**

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'Component'`.

Expected: FAIL because the component emits no markup.

- [ ] **Step 3: Implement renderer normalization and structure**

Replace the stub with a server component that:

```tsx
type EditorialReasonValue = CmsLinkValue & {
  description?: string | null
  id?: string | null
  linkType?: 'custom' | 'none' | 'page' | null
  title?: string | null
}

const introAlignmentClasses = {
  bottom: 'lg:self-end',
  center: 'lg:self-center',
  top: 'lg:self-start',
} as const
```

Normalize each non-empty title with `resolveCmsLink()`, using `null` when `linkType` is `none`.
Return `null` without a trimmed section title or normalized reasons. Resolve appearance with
`resolveBlockAppearanceClasses()`, actions with `resolveCmsActions()`, and surface with
`appearance?.background ?? 'none'`.

Render the exact outer contract:

```tsx
<section
  className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClasses.className)}
  data-editorial-reasons="true"
>
  <div
    className={cn(
      regularBlockContainerClasses,
      'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16',
    )}
  >
    <div className={introAlignmentClasses[resolvedAlignment]}>
      <div
        className={cn(
          'flex max-w-3xl flex-col items-start gap-4',
          stickyIntro && 'lg:sticky lg:top-28',
        )}
        data-editorial-reasons-intro="true"
        data-editorial-reasons-intro-alignment={resolvedAlignment}
        data-editorial-reasons-sticky={String(stickyIntro ?? true)}
      >
        <SectionEyebrow surface={sectionBackground}>{resolvedEyebrow}</SectionEyebrow>
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
          <span className="block">{resolvedTitle}</span>
          {resolvedAccentTitle ? <span className="block italic">{resolvedAccentTitle}</span> : null}
        </h2>
        {resolvedDescription ? (
          <p className="text-base leading-7 text-balance text-current/70">{resolvedDescription}</p>
        ) : null}
        {resolvedActions.length ? (
          <ContentActions
            actions={resolvedActions}
            data-editorial-reasons-actions="true"
            mode={resolvedActionMode}
          />
        ) : null}
      </div>
    </div>
    <div className="border-t border-border" data-editorial-reasons-list="true">
      {resolvedReasons.map((reason, index) => (
        <article
          className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-b border-border py-7 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5 sm:py-8"
          data-editorial-reason="true"
          key={reason.id}
        >
          <span
            aria-hidden="true"
            className="pt-1 font-mono text-xs font-medium tabular-nums tracking-[0.14em] text-current/65"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">{/* linked or plain h3, then optional description */}</div>
        </article>
      ))}
    </div>
  </div>
</section>
```

For a linked title, use an `<a>` with `hover:underline`, `focus-visible:underline`, a visible outline,
`target="_blank"` and `rel="noreferrer"` only when configured. Otherwise use an `h3`. Both use
`font-sans text-md leading-tight font-semibold text-current sm:text-lg`, matching Content
Highlights. Description uses `mt-2 text-sm leading-6 text-current/70`.

- [ ] **Step 4: Run all focused schema and renderer tests**

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx`.

Expected: all current tests PASS.

---

### Task 3: Register Pages and both renderers

**Files:**

- Modify: `src/collections/Pages.ts`
- Modify: `src/collections/ReusableSections.ts`
- Modify: `src/blocks/renderPageBlocks.tsx`
- Modify: `src/blocks/renderLivePreviewPageBlocks.tsx`
- Modify: `tests/int/editorial-reasons.int.spec.tsx`
- Modify: `tests/int/page-blocks.int.spec.ts`

**Interfaces:**

- Consumes: Task 1 schema and Task 2 renderer.
- Produces: authoring and render parity.

- [ ] **Step 1: Add failing registration assertions**

Read the four source files in the focused test and assert they contain `EditorialReasonsBlock`,
`EditorialReasonsBlockComponent`, and `case 'editorialReasons':`. Change the Page block expectation
in `tests/int/page-blocks.int.spec.ts` from 40 to 41 and assert the slug is present.

- [ ] **Step 2: Verify registration tests fail**

Run:

```bash
pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'registration'
pnpm exec vitest run tests/int/page-blocks.int.spec.ts -t 'registers a general layout blocks field on Pages'
```

Expected: FAIL because the new block is absent and the catalog count remains 40.

- [ ] **Step 3: Register schema and rendering**

Import `EditorialReasonsBlock` in both collections and place it immediately after
`ContentHighlightsBlock` in both arrays. Import `EditorialReasonsBlockComponent` in both renderers.
Add these adjacent cases:

```tsx
case 'editorialReasons':
  return wrap(<EditorialReasonsBlockComponent {...block} />)
```

```tsx
case 'editorialReasons':
  return <EditorialReasonsBlockComponent key={key} {...block} />
```

- [ ] **Step 4: Run registration and Reusable Section parity tests**

Run:

```bash
pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'registration'
pnpm exec vitest run tests/int/page-blocks.int.spec.ts -t 'registers a general layout blocks field on Pages'
pnpm exec vitest run tests/int/block-thumbnails.int.spec.ts -t 'offers every non-recursive page block in Reusable Sections'
```

Expected: registration tests PASS; thumbnail metadata parity may remain red until Task 4.

---

### Task 4: Add generated types and thumbnail catalogs

**Files:**

- Modify: `src/block-thumbnails/definitions.ts`
- Modify: `src/block-thumbnails/fixtures.tsx`
- Create: `public/block-thumbnails/editorial-reasons.jpg`
- Generate: `src/payload-types.ts`
- Modify: `tests/int/editorial-reasons.int.spec.tsx`

**Interfaces:**

- Consumes: registered block and renderer.
- Produces: picker preview and generated type support.

- [ ] **Step 1: Add failing type/thumbnail assertions**

Assert generated types contain `export interface EditorialReasonsBlock`,
`blockType: 'editorialReasons'`, and the alignment union. Assert definitions contain
`editorial-reasons.jpg`/`editorialReasons` and fixtures contain `editorialReasons:` plus the component.

- [ ] **Step 2: Verify catalog tests fail**

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'catalogs'`.

Expected: FAIL until types and thumbnail files are updated.

- [ ] **Step 3: Add thumbnail definition and fixture**

Add after Content Highlights:

```ts
defineThumbnail({
  alt: 'Editorial Reasons block preview',
  filename: 'editorial-reasons.jpg',
  label: 'Editorial Reasons',
  slug: 'editorialReasons',
  stageAlignment: 'top',
}),
```

Import the component in fixtures and add:

```tsx
editorialReasons: (
  <EditorialReasonsBlockComponent
    accentTitle="Driven by purpose."
    appearance={{ background: 'muted', border: 'topAndBottom' }}
    description="A learning environment shaped around academic development, practical experience, and service."
    eyebrow="Why choose us"
    reasons={[
      { title: 'Practical exposure', description: 'Learning connected with real-world practice.' },
      { title: 'Experienced faculty', description: 'Guidance from educators and practitioners.' },
      { title: 'Purpose-built infrastructure', description: 'Modern spaces for focused learning.' },
      { title: 'Community impact', description: 'Education that strengthens its community.' },
    ]}
    size="compact"
    title="Built for learning."
  />
),
```

- [ ] **Step 4: Generate types and the dedicated thumbnail**

Run:

```bash
pnpm run generate:types
BLOCK_THUMBNAIL_SLUG=editorialReasons pnpm run generate:block-thumbnails
```

Expected: generated type interfaces and `public/block-thumbnails/editorial-reasons.jpg`. If browser
launch is sandbox-blocked, rerun the same thumbnail command with browser permission; do not create a
manual substitute.

- [ ] **Step 5: Run all thumbnail and type catalog tests**

Run:

```bash
pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'catalogs'
pnpm exec vitest run tests/int/block-thumbnails.int.spec.ts
pnpm exec vitest run tests/int/block-thumbnail-fixtures.int.spec.ts
```

Expected: all PASS.

---

### Task 5: Update documentation catalogs

**Files:**

- Modify: `docs/guides/blocks.md`
- Modify: `docs/architecture/feature-inventory.md`
- Modify: `tests/int/editorial-reasons.int.spec.tsx`

**Interfaces:**

- Consumes: complete registered block.
- Produces: accurate operator and architecture documentation.

- [ ] **Step 1: Add failing documentation assertions**

Assert feature inventory says `Normal Pages register 41 choices`, both docs mention Editorial
Reasons, and the guide includes `sticky introduction` and `automatically numbered ruled list`.

- [ ] **Step 2: Verify documentation test fails**

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'documentation'`.

Expected: FAIL while docs still report 40 choices.

- [ ] **Step 3: Update both catalogs**

Insert this row after Content Highlights:

```md
| Editorial Reasons | Reasons, principles, or differentiators | Asymmetric split with optional sticky introduction and an automatically numbered ruled list |
```

Change the feature inventory count to 41 and insert Editorial Reasons after Content Highlights in
the exhaustive normal Page list. Do not add it to Reusable Section exclusions.

- [ ] **Step 4: Run documentation test**

Run `pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx -t 'documentation'`.

Expected: PASS.

---

### Task 6: Verify and visually inspect

**Files:**

- Verify every file in the File Map.
- Do not stage or commit.

**Interfaces:**

- Consumes: complete implementation.
- Produces: build-ready unstaged changes.

- [ ] **Step 1: Format only touched files**

Run Prettier with `--write` over the two new block files, two collection files, two renderer files,
two thumbnail catalog files, two test files, two documentation catalogs, the spec, and this plan.

Expected: no unrelated file changes.

- [ ] **Step 2: Run focused tests**

```bash
pnpm exec vitest run tests/int/editorial-reasons.int.spec.tsx
pnpm exec vitest run tests/int/page-blocks.int.spec.ts -t 'registers a general layout blocks field on Pages'
pnpm exec vitest run tests/int/block-thumbnails.int.spec.ts
pnpm exec vitest run tests/int/block-thumbnail-fixtures.int.spec.ts
```

Expected: all PASS.

- [ ] **Step 3: Run type, lint, and diff verification**

```bash
pnpm run generate:types
pnpm exec tsc --noEmit
pnpm exec eslint src/blocks/EditorialReasons/config.ts src/blocks/EditorialReasons/Component.tsx tests/int/editorial-reasons.int.spec.tsx tests/int/page-blocks.int.spec.ts
git diff --check
```

Expected: all commands exit successfully.

- [ ] **Step 4: Inspect desktop/mobile and light/dark in one bounded pass**

Open `/block-thumbnail-previews/editorialReasons` at 1440 × 1000 and 390 × 844. Verify asymmetric
desktop columns, safe sticky behavior, stacked mobile layout, aligned two-digit numbers, subtle
rules, no overflow, semantic light/dark contrast, and visible link/action focus. Fix all material
defects in one batch and confirm once at the same sizes.

- [ ] **Step 5: Run Impeccable detection once**

```bash
node .agents/skills/impeccable/scripts/detect.mjs --json src/blocks/EditorialReasons/Component.tsx src/blocks/EditorialReasons/config.ts
```

Expected: no unresolved mechanical findings. Fix findings in one batch and rerun only affected
tests/type/lint checks; do not run the detector twice.

- [ ] **Step 6: Confirm everything remains unstaged**

```bash
git status --short
git diff --stat
git diff --check
```

Expected: the spec, plan, implementation, registration, generated type, test, thumbnail, and docs
are working-tree changes only. Nothing is staged and no commit exists.
