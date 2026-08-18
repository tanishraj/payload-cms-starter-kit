import {
  NewsEventsTabsBlockPresentation,
  type NewsEventsTabsBlockLike,
} from '@/blocks/NewsEventsTabs/Presentation'
import { normalizeNewsEventsTabsItemsPerTab } from '@/blocks/NewsEventsTabs/newsEventsTabsShared'
import { getNewsEventGroups } from '@/lib/newsEvents'

export type { NewsEventsTabsBlockLike } from '@/blocks/NewsEventsTabs/Presentation'

export async function NewsEventsTabsBlockComponent(props: NewsEventsTabsBlockLike) {
  const itemCount = normalizeNewsEventsTabsItemsPerTab(props.itemsPerTab)
  const groups = await getNewsEventGroups(itemCount, new Date().toISOString())

  return <NewsEventsTabsBlockPresentation {...props} groups={groups} />
}
