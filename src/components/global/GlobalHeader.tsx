import { renderHeaderBlocks } from '@/blocks/renderHeaderBlocks'
import type { LogoMediaLike } from '@/components/site/SiteLogo'
import type { Header } from '@/payload-types'

type GlobalHeaderProps = {
  header?: Pick<Header, 'layout'> | null
  siteLogo?: LogoMediaLike
  siteName?: string | null
  stickyTopOffset?: string
}

export function GlobalHeader({
  header,
  siteLogo,
  siteName,
  stickyTopOffset = '0px',
}: GlobalHeaderProps) {
  if (!header?.layout?.length) {
    return null
  }

  return (
    <div
      data-global-header="true"
      style={{
        position: 'sticky',
        top: stickyTopOffset,
        zIndex: 30,
      }}
    >
      {renderHeaderBlocks(header.layout, { siteLogo, siteName, stickyTopOffset })}
    </div>
  )
}
