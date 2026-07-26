import {
  Contact24BlockPresentation,
  type Contact24BlockLike,
} from '@/blocks/Contact24/Presentation'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'

export function Contact24PreviewBlockComponent({
  officeLocations,
  ...props
}: Contact24BlockLike & { officeLocations: SiteOfficeLocation[] }) {
  return <Contact24BlockPresentation {...props} offices={officeLocations} />
}
