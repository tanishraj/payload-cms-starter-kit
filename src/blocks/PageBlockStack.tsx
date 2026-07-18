import type { ReactNode } from 'react'

type PageBlockStackProps = {
  children: ReactNode
}

export function PageBlockStack({ children }: PageBlockStackProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-0" data-page-block-stack="true">
      {children}
    </div>
  )
}
