import { renderFooterBlocks } from '@/blocks/renderFooterBlocks'
import type { LogoMediaLike } from '@/components/site/SiteLogo'
import type { Footer, Page } from '@/payload-types'

type GlobalFooterProps = {
  footer?: Pick<Footer, 'layout'> | null
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
}

export function GlobalFooter({
  footer,
  privacyPolicyPage,
  termsAndConditionsPage,
  siteAddress,
  siteEmail,
  siteLogo,
  siteName,
  sitePhone,
  siteSocialLinks,
}: GlobalFooterProps) {
  if (!footer?.layout?.length) {
    return null
  }

  return (
    <div data-global-footer="true">
      {renderFooterBlocks(footer.layout, {
        privacyPolicyPage,
        termsAndConditionsPage,
        siteAddress,
        siteEmail,
        siteLogo,
        siteName,
        sitePhone,
        siteSocialLinks,
      })}
    </div>
  )
}
