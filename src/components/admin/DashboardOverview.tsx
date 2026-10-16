import type { Payload } from 'payload'

import { ADMIN_FEATURES, type AdminFeatureKey } from '@/access/adminFeatures'
import { getGrantedFeatureKeys, hasFeature, isAdmin } from '@/access/featureAccess'
import type { User } from '@/payload-types'
import {
  loadDashboardSections,
  loadDashboardOnboarding,
  canOpenDashboardFeature,
} from '@/lib/adminOnboarding'
import { getSiteSetupDestination } from '@/lib/siteSetupGuide'
import { DashboardGettingStarted } from './DashboardGettingStarted'

import './DashboardOverview.scss'

type DashboardOverviewProps = {
  payload: Payload
  user: User | null
}

type CountValue = number | null

type AttentionCardProps = {
  alert?: boolean
  href: string
  label: string
  tone: 'error' | 'success' | 'warning'
  value: CountValue
}

function AttentionCard({ alert = false, href, label, tone, value }: AttentionCardProps) {
  const unavailable = value === null
  const active = alert && !unavailable && value > 0

  return (
    <a
      className="admin-dashboard-overview__attention-card"
      data-active={active || undefined}
      data-tone={tone}
      href={href}
    >
      <span className="admin-dashboard-overview__attention-value">{unavailable ? '—' : value}</span>
      <span className="admin-dashboard-overview__attention-label">{label}</span>
      {unavailable ? (
        <span className="admin-dashboard-overview__attention-note">Count unavailable</span>
      ) : active ? (
        <span className="admin-dashboard-overview__attention-note">Needs attention →</span>
      ) : null}
    </a>
  )
}

function MiniStat({ href, label, value }: { href: string; label: string; value: CountValue }) {
  return (
    <a className="admin-dashboard-overview__mini-stat" href={href}>
      <span>{label}</span>
      <span className="admin-dashboard-overview__mini-value">{value === null ? '—' : value}</span>
      {value === null ? (
        <span className="admin-dashboard-overview__mini-note">Count unavailable</span>
      ) : null}
    </a>
  )
}

const TYPE_TONES: Record<string, 'neutral' | 'success' | 'warning'> = {
  Article: 'neutral',
  'News & Event': 'success',
  Page: 'neutral',
  Review: 'warning',
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

type RecentItem = {
  collection: string
  id: string
  status: null | string | undefined
  title?: null | string
  type: string
  updatedAt: string
}

type DashboardDoc = {
  _status?: null | string
  id: number | string
  status?: null | string
  submissionIntent?: null | string
  submittedAt?: null | string
  submitterEmail?: null | string
  submitterName?: null | string
  title?: null | string
  updatedAt?: string
}

function RecentEditRow({ item }: { item: RecentItem }) {
  const typeTone = TYPE_TONES[item.type] ?? 'neutral'
  const status = item.status === 'published' ? 'published' : 'draft'

  return (
    <a
      className="admin-dashboard-overview__recent-row"
      href={`/admin/collections/${item.collection}/${item.id}`}
    >
      <span className="admin-dashboard-overview__type" data-tone={typeTone}>
        {item.type}
      </span>
      <span className="admin-dashboard-overview__recent-title">{item.title}</span>
      <span className="admin-dashboard-overview__status" data-status={status}>
        {status === 'published' ? 'Published' : 'Draft'}
      </span>
      <time className="admin-dashboard-overview__time" dateTime={item.updatedAt}>
        {formatRelativeTime(item.updatedAt)}
      </time>
    </a>
  )
}

const featureHref = (key: AdminFeatureKey) => {
  const { kind, slug } = ADMIN_FEATURES[key].resource
  return kind === 'collection' ? `/admin/collections/${slug}` : `/admin/globals/${slug}`
}

const countUnavailable = async () => ({ totalDocs: null as CountValue })
const countHidden = async () => ({ totalDocs: 0 as CountValue })
const emptyDocs = async () => ({ docs: [] as DashboardDoc[] })

export async function DashboardOverview({ payload, user }: DashboardOverviewProps) {
  if (!user) return null

  const sections = await loadDashboardSections(payload, user)
  const visibility = {
    articles: hasFeature(user, 'articles'),
    formSubmissions: canOpenDashboardFeature(user, sections, 'formSubmissions'),
    media: hasFeature(user, 'media'),
    newsEvents: hasFeature(user, 'newsEvents'),
    pages: canOpenDashboardFeature(user, sections, 'pages'),
    reusableSections: canOpenDashboardFeature(user, sections, 'reusableSections'),
    reviews: hasFeature(user, 'reviews'),
    workQueue: canOpenDashboardFeature(user, sections, 'actionQueue'),
  }
  const secureQuery = { overrideAccess: false as const, user }

  const [
    pagesTotal,
    articlesTotal,
    newsTotal,
    reviewsTotal,
    pendingReviews,
    openSubmissions,
    actionQueue,
    recentPages,
    recentArticles,
    recentNews,
    recentReviews,
    recentSubmissionsResult,
    onboarding,
  ] = await Promise.all([
    visibility.pages
      ? payload.count({ collection: 'pages', ...secureQuery }).catch(countUnavailable)
      : countHidden(),
    visibility.articles
      ? payload.count({ collection: 'articles', ...secureQuery }).catch(countUnavailable)
      : countHidden(),
    visibility.newsEvents
      ? payload.count({ collection: 'news-events', ...secureQuery }).catch(countUnavailable)
      : countHidden(),
    visibility.reviews
      ? payload.count({ collection: 'reviews', ...secureQuery }).catch(countUnavailable)
      : countHidden(),
    visibility.reviews
      ? payload
          .count({
            collection: 'reviews',
            ...secureQuery,
            where: {
              and: [
                { sourceSubmission: { exists: true } },
                { moderationStatus: { equals: 'pending' } },
              ],
            },
          })
          .catch(countUnavailable)
      : countHidden(),
    visibility.formSubmissions
      ? payload
          .count({
            collection: 'form-submissions',
            ...secureQuery,
            where: { status: { in: ['new', 'in_review'] } },
          })
          .catch(countUnavailable)
      : countHidden(),
    visibility.workQueue
      ? payload
          .count({
            collection: 'work-queue',
            ...secureQuery,
            where: { status: { in: ['open', 'in_progress', 'blocked'] } },
          })
          .catch(countUnavailable)
      : countHidden(),
    visibility.pages
      ? payload
          .find({
            collection: 'pages',
            ...secureQuery,
            draft: true,
            depth: 0,
            limit: 5,
            sort: '-updatedAt',
          })
          .catch(emptyDocs)
      : emptyDocs(),
    visibility.articles
      ? payload
          .find({
            collection: 'articles',
            ...secureQuery,
            draft: true,
            depth: 0,
            limit: 5,
            sort: '-updatedAt',
          })
          .catch(emptyDocs)
      : emptyDocs(),
    visibility.newsEvents
      ? payload
          .find({
            collection: 'news-events',
            ...secureQuery,
            draft: true,
            depth: 0,
            limit: 5,
            sort: '-updatedAt',
          })
          .catch(emptyDocs)
      : emptyDocs(),
    visibility.reviews
      ? payload
          .find({
            collection: 'reviews',
            ...secureQuery,
            draft: true,
            depth: 0,
            limit: 5,
            sort: '-updatedAt',
          })
          .catch(emptyDocs)
      : emptyDocs(),
    visibility.formSubmissions
      ? payload
          .find({
            collection: 'form-submissions',
            ...secureQuery,
            depth: 0,
            limit: 5,
            sort: '-submittedAt',
          })
          .catch(emptyDocs)
      : emptyDocs(),
    loadDashboardOnboarding(payload, user, sections),
  ])

  const recentEdits: RecentItem[] = [
    ...recentPages.docs.map((doc) => ({
      collection: 'pages',
      id: String(doc.id),
      status: doc._status,
      title: String(doc.title ?? 'Untitled'),
      type: 'Page',
      updatedAt: String(doc.updatedAt),
    })),
    ...recentArticles.docs.map((doc) => ({
      collection: 'articles',
      id: String(doc.id),
      status: doc._status,
      title: String(doc.title ?? 'Untitled'),
      type: 'Article',
      updatedAt: String(doc.updatedAt),
    })),
    ...recentNews.docs.map((doc) => ({
      collection: 'news-events',
      id: String(doc.id),
      status: doc._status,
      title: String(doc.title ?? 'Untitled'),
      type: 'News & Event',
      updatedAt: String(doc.updatedAt),
    })),
    ...recentReviews.docs.map((doc) => ({
      collection: 'reviews',
      id: String(doc.id),
      status: doc._status,
      title: String(doc.title ?? 'Untitled'),
      type: 'Review',
      updatedAt: String(doc.updatedAt),
    })),
  ]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 6)

  const recentSubmissions = recentSubmissionsResult.docs
  const hasContent =
    visibility.pages || visibility.articles || visibility.newsEvents || visibility.reviews
  const hasAttention = visibility.reviews || visibility.formSubmissions || visibility.workQueue
  const quickActions = [
    { enabled: visibility.pages, href: '/admin/collections/pages/create', label: '+ New Page' },
    {
      enabled: visibility.articles,
      href: '/admin/collections/articles/create',
      label: '+ New Article',
    },
    {
      enabled: visibility.newsEvents,
      href: '/admin/collections/news-events/create',
      label: '+ New News / Event',
    },
    {
      enabled: visibility.reusableSections,
      href: '/admin/collections/reusable-sections/create',
      label: '+ New Reusable Section',
    },
    {
      enabled: visibility.media,
      href: '/admin/collections/media/create',
      label: '+ Upload Media',
    },
  ].filter(({ enabled }) => enabled)
  const setup = isAdmin(user) ? getSiteSetupDestination(user) : null
  if (setup) quickActions.push({ enabled: true, ...setup })
  const grantedFeatureKeys = isAdmin(user)
    ? []
    : getGrantedFeatureKeys(user).filter((key) => canOpenDashboardFeature(user, sections, key))
  const hasAssignedWorkspace = isAdmin(user) || grantedFeatureKeys.length > 0
  const hasDashboardModules = hasContent || hasAttention || quickActions.length > 0

  return (
    <div className="admin-dashboard-overview">
      <header className="admin-dashboard-overview__header">
        <h1>Dashboard</h1>
        <p>
          {isAdmin(user)
            ? 'Monitor publishing activity and open the tasks that need attention.'
            : 'Your dashboard shows only the website features assigned to your account.'}
        </p>
      </header>

      <DashboardGettingStarted key={user.id} task={onboarding} />

      {hasAssignedWorkspace && !hasDashboardModules ? (
        <section
          className="admin-dashboard-overview__assigned"
          aria-labelledby="dashboard-assigned-title"
        >
          <div>
            <h2 id="dashboard-assigned-title">
              {grantedFeatureKeys.length} {grantedFeatureKeys.length === 1 ? 'feature' : 'features'}{' '}
              assigned
            </h2>
            <p>
              Open a feature below or use the sidebar. Supporting read-only access stays hidden.
            </p>
          </div>
          <nav aria-label="Assigned website features">
            {grantedFeatureKeys.map((key) => (
              <a href={featureHref(key)} key={key}>
                {ADMIN_FEATURES[key].label}
              </a>
            ))}
          </nav>
        </section>
      ) : null}

      {hasAttention ? (
        <section aria-labelledby="dashboard-attention-title">
          <h2 className="admin-dashboard-overview__section-title" id="dashboard-attention-title">
            Needs Attention
          </h2>
          <div className="admin-dashboard-overview__attention-grid">
            {visibility.reviews ? (
              <AttentionCard
                alert
                href="/admin/collections/reviews?where[and][0][sourceSubmission][exists]=true&where[and][1][moderationStatus][equals]=pending"
                label="Reviews awaiting moderation"
                tone="success"
                value={pendingReviews.totalDocs}
              />
            ) : null}
            {visibility.formSubmissions ? (
              <AttentionCard
                alert
                href="/admin/collections/form-submissions"
                label="Open Submissions"
                tone="warning"
                value={openSubmissions.totalDocs}
              />
            ) : null}
            {visibility.workQueue ? (
              <AttentionCard
                alert
                href="/admin/collections/work-queue"
                label="Action Queue"
                tone="error"
                value={actionQueue.totalDocs}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {hasContent ? (
        <section aria-labelledby="dashboard-content-title">
          <h2 className="admin-dashboard-overview__section-title" id="dashboard-content-title">
            Content Overview
          </h2>
          <div className="admin-dashboard-overview__content-grid">
            {visibility.pages ? (
              <MiniStat
                href="/admin/collections/pages"
                label="Pages"
                value={pagesTotal.totalDocs}
              />
            ) : null}
            {visibility.articles ? (
              <MiniStat
                href="/admin/collections/articles"
                label="Articles"
                value={articlesTotal.totalDocs}
              />
            ) : null}
            {visibility.newsEvents ? (
              <MiniStat
                href="/admin/collections/news-events"
                label="News & Events"
                value={newsTotal.totalDocs}
              />
            ) : null}
            {visibility.reviews ? (
              <MiniStat
                href="/admin/collections/reviews"
                label="Reviews"
                value={reviewsTotal.totalDocs}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {quickActions.length > 0 ? (
        <section aria-labelledby="dashboard-actions-title">
          <h2 className="admin-dashboard-overview__section-title" id="dashboard-actions-title">
            Quick Actions
          </h2>
          <div className="admin-dashboard-overview__quick-actions">
            {quickActions.map(({ href, label }) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {recentEdits.length > 0 ? (
        <section aria-labelledby="dashboard-recent-title">
          <h2 className="admin-dashboard-overview__section-title" id="dashboard-recent-title">
            Recently Edited
          </h2>
          <div className="admin-dashboard-overview__recent-list">
            {recentEdits.map((item) => (
              <RecentEditRow item={item} key={`${item.collection}-${item.id}`} />
            ))}
          </div>
        </section>
      ) : null}

      {visibility.formSubmissions && recentSubmissions.length > 0 ? (
        <section aria-labelledby="dashboard-submissions-title">
          <h2 className="admin-dashboard-overview__section-title" id="dashboard-submissions-title">
            Recent Submissions
          </h2>
          <div className="admin-dashboard-overview__table-frame" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  {['From', 'Form Intent', 'Status', 'Submitted'].map((heading) => (
                    <th key={heading} scope="col">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <a href={`/admin/collections/form-submissions/${submission.id}`}>
                        {submission.submitterEmail ||
                          submission.submitterName ||
                          `#${submission.id}`}
                      </a>
                    </td>
                    <td>{submission.submissionIntent ?? '—'}</td>
                    <td>
                      <span
                        className="admin-dashboard-overview__submission-status"
                        data-status={submission.status ?? 'unknown'}
                      >
                        {submission.status ?? 'unknown'}
                      </span>
                    </td>
                    <td>
                      {submission.submittedAt
                        ? new Date(submission.submittedAt as string).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
