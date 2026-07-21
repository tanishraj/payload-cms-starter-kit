# Content Highlights Layout Extensions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Content Highlights with responsive Simple Grid and automatically numbered Numbered Steps layouts.

**Architecture:** Keep the existing Payload block, data normalization, introduction, item model, appearance system, and action rendering. Extend the layout union and select options, then make the shared item renderer layout-aware so only the new layouts change presentation.

**Tech Stack:** Payload CMS, React, TypeScript, Tailwind CSS, Vitest, React DOM server rendering.

## Global Constraints

- Preserve the `contentHighlights` block slug and all three existing layout values.
- Support one to six items without a migration or compatibility adapter.
- Generate step numbers from item order as `01`, `02`, and so on.
- Use one column on mobile, two on medium screens, and up to four on large screens for Numbered Steps.
- Use one column on mobile and two from the medium breakpoint for Simple Grid.
- Use semantic theme colors, the project radius, the shared site container, and `py-12 md:py-16` outer spacing.
- Compact, Default, and Comfortable affect internal gaps only.
- Do not stage or commit any changes.

---

## File structure

- Modify `src/blocks/ContentHighlights/config.ts` to expose the two layouts in Payload.
- Modify `src/components/content-highlights.tsx` to extend the layout type and render the new presentations.
- Modify `tests/int/content-highlights.int.spec.tsx` to verify the schema, rendering contracts, links, themes, and regressions.

### Task 1: Extend the Payload and TypeScript layout contracts

**Files:**

- Modify: `tests/int/content-highlights.int.spec.tsx`
- Modify: `src/blocks/ContentHighlights/config.ts`
- Modify: `src/components/content-highlights.tsx`

**Interfaces:**

- Produces: `ContentHighlightsLayout = 'editorialRow' | 'highlightsGrid' | 'numberedSteps' | 'simpleGrid' | 'splitHighlights'`
- Produces: Payload layout values `simpleGrid` and `numberedSteps`.

- [ ] **Step 1: Extend the schema expectation before changing production code**

Update the layout-options expectation in `tests/int/content-highlights.int.spec.tsx`:

```tsx
expect(getField(layout?.fields ?? [], 'layout')?.options?.map(({ value }) => value)).toEqual([
  'editorialRow',
  'highlightsGrid',
  'simpleGrid',
  'numberedSteps',
  'splitHighlights',
])
```

- [ ] **Step 2: Run the schema test and verify it fails**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/content-highlights.int.spec.tsx
```

Expected: FAIL because Payload exposes only the three existing values.

- [ ] **Step 3: Add the two Payload options**

Update the `layout` options in `src/blocks/ContentHighlights/config.ts`:

```ts
options: [
  { label: 'Editorial Row', value: 'editorialRow' },
  { label: 'Highlights Grid', value: 'highlightsGrid' },
  { label: 'Simple Grid', value: 'simpleGrid' },
  { label: 'Numbered Steps', value: 'numberedSteps' },
  { label: 'Split Highlights', value: 'splitHighlights' },
],
```

- [ ] **Step 4: Extend the public layout type**

Replace the layout union in `src/components/content-highlights.tsx` with:

```ts
export type ContentHighlightsLayout =
  | 'editorialRow'
  | 'highlightsGrid'
  | 'numberedSteps'
  | 'simpleGrid'
  | 'splitHighlights'
```

Temporarily map both new values to valid grid classes so TypeScript remains exhaustive:

```ts
const itemGridClasses = {
  editorialRow: 'grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3',
  highlightsGrid: 'grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3',
  numberedSteps: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
  simpleGrid: 'grid gap-x-16 gap-y-10 md:grid-cols-2',
  splitHighlights: 'grid gap-x-8 gap-y-8 md:grid-cols-2',
} as const satisfies Record<ContentHighlightsLayout, string>
```

- [ ] **Step 5: Run the schema test and type checker**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/content-highlights.int.spec.tsx
pnpm exec tsc --noEmit
```

Expected: the Content Highlights tests and type checker pass.

### Task 2: Implement Simple Grid and Numbered Steps rendering

**Files:**

- Modify: `tests/int/content-highlights.int.spec.tsx`
- Modify: `src/components/content-highlights.tsx`

**Interfaces:**

- Consumes: the extended `ContentHighlightsLayout` union from Task 1.
- Produces: layout-aware `ContentHighlightItemComponent` rendering with automatic `01`-style numbers.

- [ ] **Step 1: Add failing responsive rendering tests**

Add a test to `tests/int/content-highlights.int.spec.tsx` that renders both new layouts:

```tsx
it('renders simple and numbered layouts with their responsive contracts', () => {
  const items = Array.from({ length: 6 }, (_, index) => ({
    description: `Description ${index + 1}`,
    metadata: index === 0 ? 'Required' : undefined,
    title: `Item ${index + 1}`,
  }))

  const simpleHtml = renderToStaticMarkup(
    <ContentHighlights items={items} layout="simpleGrid" title="What we look for" />,
  )
  const numberedHtml = renderToStaticMarkup(
    <ContentHighlights items={items} layout="numberedSteps" title="How your application moves" />,
  )

  expect(simpleHtml).toContain('data-content-highlights-layout="simpleGrid"')
  expect(simpleHtml).toContain('grid gap-x-16 gap-y-10 md:grid-cols-2')
  expect(simpleHtml).toContain('data-content-highlight-presentation="simple"')
  expect(simpleHtml).not.toContain('data-slot="separator"')
  expect(simpleHtml).not.toContain('data-content-highlight-step=')

  expect(numberedHtml).toContain('data-content-highlights-layout="numberedSteps"')
  expect(numberedHtml).toContain('grid gap-4 md:grid-cols-2 lg:grid-cols-4')
  expect(numberedHtml).toContain('data-content-highlight-presentation="numbered"')
  expect(numberedHtml).toContain('rounded-md border border-border')
  expect(numberedHtml).toContain('data-content-highlight-step="01"')
  expect(numberedHtml).toContain('data-content-highlight-step="06"')
  expect(numberedHtml).not.toContain('data-slot="separator"')

  for (const html of [simpleHtml, numberedHtml]) {
    expect(html).toContain('py-12 md:py-16')
    expect(html).toContain('max-w-screen-2xl')
  }
})
```

- [ ] **Step 2: Run the test and verify the presentation assertions fail**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/content-highlights.int.spec.tsx
```

Expected: FAIL because the new layouts still use the existing separated item renderer.

- [ ] **Step 3: Make the item renderer layout-aware**

Update `ContentHighlightItemComponent` in `src/components/content-highlights.tsx` to accept `index` and `layout`, preserve current link behavior, and select one of three presentations:

```tsx
function ContentHighlightItemComponent({
  index,
  item,
  layout,
}: {
  index: number
  item: ContentHighlightItem
  layout: ContentHighlightsLayout
}) {
  const isNumbered = layout === 'numberedSteps'
  const isSimple = layout === 'simpleGrid'
  const step = String(index + 1).padStart(2, '0')
  const titleClassName =
    'rounded-sm text-md leading-tight font-semibold text-current underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current sm:text-lg'

  const title = item.href ? (
    <a
      className={cn(titleClassName, 'transition-opacity hover:opacity-70 hover:underline')}
      href={item.href}
      rel={item.openInNewTab ? 'noreferrer' : undefined}
      target={item.openInNewTab ? '_blank' : undefined}
    >
      {item.title}
    </a>
  ) : (
    <p className={titleClassName}>{item.title}</p>
  )

  const content = (
    <div className="flex flex-col gap-2">
      {item.metadata ? (
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-current/65">
          {item.metadata}
        </p>
      ) : null}
      {title}
      {item.description ? (
        <p className="text-sm leading-6 text-current/70">{item.description}</p>
      ) : null}
    </div>
  )

  if (isNumbered) {
    return (
      <article
        className="flex min-w-0 flex-col gap-4 rounded-md border border-border p-6"
        data-content-highlight-item="true"
        data-content-highlight-presentation="numbered"
      >
        <p
          className="text-2xl leading-none font-semibold text-primary"
          data-content-highlight-step={step}
        >
          {step}
        </p>
        {content}
      </article>
    )
  }

  if (isSimple) {
    return (
      <article
        className="flex min-w-0 flex-col"
        data-content-highlight-item="true"
        data-content-highlight-presentation="simple"
      >
        {content}
      </article>
    )
  }

  return (
    <article className="flex min-w-0 flex-col gap-4" data-content-highlight-item="true">
      <Separator />
      {content}
    </article>
  )
}
```

Update the item mapping in `ContentHighlightsItems`:

```tsx
{items.map((item, index) => (
  <ContentHighlightItemComponent
    index={index}
    item={item}
    key={`${item.title}-${index}`}
    layout={layout}
  />
))}
```

- [ ] **Step 4: Run the focused tests and verify they pass**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/content-highlights.int.spec.tsx
```

Expected: all Content Highlights tests pass.

### Task 3: Verify links, appearance, regression safety, and production readiness

**Files:**

- Modify: `tests/int/content-highlights.int.spec.tsx` only if an uncovered regression is found.

**Interfaces:**

- Consumes: all Content Highlights behavior completed by Tasks 1 and 2.
- Produces: verified build-ready implementation with existing layouts unchanged.

- [ ] **Step 1: Exercise item links and section actions in each new layout**

Add this table-driven test to `tests/int/content-highlights.int.spec.tsx`:

```tsx
it.each(['simpleGrid', 'numberedSteps'] satisfies ContentHighlightsLayout[])(
  'preserves normalized actions and item links in %s',
  (layout) => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        actionMode="button"
        actions={[
          {
            label: 'Explore all',
            linkType: 'custom',
            url: '/explore',
            variant: 'outline',
          },
        ]}
        items={[
          {
            description: 'A linked item.',
            linkType: 'custom',
            openInNewTab: true,
            title: 'Programs',
            url: '/programs',
          },
          {
            description: 'No destination is required.',
            linkType: 'none',
            title: 'Static item',
          },
        ]}
        layout={layout}
        title="Useful links"
      />,
    )

    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('href="/explore"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).toContain('Static item')
    expect(html).not.toContain('href=""')
  },
)
```

- [ ] **Step 2: Run Content Highlights and shared spacing tests**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/content-highlights.int.spec.tsx tests/int/regular-block-spacing.int.spec.tsx
```

Expected: all selected tests pass.

- [ ] **Step 3: Format and lint the changed implementation**

Run:

```bash
pnpm exec prettier --write src/blocks/ContentHighlights/config.ts src/components/content-highlights.tsx tests/int/content-highlights.int.spec.tsx
pnpm exec eslint src/blocks/ContentHighlights/config.ts src/components/content-highlights.tsx tests/int/content-highlights.int.spec.tsx
```

Expected: Prettier completes and ESLint exits with no errors.

- [ ] **Step 4: Run type checking and the production build**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Expected: both commands exit successfully.

- [ ] **Step 5: Validate the unstaged diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; all work from this plan remains unstaged.
