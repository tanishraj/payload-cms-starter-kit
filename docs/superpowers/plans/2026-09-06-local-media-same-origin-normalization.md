# Local Media Same-Origin Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render canonical same-origin Payload media URLs through Next.js as allowed local paths while preserving external R2/CDN URLs.

**Architecture:** Keep Payload's canonical `serverURL`, CORS, and CSRF configuration and keep Next.js remote image access restricted to the configured S3 public origin. Normalize only absolute URLs that match the configured application origin and `/api/media/file/` endpoint inside the existing shared media resolver.

**Tech Stack:** TypeScript, Next.js 16, Payload CMS 3, Vitest

## Global Constraints

- Preserve the current Payload `serverURL`, CORS, and CSRF configuration.
- Preserve external HTTP(S) Media URLs so configured R2/CDN delivery remains unchanged.
- Preserve query strings and fragments when a same-origin Payload Media URL becomes root-relative.
- Do not rewrite same-origin URLs outside `/api/media/file/`.
- Do not migrate database records or broaden `images.remotePatterns` to localhost.
- Preserve the unrelated existing `src/app/(payload)/admin/importMap.js` worktree change.

---

### Task 1: Normalize Same-Origin Payload Media URLs

**Files:**
- Modify: `src/lib/media.ts`
- Test: `tests/int/media-url.int.spec.ts`
- Verify: `.agents/skills/project-context/references/project-inventory.json`

**Interfaces:**
- Consumes: `defaultSiteURL: string`, the canonical origin returned by `getSiteURL()`.
- Produces: unchanged `getMediaAbsoluteUrl(media): string | undefined`, with canonical same-origin `/api/media/file/` URLs returned as root-relative paths.
- Preserves: `getMediaImageProps` and `getOpenGraphMediaImage` signatures and all external-media behavior.

- [ ] **Step 1: Add failing same-origin normalization tests**

Add these cases to `tests/int/media-url.int.spec.ts` after the existing root-relative test:

```ts
  it('normalizes an absolute same-origin Payload media URL to a local path', () => {
    expect(
      getMediaAbsoluteUrl(
        mediaWithURL('http://localhost:3000/api/media/file/social-image.png'),
      ),
    ).toBe('/api/media/file/social-image.png')
  })

  it('preserves query and fragment components when normalizing local Payload media', () => {
    expect(
      getMediaAbsoluteUrl(
        mediaWithURL(
          'http://localhost:3000/api/media/file/social-image.png?width=1200#preview',
        ),
      ),
    ).toBe('/api/media/file/social-image.png?width=1200#preview')
  })

  it('does not normalize a same-origin URL outside the Payload media endpoint', () => {
    expect(getMediaAbsoluteUrl(mediaWithURL('http://localhost:3000/static/logo.png'))).toBe(
      'http://localhost:3000/static/logo.png',
    )
  })
```

- [ ] **Step 2: Run the focused test and confirm the regression fails**

Run:

```bash
pnpm exec vitest run tests/int/media-url.int.spec.ts
```

Expected: the first two new cases fail because `getMediaAbsoluteUrl` returns their absolute input; the outside-endpoint and existing cases pass.

- [ ] **Step 3: Implement the shared normalization guard**

Add the helper above `getMediaAbsoluteUrl` in `src/lib/media.ts`:

```ts
const toLocalPayloadMediaPath = (value: string): string | null => {
  try {
    const mediaURL = new URL(value)
    const siteURL = new URL(defaultSiteURL)

    if (mediaURL.origin !== siteURL.origin || !mediaURL.pathname.startsWith('/api/media/file/')) {
      return null
    }

    return `${mediaURL.pathname}${mediaURL.search}${mediaURL.hash}`
  } catch {
    return null
  }
}
```

Replace the absolute HTTP(S) branch with:

```ts
  if (/^https?:\/\//i.test(url)) {
    return toLocalPayloadMediaPath(url) ?? url
  }
```

- [ ] **Step 4: Run focused media and Next image policy tests**

Run:

```bash
pnpm exec vitest run tests/int/media-url.int.spec.ts tests/int/media-public-url.int.spec.ts tests/int/header-navbar-render.int.spec.ts
```

Expected: all focused tests pass, proving that local logo URLs use allowed local paths and R2/CDN URLs stay absolute.

- [ ] **Step 5: Run type and formatting validation**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec prettier --check src/lib/media.ts tests/int/media-url.int.spec.ts
git diff --check
```

Expected: all commands exit successfully with no TypeScript, formatting, or whitespace errors.

- [ ] **Step 6: Refresh and verify project context**

Run:

```bash
pnpm project-context:update
pnpm project-context:check
```

Expected: both commands pass. The inventory remains unchanged because no structural registration changed; if the update produces a factual inventory change, inspect and retain only an accurate generated update.

- [ ] **Step 7: Verify the running local page**

Restart the development server if it did not reload automatically, then run:

```bash
curl --fail --silent --show-error --output /dev/null http://localhost:3000/
```

Expected: exit 0; the homepage renders without `next/image` rejecting the localhost logo URL.

- [ ] **Step 8: Commit only the focused implementation**

```bash
git add src/lib/media.ts tests/int/media-url.int.spec.ts
git commit -m "fix(media): normalize same-origin image URLs"
```

Expected: only the helper and focused regression test are committed. The pre-existing Admin import-map modification and `snmih_prod.dump` remain outside the commit.
