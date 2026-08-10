import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'

type MaxWidth = 'full' | 'lg' | 'md' | 'prose'

type RichTextBlockLike = {
  appearance?: BlockAppearance | null
  content?: SerializedEditorState | null
  maxWidth?: MaxWidth | null
  size?: RegularBlockSize | null
}

const maxWidthClasses: Record<MaxWidth, string> = {
  prose: 'max-w-prose',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  full: 'max-w-none',
}

export function RichTextBlockComponent({
  appearance,
  content,
  maxWidth = 'prose',
  size = 'default',
}: RichTextBlockLike) {
  if (!content) return null

  const resolvedSize: RegularBlockSize = size ?? 'default'
  const resolvedMaxWidth: MaxWidth = maxWidth ?? 'prose'
  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)

  return (
    <section className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        <div className={cn('mx-auto', maxWidthClasses[resolvedMaxWidth])}>
          <div className="prose max-w-none text-current [--tw-prose-body:currentColor] [--tw-prose-headings:currentColor] [--tw-prose-lead:color-mix(in_oklch,currentColor_70%,transparent)] [--tw-prose-links:var(--primary)] [--tw-prose-bold:currentColor] [--tw-prose-counters:color-mix(in_oklch,currentColor_70%,transparent)] [--tw-prose-bullets:var(--border)] [--tw-prose-hr:var(--border)] [--tw-prose-quotes:currentColor] [--tw-prose-quote-borders:var(--border)] [--tw-prose-captions:color-mix(in_oklch,currentColor_70%,transparent)] [--tw-prose-code:currentColor] [--tw-prose-pre-code:var(--card-foreground)] [--tw-prose-pre-bg:var(--card)] [--tw-prose-th-borders:var(--border)] [--tw-prose-td-borders:var(--border)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-ring">
            <RichText data={content} />
          </div>
        </div>
      </div>
    </section>
  )
}
