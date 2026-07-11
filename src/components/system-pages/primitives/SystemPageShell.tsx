import type { ReactNode } from 'react'

import type { SystemPageVariant } from '@/components/system-pages/types'

export function SystemPageShell({
  children,
  className,
  variant,
}: {
  children: ReactNode
  className?: string
  variant: SystemPageVariant
}) {
  return (
    <section
      data-system-page-root="true"
      data-system-page-variant={variant}
      className={[
        'flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center md:px-10',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </section>
  )
}
