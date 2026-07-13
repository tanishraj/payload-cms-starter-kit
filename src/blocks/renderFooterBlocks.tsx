import type { LogoMediaLike } from '@/components/site/SiteLogo'
import type { Footer } from '@/payload-types'

import { Footer56BlockComponent } from './Footer56/Component'

export type FooterBlock = NonNullable<Footer['layout']>[number]

export function renderFooterBlocks(
  blocks?: FooterBlock[] | null,
  context?: { siteLogo?: LogoMediaLike; siteName?: string | null },
) {
  if (!blocks?.length) {
    return null
  }

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'footer56':
            return (
              <Footer56BlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                siteLogo={context?.siteLogo}
                siteName={context?.siteName}
                {...block}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
