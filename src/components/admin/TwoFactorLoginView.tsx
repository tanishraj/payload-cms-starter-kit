import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import { getSafeRedirect } from 'payload/shared'
import { Logo } from '@payloadcms/next/rsc'

import { runtimeConfig } from '@/config/runtime.server'
import { canDeliverPasswordRecovery } from '@/lib/accountRecovery'

import { TwoFactorAuthForm } from './TwoFactorAuthForm'

export function TwoFactorLoginView({ initPageResult, searchParams, params }: AdminViewServerProps) {
  const redirectTo = getSafeRedirect({
    fallbackTo: '/admin',
    redirectTo: searchParams?.redirect ?? '/admin',
  })
  if (initPageResult.req.user) redirect(redirectTo)
  const recoveryAvailable = canDeliverPasswordRecovery(runtimeConfig.email)
  if (!recoveryAvailable && params?.segments?.[0] === 'forgot') redirect('/admin/login')
  const { locale, permissions, req } = initPageResult
  return (
    <>
      <div className="login__brand">
        <Logo
          i18n={req.i18n}
          locale={locale}
          params={params}
          payload={req.payload}
          permissions={permissions}
          searchParams={searchParams}
          user={req.user ?? undefined}
        />
      </div>
      <TwoFactorAuthForm redirectTo={redirectTo} recoveryAvailable={recoveryAvailable} />
    </>
  )
}
