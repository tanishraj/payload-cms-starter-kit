import {
  Contact24BlockPresentation,
  type Contact24BlockLike,
} from '@/blocks/Contact24/Presentation'
import { getPublishedSiteOfficeLocations } from '@/lib/siteOffices'

export async function Contact24BlockComponent(props: Contact24BlockLike) {
  const offices = await getPublishedSiteOfficeLocations()

  return <Contact24BlockPresentation {...props} offices={offices} />
}
