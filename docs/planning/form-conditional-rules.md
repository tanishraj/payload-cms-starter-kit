# Conditional form questions

## Editor workflow

In Forms, open a question’s **Show this question when…** control. Add one or more
rules and choose an earlier question, then choose whether it has an answer, has no
answer, equals a value, or does not equal a value. Every rule must match. Choice
and boolean questions offer their authored values; file questions support only
answered/unanswered checks. Questions without rules are always shown. A question
can separately be marked **Required when shown**.

The editor stores stable Payload row IDs, not labels or machine names. Rules may
only refer to an earlier question, which makes the evaluation order predictable
and prevents dependency cycles. Reordering, deleting or changing the type/options
of a referenced question is validated before the Form can be published.

## Visitor and intake behavior

Generic Form and Contact Cards & Form use the same evaluator. A question is removed
from the rendered layout when its rules stop matching. Its current answer is
cleared, including private-file tokens, and a polite status explains the cleared
response. Re-showing that question starts empty. A stale published form refreshes
against the current schema; compatible answers remain, while answers to questions
that are now hidden are named in the focused recovery explanation.

Client validation treats hidden questions as inactive. The canonical server
validator independently evaluates the published rule set, rejects a nonempty
forged answer to a hidden question, and omits hidden values from normalized answers,
submission history and notification metadata. Hidden private upload tokens are
never claimed by a submission. Active conditional requiredness is enforced by both
the client and server. Conditional rules participate in the published revision,
so a visitor with an older definition must refresh and review before retrying.

Rules do not affect the fixed Review Submission presentation. No nested rule
groups, arbitrary scripting, formulas, conditional layout entries, or editor-defined
JavaScript are supported in this increment.

## Evidence

- `src/lib/formConditions.ts`: shared stable-ID evaluator and fail-closed schema checks.
- `src/components/admin/FormVisibilityRules.tsx`: Payload-native field editor.
- `src/components/revamp/generic-form.tsx`: conditional display, clearing,
  announcements and active-only validation/submission.
- `tests/int/form-conditional-visibility.int.spec.ts` and
  `tests/int/generic-form.int.spec.tsx`: schema, server-intake, revision snapshot,
  hidden-answer and interaction coverage.
- `src/stories/revamp/GenericForm.stories.tsx`: conditional question playground.
- `tests/e2e/generic-form.e2e.spec.ts`: native authoring and public behavior for
  Generic Form and Contact6. Both complete local journeys passed on October 16, 2026
  using Node 22.13.1, pinned Playwright Chromium and isolated MongoDB 8.0.29 (3.3 minutes).


The native fixture authors both Admissions and Library for the source select, checks
that both persist, and matches the conditional required textbox by accessible role
and name. Exact raw-label matching includes the decorative required asterisk and
previously reported the rendered field as missing. The shared renderer's focused
interaction test uses the same accessible-name contract. Quality retains approved
browser reports/results for seven days; see the developer workflow guide.

This is one DF-08 increment. It does not complete the broader forms or website-builder
acceptance checklist by itself.
