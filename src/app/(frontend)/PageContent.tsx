import { getRenderableBlocks, RenderBlocks } from '@/blocks/RenderBlocks'
import type { Page, SystemPage } from '@/payload-types'

export function PageContent({ page }: { page: Page | SystemPage }) {
  const isSystemPage = 'type' in page

  if (isSystemPage) {
    return (
      <div data-system-page-root="true">
        <RenderBlocks blocks={getRenderableBlocks(page)} />
      </div>
    )
  }

  return <RenderBlocks blocks={getRenderableBlocks(page)} />
}
