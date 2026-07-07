import { SystemPageHero } from '@/components/system-page-hero'

export function SystemModeFallbackPage({
  mode,
}: {
  mode: 'comingSoon' | 'maintenance'
}) {
  if (mode === 'maintenance') {
    return (
      <SystemPageHero
        kind="maintenance"
        badge="Maintenance"
        heading="We’re carrying out scheduled updates."
        description="The public site is temporarily unavailable while maintenance is in progress. Please check back shortly."
        supportingNote="If you are an administrator, sign in to the admin panel to continue managing the site."
      />
    )
  }

  return (
    <SystemPageHero
      kind="comingSoon"
      badge="Coming Soon"
      heading="A new experience is on the way."
      description="This site is not publicly available yet. Please check back soon for the full launch."
      supportingNote="If you are an administrator, sign in to the admin panel to continue managing the site."
    />
  )
}

export function DefaultNotFoundPage() {
  return (
    <SystemPageHero
      kind="404"
      badge="404"
      heading="The page you requested could not be found."
      description="The link may be outdated, the page may have moved, or the URL may be incorrect."
      primaryAction={{
        label: 'Go to homepage',
        url: '/',
      }}
    />
  )
}
