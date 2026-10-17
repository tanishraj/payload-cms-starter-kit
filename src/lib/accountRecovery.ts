import type { RuntimeConfig } from '@/config/runtime'

export const PASSWORD_RECOVERY_UNAVAILABLE =
  'Email password recovery is unavailable. Ask the website Admin who created your account for help.'

/** Recipient overrides are for testing, not delivery to a client account. */
export const canDeliverPasswordRecovery = (email: RuntimeConfig['email']): boolean =>
  email.provider === 'resend' &&
  Boolean(email.apiKey && email.fromAddress) &&
  !email.overrideRecipientAddress
