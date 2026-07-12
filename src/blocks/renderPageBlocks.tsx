import type { Page } from '@/payload-types'

import { AnnouncementBlockComponent } from './Announcement/Component'

export type PageBlock = NonNullable<Page['layout']>[number]

export function renderPageBlocks(blocks?: PageBlock[] | null) {
  if (!blocks?.length) {
    return null
  }

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'announcement':
            return (
              <AnnouncementBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
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
