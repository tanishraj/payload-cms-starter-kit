# Client account handoff and recovery

Your team creates the website as Admin. Clients normally receive Site Manager
accounts with only the needed feature grants and active root Pages. There are two
roles; creating an account does not send an invitation or automatically publish content.

## When account email is available

Configure the existing Resend provider and verified sender, set the canonical
`NEXT_PUBLIC_SERVER_URL`, and remove recipient overrides before client handoff.
The login screen then offers Payload's native Forgot password flow.

1. Admin creates the account with a unique initial password and intended grants.
   Do not email that password. Do not describe the account as invited or activated.
2. Give the client the correct login URL and account email. The client selects
   Forgot password and opens the link delivered to their own inbox.
3. The client chooses a password, signs in and verifies the assigned work. If 2FA
   is already enabled, an authenticator or unused recovery code is still required.
4. For a missing message, check spam, sender/provider delivery and the account
   email with the creating Admin. A resend does not bypass the native request limit.

Payload owns reset-token creation, default one-hour expiry, resend throttling,
single use and replacement by a newer request. API responses do not expose the
reset token or disclose whether an account exists. A successful password change
revokes older sessions; it does not alter role, feature or section grants.

## When email is disabled or redirected to a test inbox

Login explains that email recovery is unavailable and directs the client to the
website Admin who created the account. Direct visits to `/admin/forgot` return to
login. The reset-request API fails with the same explanation for known and unknown
accounts, before generating a token or calling Payload's console email fallback.
A recipient override also disables this self-service path: it is not delivery to
the client. Existing reset links retain their native validity; password changes
and 2FA enforcement remain available.

For operator-assisted recovery:

1. Verify the person's identity through your organization's established channel.
2. An authenticated Admin opens the exact account in Users and changes its password
   with the native password controls. Do not change grants merely to restore login.
3. Use the approved encrypted credential-sharing process if temporary credentials
   are needed. Never send passwords, reset tokens or recovery codes in ordinary
   email/chat or store them in project documents or logs.
4. Ask the client to sign in and change the temporary password under their own
   account. The application does **not** enforce a first-login password change.
   Verify the change and assigned access together before handoff is complete.

An Admin password change does not remove 2FA. Use existing recovery codes and the
[documented 2FA recovery process](../guides/users.md); do not bypass another user's
factor through Users or direct database edits. Keep a second active Admin.

## Verification and release boundary

Automated tests use isolated local MongoDB and a capture-only email adapter; no
real client mail is sent. They verify native link generation/expiry/single use,
resend, session revocation, grant preservation, unknown-account responses and
Admin/self password changes. Native browser tests cover disabled-email guidance
and direct/API fallback. This proves application behavior, not Resend delivery.

Before production handoff, demonstrate delivery with the deployment's real sender
and canonical URL, including a missing/expired-link recovery. Inspect provider
failures independently; Payload's current native forgot form can show its generic
confirmation after an HTTP error, so that confirmation alone is not delivery
proof. This retained upstream failure-state gap and an observed client task remain
open release evidence. No invitation service, forced password-change flag, new
identity provider, role, secret or data migration is introduced here.
