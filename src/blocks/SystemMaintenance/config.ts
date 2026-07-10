import { createSystemPageBlock } from '../systemPageFields'

export const SystemMaintenanceBlock = createSystemPageBlock({
  defaults: {
    badge: 'Maintenance',
    heading: "We'll be back soon",
    description: "We're making a few updates right now. Please check back shortly.",
  },
  singularLabel: 'System Maintenance',
  pluralLabel: 'System Maintenance Blocks',
  slug: 'systemMaintenance',
})
