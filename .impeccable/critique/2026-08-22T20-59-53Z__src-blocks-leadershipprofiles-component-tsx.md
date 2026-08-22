---
target: Leadership Profiles block component
total_score: 12
max_score: 16
na_heuristics: 1,3,5,7,9,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-22T20-59-53Z
slug: src-blocks-leadershipprofiles-component-tsx
---
Method: dual-agent (A: /root/leadership_design_review · B: /root/leadership_detector_review)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | n/a | Static directory with no changing visitor state. |
| 2 | Match System / Real World | 3/4 | Institutional ordering is natural, but qualification and expertise are visually conflated. |
| 3 | User Control and Freedom | n/a | Cards are intentionally non-interactive. |
| 4 | Consistency and Standards | 3/4 | Shared section/card patterns are strong; designation color is derived from link styling rather than the eyebrow accent system. |
| 5 | Error Prevention | n/a | No visitor input or destructive operation. |
| 6 | Recognition Rather Than Recall | 3/4 | Information is visible, but visitors must infer which metadata is a credential and which is expertise. |
| 7 | Flexibility and Efficiency | n/a | No visitor workflow to accelerate. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Restrained composition, but the floating badge and flattened metadata weaken hierarchy. |
| 9 | Error Recovery | n/a | No interactive error state. |
| 10 | Help and Documentation | n/a | The static directory should remain self-explanatory. |
| **Total** |  | **12/16** | **Good foundation; focused hierarchy and accessibility improvements remain.** |

## Design Specificity Verdict

The block is moderately authored for SNMIH: Playfair names, Inter supporting copy, institutional navy/green semantics, bounded academic credentials, and static non-clickable cards convey formality and trust. However, its basic portrait-card/pill/metadata composition remains category-interchangeable with a university, law firm, or corporate team directory.

The more specific direction is an academic dossier rather than a generic people card: portrait and institutional role marker, then name, designation, qualification, and expertise as four intentionally distinct information levels.

The deterministic detector returned a clean `[]` result with zero findings in `src/blocks/LeadershipProfiles/Component.tsx`. That confirms the file avoids the detector's known UI anti-patterns; it does not invalidate the manual hierarchy findings, which sit outside deterministic rules. No detector false positives were present.

No reliable browser overlay is available. A concrete preview route exists, but no local route responded and the in-app browser reported no available browser backend. The original 1600×900 generated thumbnail and targeted source/token inspection were used as fallback visual evidence.

## Overall Impression

The block feels calm, formal, and credible. The display-font name is a strong visual peak, and the cards correctly avoid hover or click cues. The single biggest opportunity is to make each card read like a concise academic dossier instead of ending in one flat metadata sentence.

## What's Working

1. **Strong face-to-identity sequence.** The 4:3 portrait, display-font name, and restrained supporting copy establish identity quickly.
2. **System alignment.** Shared section headers, semantic surfaces, spacing, responsive columns, and theme tokens keep the block connected to the rest of the site.
3. **Defensive content behavior.** Invalid profiles are omitted, expertise is bounded, long copy wraps, image crops are configurable, alt fallbacks exist, and static cards do not create fake interaction.

## Priority Issues

### [P1] Title-free sections can break the heading outline

**Why it matters:** When section title and accent title are absent, profile names remain `h3` elements without a local `h2`. Screen-reader heading navigation receives a visually plausible but semantically broken hierarchy.

**Fix:** Render profile names as `h2` when no section heading exists and as `h3` when the authored section heading renders. Preserve the approved no-fallback-title behavior.

**Suggested command:** `$impeccable audit`

### [P1] Designation color is not actually tied to the SNMIH eyebrow accent

**Why it matters:** The designation currently strips hover classes from `surface.link`. On the SNMIH default card this produces navy, not the green eyebrow accent; some explicit surfaces make it nearly the same color as the name. The hierarchy therefore changes by theme and card background.

**Fix:** Give designation a dedicated surface-aware accent resolver. Use a darker accessible green on white/light cards, soft green on navy/dark cards, and an appropriate foreground on light-inverted Primary cards. Do not derive static text from link classes. The documented SNMIH green `#2f8f45` is approximately 4.09:1 on white, below WCAG AA for 14px text, so the light-surface value must be darkened.

**Suggested command:** `$impeccable colorize`

### [P2] Qualification and expertise are flattened into one tier

**Why it matters:** `MD (Medicine) · Academic administration · Clinical education` makes a credential and subject expertise look equivalent. Visitors must decode structure the CMS already knows.

**Fix:** Render qualification independently at `text-sm` with normal secondary text. Render expertise beneath it at `text-xs` with a quieter but AA-safe semantic secondary color. Keep compact trailing dot separators; do not introduce chips.

**Suggested command:** `$impeccable typeset`

### [P2] The floating role badge competes with portraits and long labels

**Why it matters:** The top-left pill can cover a face or consume substantial image width, especially at four columns. The schema does not constrain label length, and the shared Badge is single-line.

**Fix:** Prefer moving the role label into the content area above the name as a small academic nameplate. If the overlay remains, cap its width, handle overflow safely, reduce the shadow, and use a quieter squared utility treatment.

**Suggested command:** `$impeccable adapt`

### [P2] Independent card surfaces can create accidental hierarchy

**Why it matters:** A checkerboard of Primary, Secondary, Muted, and Accent cards can imply one leader outranks another without an editorial reason and makes scanning less coherent.

**Fix:** Document one surface per directory as the default rule, with at most one intentional highlighted role. A future block-wide card surface plus optional per-card override would reduce accidental meaning.

**Suggested command:** `$impeccable clarify`

## Recommended Card Composition

```text
┌──────────────────────────────────┐
│ portrait                          │
│ institutional role nameplate     │
├──────────────────────────────────┤
│ Dr. Ananya Sharma                │  Playfair, primary
│ Principal & Professor of Medicine│  Inter 14px, accessible green
│                                  │
│ MD (Medicine)                    │  Inter 14px, secondary
│ Academic administration ·        │  Inter 12px, softer secondary
│ Clinical education              │
└──────────────────────────────────┘
```

Keep the existing 16px separation between the identity group and supporting details. Use 6–8px between qualification and expertise so they remain related without being conflated.

## Persona Red Flags

**Jordan — First-time visitor:** The difference between the image badge and designation is not self-evident. Qualification and expertise appear as peer facts, so visitors must decode which text is a degree.

**Sam — Accessibility-dependent visitor:** Title-free blocks expose `h3` names without a local `h2`; the current combined list does not identify qualification versus expertise; blindly reusing the lighter green for 14px designation text would fail AA on white.

**Casey — Distracted mobile visitor:** The one-column flow is predictable, but large 4:3 images slow scanning across a long directory, and long overlay labels can occupy too much of a portrait.

**Riley — Edge-case tester:** Long text generally wraps safely, but long single-line leadership labels are vulnerable. Twenty-four profiles with independently mixed surfaces can become visually chaotic.

## Minor Observations

- Keep the display-font name and sans-serif designation; applying full mono-uppercase eyebrow typography to long designations would become noisy.
- Keep expertise as text, not badges or chips. The card already has one classification marker.
- The badge shadow feels more promotional than academic; a thin border or content-area nameplate would feel more formal.
- `p-6` is appropriately denser than programme cards but should be verified with long metadata at two-column widths.
- The trailing-separator implementation is good because dots stay attached to the preceding expertise item when wrapping.
- The thumbnail confirms composition but not SNMIH theme behavior; it was rendered with green designation styling that the production SNMIH token path does not guarantee.

## Questions to Consider

1. Are Leadership Label and Designation genuinely different institutional concepts, or can the floating badge be removed?
2. Should card color encode a real hierarchy, such as one highlighted Principal, or should every leader use a single surface?
3. Is expertise essential for the first scan, or should it remain visually tertiary beneath qualification?
4. Should title-free sections promote profile names to `h2` for accessible heading navigation?
