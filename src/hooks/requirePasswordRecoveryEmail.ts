import { APIError, type CollectionBeforeOperationHook } from 'payload'
import type { RuntimeConfig } from '@/config/runtime'
import { canDeliverPasswordRecovery, PASSWORD_RECOVERY_UNAVAILABLE } from '@/lib/accountRecovery'

/** Fail before user lookup/token creation; never turn a disabled adapter into a logged reset email. */
export const requirePasswordRecoveryEmail =
  (email: RuntimeConfig['email']): CollectionBeforeOperationHook =>
  ({ operation }) => {
    if (operation === 'forgotPassword' && !canDeliverPasswordRecovery(email)) {
      throw new APIError(PASSWORD_RECOVERY_UNAVAILABLE, 503)
    }
  }
