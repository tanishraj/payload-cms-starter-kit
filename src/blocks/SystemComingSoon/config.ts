import { createSystemPageBlock } from '../systemPageFields'

export const SystemComingSoonBlock = createSystemPageBlock({
  defaults: {
    badge: 'Coming Soon',
    heading: 'Something new is on the way',
    description: "We're getting things ready. Please check back soon.",
  },
  singularLabel: 'System Coming Soon',
  pluralLabel: 'System Coming Soon Blocks',
  slug: 'systemComingSoon',
})
