import { SystemPageHero } from '@/components/system-page-hero'

export function SystemModeFallbackPage({
  mode,
}: {
  mode: 'comingSoon' | 'maintenance'
}) {
  if (mode === 'maintenance') {
    return (
      <SystemPageHero
        badge="Maintenance"
        heading="We'll be back soon"
        description="We're making a few updates right now. Please check back shortly."
        statusDisplay="Maintenance"
      />
    )
  }

  return (
    <SystemPageHero
      badge="Coming Soon"
      heading="Something new is on the way"
      description="We're getting things ready. Please check back soon."
      statusDisplay="Coming Soon"
    />
  )
}

export function DefaultNotFoundPage() {
  return (
    <SystemPageHero
      badge="404"
      heading="Page not found"
      description="Sorry, we can't find that page."
      primaryAction={{
        label: 'Back to home',
        url: '/',
      }}
      statusDisplay="404"
    />
  )
}
