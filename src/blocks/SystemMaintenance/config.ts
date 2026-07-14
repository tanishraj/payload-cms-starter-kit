import { createBaseSystemPageFields, createSystemPageBlock } from '../systemPageFields'
import { systemMaintenanceThumbnail } from './thumbnail'

const defaults = {
  badge: 'Maintenance',
  heading: 'This website is temporarily unavailable',
  description: 'We are carrying out scheduled updates to improve the website. Please check back shortly.',
}

export const SystemMaintenanceBlock = createSystemPageBlock({
  fields: createBaseSystemPageFields(defaults),
  singularLabel: 'System Maintenance',
  pluralLabel: 'System Maintenance Blocks',
  slug: 'systemMaintenance',
  thumbnailUrl: systemMaintenanceThumbnail,
})
