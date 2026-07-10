import { createSystemPageBlock } from '../systemPageFields'

export const System404Block = createSystemPageBlock({
  defaults: {
    badge: '404',
    heading: 'Page not found',
    description: "Sorry, we can't find that page.",
  },
  singularLabel: 'System 404',
  pluralLabel: 'System 404 Blocks',
  slug: 'system404',
})
