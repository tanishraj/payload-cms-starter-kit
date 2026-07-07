import type { Page, SystemPage } from '@/payload-types'

import { FormBlockComponent } from './Form/Component'
import { Hero36BlockComponent } from './Hero36/Component'
import { System404BlockComponent } from './System404/Component'
import { SystemComingSoonBlockComponent } from './SystemComingSoon/Component'
import { SystemMaintenanceBlockComponent } from './SystemMaintenance/Component'

type RenderableBlock =
  | NonNullable<Page['layout']>[number]
  | NonNullable<SystemPage['layout']>[number]

type RenderableDocument = Page | SystemPage

export function getRenderableBlocks(document: RenderableDocument): RenderableBlock[] | null {
  if ('type' in document) {
    return document.layout ?? null
  }

  return document.layout ?? null
}

export function RenderBlocks({ blocks }: { blocks?: RenderableBlock[] | null }) {
  if (!blocks?.length) {
    return null
  }

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'hero36':
            return (
              <Hero36BlockComponent key={block.id ?? `${block.blockType}-${index}`} {...block} />
            )
          case 'form':
            return <FormBlockComponent key={block.id ?? `${block.blockType}-${index}`} {...block} />
          case 'system404':
            return (
              <System404BlockComponent key={block.id ?? `${block.blockType}-${index}`} {...block} />
            )
          case 'systemMaintenance':
            return (
              <SystemMaintenanceBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'systemComingSoon':
            return (
              <SystemComingSoonBlockComponent
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
