# Native password-reset request feedback

The client handoff must distinguish requesting a reset from receiving email.
Payload's native confirmation already explains that instructions arrive only if
the address belongs to an account. A successful HTTP acknowledgement is not proof
of provider delivery or an account's existence.

Payload Next 3.90.2's custom forgot-form response handler interpreted error JSON
as success and bypassed the Form processing reset. This could show Email Sent,
start a resend cooldown, or leave Submit disabled after a failure.

## Supported behavior

- A rejected request uses native Form error handling, preserves the email and
  offers the existing Submit action again. It does not create an Email Sent state
  or store a successful-request cooldown.
- A non-JSON gateway error uses native generic status feedback, without inserting
  the HTML body into the page. An unreadable success response cannot confirm a
  request: the success callback requires the native JSON message acknowledgement.
- A successful acknowledgement retains native privacy-safe confirmation and
  resend timing. A failed resend shows an error without renewing the prior
  successful request's cooldown. The heading may still describe that earlier
  acknowledged request; the failed resend has no new success transition.

The native page, fields, styles, validation and translations are retained. A pnpm
patch delegates response/error/processing handling to the existing native Form
and moves only the page's confirmation/storage/cooldown work to `onSuccess`.
No collection, role, token, email provider, environment variable or migration is added.

## Verification and maintenance

`pnpm test:e2e:password-recovery` enables the native email form with reserved test
values, inherits the guarded local test database and fulfills every reset POST in
the browser. It tests the installed patched package, not a reimplemented form.
It covers rejected JSON and successful retry, non-JSON 502/200, and failed resend.
The clock advances only in the resend test; production limits are unchanged.
These cases verify UI handling and send no email. Actual sender delivery and an
observed client task remain production handoff checks.

The patch is registered in `pnpm-workspace.yaml` and hashed in `pnpm-lock.yaml`.
Use frozen installation; never edit installed node_modules as deployment setup.
On Payload upgrades, review the upstream implementation and remove the patch only
when the same tests pass unpatched. See [dependency policy](dependency-management.md).
The separate disabled-email recovery increment in
[PR #44](https://github.com/tanishraj/payload-cms-starter-kit/pull/44) complements
this fix; merge/deployment status remains owned by each PR.
