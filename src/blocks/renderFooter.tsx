import { Footer2BlockComponent } from './Footer2/Component'

import type { Footer, SiteSetting } from '@/payload-types'

type FooterBlock = NonNullable<Footer['layout']>[number]

export function RenderFooter({
  footer,
  siteSettings,
}: {
  footer?: Footer | null
  siteSettings: SiteSetting
}) {
  const block = footer?.layout?.[0] as FooterBlock | undefined

  if (!block) {
    return null
  }

  switch (block.blockType) {
    case 'footer2':
      return (
        <Footer2BlockComponent
          {...block}
          siteSettings={siteSettings}
        />
      )
    default:
      return null
  }
}
