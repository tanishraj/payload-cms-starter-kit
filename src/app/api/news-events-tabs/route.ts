import { getNewsEventPage, parseNewsEventsTabsPagination } from '@/lib/newsEvents'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const pagination = parseNewsEventsTabsPagination(new URL(request.url).searchParams)

  if (!pagination.ok) {
    return Response.json({ message: pagination.message }, { status: 400 })
  }

  try {
    return Response.json(
      await getNewsEventPage(
        pagination.classification,
        pagination.page,
        pagination.limit,
        new Date().toISOString(),
      ),
    )
  } catch {
    return Response.json({ message: 'Unable to load News & Events.' }, { status: 500 })
  }
}
