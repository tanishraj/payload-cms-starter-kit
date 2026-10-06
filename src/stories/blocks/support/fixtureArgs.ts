import { isValidElement } from 'react'
import type { ArgTypes } from 'storybook/internal/types'
import type { BlockThumbnailSlug } from '@/block-thumbnails/definitions'
import { getBlockThumbnailFixture } from '@/block-thumbnails/fixtures'

/** Reuse the production-component sample; never maintain a second fixture copy. */
export function getBlockStoryArgs<Props extends object>(slug: BlockThumbnailSlug): Props {
  const fixture = getBlockThumbnailFixture(slug)
  if (!isValidElement<Props>(fixture)) throw new Error(`Invalid block sample: ${slug}`)
  return fixture.props
}

export function getBlockStoryArgTypes<Props extends object>(
  args: Props,
  choices: Partial<{ [Key in keyof Props]: readonly NonNullable<Props[Key]>[] }> = {},
): Partial<ArgTypes<Props>> {
  const controls: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(args)) {
    controls[name] = {
      name: name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
      control:
        typeof value === 'boolean'
          ? 'boolean'
          : typeof value === 'number'
            ? 'number'
            : typeof value === 'string'
              ? 'text'
              : 'object',
    }
  }
  if ('size' in args)
    controls.size = {
      name: 'Section padding',
      control: 'select',
      options: ['none', 'compact', 'default', 'comfortable'],
    }
  if ('themeMode' in args)
    controls.themeMode = {
      name: 'Theme mode',
      control: 'select',
      options: ['auto', 'light', 'dark'],
    }
  if ('contentAlignment' in args)
    controls.contentAlignment = {
      name: 'Content alignment',
      control: 'select',
      options: ['left', 'center', 'right'],
    }
  if ('blockType' in args) controls.blockType = { control: false, table: { disable: true } }
  for (const [name, options] of Object.entries(choices)) {
    controls[name] = {
      name: name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
      ...(controls[name] as object),
      control: 'select',
      options,
    }
  }
  return controls as Partial<ArgTypes<Props>>
}
