'use client'

// Authenticated upstream: @shadcnblocks/input-input-types-5 (Date),
// @shadcnblocks/input-input-special-2 (Time), 2026-10-14.
// Preserve the native Input, icon position and padding; caller owns Field/label.
import { Calendar, Clock } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/revamp/ui/input'

export function FormTemporalControl({
  type,
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, 'type'> & { type: 'date' | 'time' }) {
  const Icon = type === 'date' ? Calendar : Clock
  return (
    <div className="relative">
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        {...props}
        className={cn('bg-background pl-9 scheme-light dark:scheme-dark', className)}
        type={type}
        step={type === 'time' ? 60 : undefined}
      />
    </div>
  )
}
