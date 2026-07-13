import { renderFooterBlocks } from '@/blocks/renderFooterBlocks'
import type { LogoMediaLike } from '@/components/site/SiteLogo'
import type { Footer } from '@/payload-types'

type GlobalFooterProps = {
  footer?: Pick<Footer, 'layout'> | null
  siteLogo?: LogoMediaLike
  siteName?: string | null
}

export function GlobalFooter({ footer, siteLogo, siteName }: GlobalFooterProps) {
  if (!footer?.layout?.length) {
    return null
  }

  return <div data-global-footer="true">{renderFooterBlocks(footer.layout, { siteLogo, siteName })}</div>
}
