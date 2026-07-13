import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import '../../styles/globals.css'

import type { Metadata } from 'next'
import { AdminSessionBar } from '@/components/admin/AdminSessionBar'
import { GlobalAnnouncement } from '@/components/global/GlobalAnnouncement'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import { getCurrentCMSUser } from '@/lib/cmsSession'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { getRobotsMetadata } from '@/lib/seo'
import { getSiteURL } from '@/lib/siteUrl'
import type { Header } from '@/payload-types'

export const dynamic = 'force-dynamic'

const validThemeColors = new Set(['default', 'blue', 'sera'])
const defaultSiteURL = getSiteURL()

const getFrontendGlobals = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const [themeSettings, seoSettings, siteSettings, pageSettings] = await Promise.all([
    payload.findGlobal({
      slug: 'theme-settings',
      depth: 0,
    }),
    payload.findGlobal({
      slug: 'seo-settings',
      depth: 1,
    }),
    payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    }),
    payload.findGlobal({
      slug: 'page-settings',
      depth: 0,
    }),
  ])

  const activeHeaderID =
    typeof pageSettings?.activeHeader === 'string' || typeof pageSettings?.activeHeader === 'number'
      ? pageSettings.activeHeader
      : typeof pageSettings?.activeHeader === 'object' && pageSettings.activeHeader !== null
        ? pageSettings.activeHeader.id
        : null

  const activeHeaderResult =
    activeHeaderID == null
      ? null
      : await payload.find({
          collection: 'headers',
          where: {
            and: [
              {
                id: {
                  equals: activeHeaderID,
                },
              },
              {
                _status: {
                  equals: 'published',
                },
              },
            ],
          },
          depth: 2,
          limit: 1,
        })

  const activeHeader = (activeHeaderResult?.docs[0] ?? null) as Header | null

  return {
    activeHeader,
    pageSettings,
    seoSettings,
    siteSettings,
    themeSettings,
  }
}

const defaultSiteTitle = 'Payload Blank Template'
const defaultSiteDescription = 'A blank template using Payload in a Next.js app.'

export async function generateMetadata(): Promise<Metadata> {
  const { seoSettings, siteSettings } = await getFrontendGlobals()
  const defaultTitle = seoSettings.defaultTitle || defaultSiteTitle
  const title = seoSettings.titleTemplate
    ? {
        default: defaultTitle,
        template: seoSettings.titleTemplate,
      }
    : defaultTitle
  const defaultImageUrl = getMediaAbsoluteUrl(seoSettings.defaultImage)
  const faviconUrl = getMediaAbsoluteUrl(siteSettings.favicon)

  return {
    metadataBase: new URL(defaultSiteURL),
    title,
    description: seoSettings.defaultDescription || defaultSiteDescription,
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
    openGraph: defaultImageUrl
      ? {
          images: [
            {
              url: defaultImageUrl,
            },
          ],
        }
      : undefined,
    robots: getRobotsMetadata(seoSettings.robots),
    twitter: defaultImageUrl
      ? {
          card: 'summary_large_image',
          images: [defaultImageUrl],
        }
      : undefined,
    verification: {
      google: seoSettings.googleSiteVerification || undefined,
    },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const [frontendGlobals, currentUser] = await Promise.all([
    getFrontendGlobals(),
    getCurrentCMSUser(),
  ])
  const { activeHeader, pageSettings, siteSettings, themeSettings } = frontendGlobals

  const colorScheme = themeSettings.colorScheme ?? 'system'
  const rawThemeColor = String(themeSettings.themeColor ?? 'default')
  const savedThemeColor = rawThemeColor === 'amber' ? 'sera' : rawThemeColor
  const themeColor = validThemeColors.has(savedThemeColor) ? savedThemeColor : 'default'
  const announcementDisplayMode = pageSettings?.announcementEnabled
    ? (pageSettings as {
        announcementDisplayMode?: 'horizontal' | 'marquee' | 'vertical' | null
      }).announcementDisplayMode
    : null
  const announcementIntervalMs = pageSettings?.announcementEnabled
    ? (pageSettings as { announcementIntervalMs?: number | null }).announcementIntervalMs
    : null
  const announcementLabel = pageSettings?.announcementEnabled
    ? (pageSettings as { announcementLabel?: string | null }).announcementLabel
    : null
  const announcementMarqueeDurationMs = pageSettings?.announcementEnabled
    ? (pageSettings as { announcementMarqueeDurationMs?: number | null }).announcementMarqueeDurationMs
    : null
  const announcementItems = pageSettings?.announcementEnabled
    ? (pageSettings as {
        announcementItems?: Array<{ title?: string | null; description?: string | null; url?: string | null }> | null
      })
        .announcementItems
    : null
  const htmlClassName = colorScheme === 'dark' ? 'dark' : undefined
  const htmlStyle =
    colorScheme === 'system'
      ? ({ colorScheme: 'light dark' } as React.CSSProperties)
      : ({ colorScheme } as React.CSSProperties)
  const cmsToolbarOffset = currentUser ? '3rem' : '0px'
  const headerTopOffset = `calc(${cmsToolbarOffset} + ${announcementItems?.length ? '3rem' : '0px'})`
  const contentShellStyle = { paddingTop: cmsToolbarOffset } as React.CSSProperties

  return (
    <html
      lang="en"
      className={htmlClassName}
      data-color-scheme={colorScheme}
      data-theme-color={themeColor}
      style={htmlStyle}
      suppressHydrationWarning
    >
      <head />
      <body>
        <AdminSessionBar user={currentUser} />
        <div style={contentShellStyle}>
          <GlobalAnnouncement
            displayMode={announcementDisplayMode}
            intervalMs={announcementIntervalMs}
            items={announcementItems}
            label={announcementLabel}
            marqueeDurationMs={announcementMarqueeDurationMs}
            stickyTopOffset={cmsToolbarOffset}
          />
          <GlobalHeader
            header={activeHeader}
            siteLogo={siteSettings.logo}
            siteName={siteSettings.siteName}
            stickyTopOffset={headerTopOffset}
          />
          <main data-site-main="true">{children}</main>
        </div>
      </body>
    </html>
  )
}
