import configPromise from '@payload-config'
import { getPayload } from 'payload'

type StatCardProps = {
  label: string
  value: number | string
  href: string
  accent?: string
}

function StatCard({ label, value, href, accent = '#6366f1' }: StatCardProps) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '8px',
        padding: '20px 24px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s',
      }}
    >
      <span
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: '13px', color: 'var(--theme-elevation-600)', fontWeight: 500 }}>
        {label}
      </span>
    </a>
  )
}

export async function DashboardOverview() {
  const payload = await getPayload({ config: configPromise })

  const [pages, articles, newsEvents, submissions, workQueue, recentSubmissionsResult] =
    await Promise.all([
      payload.count({ collection: 'pages', overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
      payload
        .count({ collection: 'articles', overrideAccess: true })
        .catch(() => ({ totalDocs: 0 })),
      payload
        .count({ collection: 'news-events', overrideAccess: true })
        .catch(() => ({ totalDocs: 0 })),
      payload
        .count({
          collection: 'form-submissions',
          overrideAccess: true,
          where: { status: { in: ['new', 'in_review'] } },
        })
        .catch(() => ({ totalDocs: 0 })),
      payload
        .count({
          collection: 'work-queue',
          overrideAccess: true,
          where: { resolvedAt: { exists: false } },
        })
        .catch(() => ({ totalDocs: 0 })),
      payload
        .find({
          collection: 'form-submissions',
          overrideAccess: true,
          depth: 0,
          limit: 5,
          sort: '-submittedAt',
        })
        .catch(() => ({ docs: [] })),
    ])

  const recentSubmissions = recentSubmissionsResult.docs

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          label="Published Pages"
          value={pages.totalDocs}
          href="/admin/collections/pages"
          accent="#6366f1"
        />
        <StatCard
          label="Articles"
          value={articles.totalDocs}
          href="/admin/collections/articles"
          accent="#0ea5e9"
        />
        <StatCard
          label="News & Events"
          value={newsEvents.totalDocs}
          href="/admin/collections/news-events"
          accent="#10b981"
        />
        <StatCard
          label="Open Submissions"
          value={submissions.totalDocs}
          href="/admin/collections/form-submissions"
          accent="#f59e0b"
        />
        <StatCard
          label="Work Queue"
          value={workQueue.totalDocs}
          href="/admin/collections/work-queue"
          accent="#ef4444"
        />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '12px',
          }}
        >
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { label: '+ New Page', href: '/admin/collections/pages/create' },
            { label: '+ New Article', href: '/admin/collections/articles/create' },
            { label: '+ New News / Event', href: '/admin/collections/news-events/create' },
            { label: '+ New Reusable Section', href: '/admin/collections/reusable-sections/create' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'inline-block',
                padding: '7px 14px',
                background: 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--theme-text)',
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      {recentSubmissions.length > 0 ? (
        <div>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--theme-elevation-500)',
              marginBottom: '12px',
            }}
          >
            Recent Submissions
          </h2>
          <div
            style={{
              background: 'var(--theme-elevation-100)',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-200)' }}>
                  {['From', 'Form intent', 'Status', 'Submitted'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--theme-elevation-600)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub, i) => {
                  const isLast = i === recentSubmissions.length - 1
                  return (
                    <tr
                      key={sub.id}
                      style={isLast ? {} : { borderBottom: '1px solid var(--theme-elevation-150)' }}
                    >
                      <td style={{ padding: '10px 16px' }}>
                        <a
                          href={`/admin/collections/form-submissions/${sub.id}`}
                          style={{ color: 'var(--theme-text)', textDecoration: 'underline' }}
                        >
                          {sub.submitterEmail || sub.submitterName || `#${sub.id}`}
                        </a>
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--theme-elevation-600)' }}>
                        {sub.submissionIntent ?? '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background:
                              sub.status === 'new'
                                ? '#fef3c7'
                                : sub.status === 'in_review'
                                  ? '#dbeafe'
                                  : '#f3f4f6',
                            color:
                              sub.status === 'new'
                                ? '#92400e'
                                : sub.status === 'in_review'
                                  ? '#1e40af'
                                  : '#374151',
                          }}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          color: 'var(--theme-elevation-600)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
