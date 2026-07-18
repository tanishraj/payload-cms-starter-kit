export type RegularBlockSize = 'comfortable' | 'compact' | 'default'

export const regularBlockContainerClasses = 'mx-auto w-full max-w-screen-2xl px-4'

export const regularBlockMobilePaddingClasses = {
  compact: 'py-10',
  default: 'py-12',
  comfortable: 'py-16',
} as const satisfies Record<RegularBlockSize, string>
