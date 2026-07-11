import { SystemPageActions } from '@/components/system-pages/primitives/SystemPageActions'
import { SystemPageCopy } from '@/components/system-pages/primitives/SystemPageCopy'
import { SystemPageShell } from '@/components/system-pages/primitives/SystemPageShell'
import { SystemPageStatus } from '@/components/system-pages/primitives/SystemPageStatus'
import type { SystemPageViewProps } from '@/components/system-pages/types'

export function SystemMaintenanceView(props: SystemPageViewProps) {
  return (
    <SystemPageShell variant="maintenance">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
        <SystemPageStatus>{props.statusDisplay || props.badge || 'Maintenance'}</SystemPageStatus>
        <SystemPageCopy description={props.description} heading={props.heading} />
        <SystemPageActions
          primaryAction={props.primaryAction}
          secondaryAction={props.secondaryAction}
        />
        {props.supportingNote ? (
          <p className="max-w-lg animate-[fade-in_.7s_ease-out_.38s_both] text-[clamp(0.875rem,2.2vw,1rem)] leading-6 text-muted-foreground">
            {props.supportingNote}
          </p>
        ) : null}
      </div>
    </SystemPageShell>
  )
}
