import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ImageResponse } from 'next/og'

import { getMediaAbsoluteUrl } from '@/lib/media'

export const alt = 'News & Events preview'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

type Props = { params: Promise<{ slug: string }> }

export default async function NewsEventOgImage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const [result, siteSettings] = await Promise.all([
    payload.find({
      collection: 'news-events',
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug }, _status: { equals: 'published' } },
    }),
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
  ])

  const entry = result.docs[0]
  const title = entry?.title ?? 'News & Events'
  const excerpt = entry?.excerpt ?? ''
  const contentType_ = entry?.contentType === 'event' ? 'Event' : 'News'
  const siteName = siteSettings.siteName
  const logoUrl = getMediaAbsoluteUrl(siteSettings.logo)

  const accentColor = entry?.contentType === 'event' ? '#7c3aed' : '#2563eb'

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0f0f12 0%, #16161e 100%)',
        width: '100%',
        height: '100%',
        padding: '72px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={siteName} style={{ height: 32, maxWidth: 160, objectFit: 'contain' }} />
        ) : (
          <span style={{ color: '#6b7280', fontSize: 16, letterSpacing: '0.05em' }}>{siteName}</span>
        )}
        <span style={{ color: '#374151', fontSize: 16 }}>·</span>
        <span
          style={{
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            background: accentColor,
            padding: '3px 10px',
            borderRadius: '99px',
            letterSpacing: '0.04em',
          }}
        >
          {contentType_}
        </span>
      </div>

      {/* Title + excerpt */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            fontSize: title.length > 60 ? 44 : 56,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: 900,
          }}
        >
          {title.length > 100 ? `${title.slice(0, 97)}…` : title}
        </div>
        {excerpt ? (
          <div style={{ fontSize: 22, color: '#9ca3af', lineHeight: 1.5, maxWidth: 760 }}>
            {excerpt.length > 120 ? `${excerpt.slice(0, 117)}…` : excerpt}
          </div>
        ) : null}
      </div>

      <div />
    </div>,
    { ...size },
  )
}
