'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CONSENT_COOKIE = 'analytics_consent'

function hasConsentDecision(): boolean {
  if (typeof document === 'undefined') return true
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${CONSENT_COOKIE}=`))
}

export function CookieConsentBanner({
  privacyPolicyUrl,
}: {
  privacyPolicyUrl?: string | null
}) {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!hasConsentDecision()) {
      setVisible(true)
    }
  }, [])

  function setConsent(granted: boolean) {
    const value = granted ? 'granted' : 'denied'
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
    setVisible(false)
    if (granted) {
      // Re-run server components so the layout re-reads the consent cookie and injects analytics.
      router.refresh()
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-background/95 px-5 py-4 shadow-xl backdrop-blur-sm md:flex md:items-center md:gap-8 md:px-7 md:py-5">
        <p id="cookie-consent-description" className="flex-1 text-sm leading-6 text-muted-foreground">
          We use cookies to analyse site performance and improve your experience. You can choose
          which cookies to allow.{' '}
          {privacyPolicyUrl ? (
            <Link
              href={privacyPolicyUrl}
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
            >
              Privacy Policy
            </Link>
          ) : null}
        </p>
        <div className="mt-4 flex shrink-0 flex-wrap gap-3 md:mt-0">
          <button
            type="button"
            onClick={() => setConsent(false)}
            aria-label="Reject non-essential cookies"
            className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => setConsent(true)}
            aria-label="Accept all cookies"
            className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
