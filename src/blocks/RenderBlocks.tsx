import type { Page } from '@/payload-types'

import { FeatureGridBlockComponent } from '@/blocks/FeatureGrid/Component'
import { Hero174BlockComponent } from '@/blocks/Hero174/Component'
import { HeroBlockComponent } from '@/blocks/Hero/Component'

type LayoutBlock = NonNullable<Page['layout']>[number]

const blockComponents = {
  featureGrid: FeatureGridBlockComponent,
  hero: HeroBlockComponent,
  hero174: Hero174BlockComponent,
} as const

export function RenderBlocks({ blocks }: { blocks?: Page['layout'] | null }) {
  if (!blocks?.length) {
    return null
  }

  return blocks.map((block, index) => {
    const Component = blockComponents[block.blockType as keyof typeof blockComponents]

    if (!Component) {
      return null
    }

    return <Component key={block.id ?? `${block.blockType}-${index}`} {...(block as LayoutBlock)} />
  })
}
