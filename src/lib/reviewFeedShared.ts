export const REVIEW_FEED_DEFAULT_PAGE_SIZE = 4
export const REVIEW_FEED_MAX_PAGE_SIZE = 12

export type PublicReviewFeedItem = {
  authorName: string
  content: string
  date: string
  id: string
  rating: number
  title: string
  verified: boolean
}

export type PublicReviewFeedPage = {
  docs: PublicReviewFeedItem[]
  hasNextPage: boolean
  page: number
  totalPages: number
}
