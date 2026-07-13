import type { LogoMediaLike } from '@/components/site/SiteLogo'
import type { Footer, Page } from '@/payload-types'

import { Footer56BlockComponent } from './Footer56/Component'

export type FooterBlock = NonNullable<Footer['layout']>[number]

export function renderFooterBlocks(
  blocks?: FooterBlock[] | null,
  context?: {
    privacyPolicyPage?: Page | null
    termsAndConditionsPage?: Page | null
    siteAddress?: string | null
    siteEmail?: string | null
    siteLogo?: LogoMediaLike
    siteName?: string | null
    sitePhone?: string | null
    siteSocialLinks?: {
      facebook?: string | null
      instagram?: string | null
      linkedin?: string | null
      youtube?: string | null
    } | null
  },
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
                privacyPolicyPage={context?.privacyPolicyPage}
                termsAndConditionsPage={context?.termsAndConditionsPage}
                siteAddress={context?.siteAddress}
                siteEmail={context?.siteEmail}
                siteLogo={context?.siteLogo}
                siteName={context?.siteName}
                sitePhone={context?.sitePhone}
                siteSocialLinks={context?.siteSocialLinks}
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
