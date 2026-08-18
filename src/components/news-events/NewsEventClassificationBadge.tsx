import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  getNewsEventClassificationLabel,
  normalizeNewsEventClassification,
} from '@/lib/newsEventClassifications'
import { cn } from '@/lib/utils'

type NewsEventClassificationBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'variant'
> & {
  classification?: string | null
}

export function NewsEventClassificationBadge({
  classification,
  className,
  ...props
}: NewsEventClassificationBadgeProps) {
  const resolvedClassification = normalizeNewsEventClassification(classification)

  return (
    <Badge
      className={cn('border-border bg-accent text-accent-foreground', className)}
      data-news-event-classification={resolvedClassification}
      variant="outline"
      {...props}
    >
      {getNewsEventClassificationLabel(resolvedClassification)}
    </Badge>
  )
}
