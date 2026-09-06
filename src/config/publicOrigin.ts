import { parseApplicationOrigin } from '@/config/applicationOrigin'

export const publicApplicationOrigin = parseApplicationOrigin(
  process.env.NEXT_PUBLIC_SERVER_URL,
  process.env.NODE_ENV === 'production',
)
