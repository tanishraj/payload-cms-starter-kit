import type { UIField } from 'payload'
import type { SiteSetupGlobal } from '@/lib/siteSetupGuide'

/** Explicitly registered on the two owning globals; stores no setting values. */
export function siteSetupGuideField(globalSlug: SiteSetupGlobal): UIField {
  return {
    name: 'siteSetupGuide',
    type: 'ui',
    admin: {
      components: {
        Field: {
          path: '@/components/admin/SiteSetupGuideField#SiteSetupGuideField',
          serverProps: { globalSlug },
        },
      },
    },
  }
}
