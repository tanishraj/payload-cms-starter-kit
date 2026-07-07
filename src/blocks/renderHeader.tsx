import { HeaderNavbar12BlockComponent } from './HeaderNavbar12/Component'

import type { Header, SiteSetting } from '@/payload-types'

type HeaderBlock = NonNullable<Header['layout']>[number]

export function RenderHeader({
  header,
  siteSettings,
}: {
  header?: Header | null
  siteSettings: SiteSetting
}) {
  const block = header?.layout?.[0] as HeaderBlock | undefined

  if (!block) {
    return null
  }

  switch (block.blockType) {
    case 'headerNavbar12':
      return (
        <HeaderNavbar12BlockComponent
          block={block}
          siteSettings={siteSettings}
        />
      )
    default:
      return null
  }
}
