import { getRenderableBlocks, RenderBlocks } from '@/blocks/renderBlocks'
import type { Page, SystemPage } from '@/payload-types'

export function PageContent({ page }: { page: Page | SystemPage }) {
  return <RenderBlocks blocks={getRenderableBlocks(page)} />
}
