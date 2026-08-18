import {
  NewsEventsTabsBlockPresentation,
  type NewsEventsTabsBlockLike,
} from '@/blocks/NewsEventsTabs/Presentation'
import { normalizeNewsEventsTabsItemsPerTab } from '@/blocks/NewsEventsTabs/newsEventsTabsShared'
import type { NewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewShared'

type NewsEventsTabsPreviewBlockProps = NewsEventsTabsBlockLike & {
  snapshot: NewsEventsPreviewSnapshot
}

export function NewsEventsTabsPreviewBlockComponent({
  snapshot,
  ...props
}: NewsEventsTabsPreviewBlockProps) {
  const itemCount = normalizeNewsEventsTabsItemsPerTab(props.itemsPerTab)

  return (
    <NewsEventsTabsBlockPresentation
      {...props}
      groups={snapshot.groupsByCount[String(itemCount)]}
    />
  )
}
