import { ActionArrow } from '@/components/ActionArrow'

type ActionButtonContentProps = {
  label: string
  showArrow?: boolean
}

export function ActionButtonContent({ label, showArrow = false }: ActionButtonContentProps) {
  return (
    <>
      <span>{label}</span>
      {showArrow ? <ActionArrow data-action-arrow="true" data-icon="inline-end" /> : null}
    </>
  )
}
