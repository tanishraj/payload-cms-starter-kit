'use client'

import { BookOpen, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/revamp/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/revamp/ui/empty'
import type { OnboardingAction } from '@/lib/adminOnboardingShared'
import './onboarding-panel.css'

export type OnboardingPanelProps = {
  title: string
  description: string
  action: OnboardingAction
  collapsed?: boolean
  dismissible?: boolean
  ready?: boolean
  pending?: boolean
  error?: string
  onToggle: (collapsed: boolean) => void
}

/** Source: authenticated @shadcnblocks/empty-empty-actions-2.
 * Preserve the source Empty/Header/Content and paired actions; callers own facts and persistence. */
export function OnboardingPanel({
  title,
  description,
  action,
  collapsed = false,
  dismissible = true,
  ready = true,
  pending = false,
  error,
  onToggle,
}: OnboardingPanelProps) {
  const reopen = useRef<HTMLButtonElement>(null)
  const dismiss = useRef<HTMLButtonElement>(null)
  const previous = useRef(collapsed)
  useEffect(() => {
    if (previous.current !== collapsed) {
      previous.current = collapsed
      const target = collapsed ? reopen : dismiss
      target.current?.focus()
    }
  }, [collapsed])
  return (
    <section className="admin-onboarding" aria-label="Getting started">
      {collapsed && dismissible ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending || !ready}
          aria-busy={pending}
          ref={reopen}
          onClick={() => onToggle(false)}
        >
          <BookOpen data-icon="inline-start" />
          Getting started
        </Button>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle role="heading" aria-level={2}>
              {title}
            </EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild={!action.disabled} disabled={action.disabled}>
                {action.disabled ? (
                  <>
                    <ArrowRight data-icon="inline-start" />
                    {action.label}
                  </>
                ) : (
                  <a
                    href={action.href}
                    target={action.target}
                    rel={action.target === '_blank' ? 'noopener noreferrer' : undefined}
                    aria-label={
                      action.target === '_blank'
                        ? `${action.label} (opens in a new tab)`
                        : undefined
                    }
                  >
                    <ArrowRight data-icon="inline-start" />
                    {action.label}
                  </a>
                )}
              </Button>
              {dismissible ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending || !ready}
                  aria-busy={pending}
                  ref={dismiss}
                  onClick={() => onToggle(true)}
                >
                  {pending ? 'Saving…' : 'Hide guide'}
                </Button>
              ) : null}
            </div>
          </EmptyContent>
        </Empty>
      )}
      {error ? <p role="alert">{error}</p> : null}
    </section>
  )
}
