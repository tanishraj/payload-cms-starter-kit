import { ArrowRight } from 'lucide-react'

type ActionButtonContentProps = {
  label: string
  showArrow?: boolean
}

export function ActionButtonContent({ label, showArrow = false }: ActionButtonContentProps) {
  return (
    <>
      <span>{label}</span>
      {showArrow ? (
        <ArrowRight
          aria-hidden="true"
          className="transition-transform duration-200 ease-out motion-reduce:transition-none group-hover/button:translate-x-0.5 group-focus-visible/button:translate-x-0.5"
          data-action-arrow="true"
          data-icon="inline-end"
          strokeWidth={2.5}
        />
      ) : null}
    </>
  )
}
