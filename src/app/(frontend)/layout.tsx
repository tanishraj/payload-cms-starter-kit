import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import '../../styles/globals.css'

import type { Metadata } from 'next'
import { AdminSessionBar } from '@/components/admin/AdminSessionBar'
import { GlobalAnnouncement } from '@/components/global/GlobalAnnouncement'
import { getCurrentCMSUser } from '@/lib/cmsSession'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { getRobotsMetadata } from '@/lib/seo'
import { getSiteURL } from '@/lib/siteUrl'

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
  return {
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
  const { pageSettings, themeSettings } = frontendGlobals

  const colorScheme = themeSettings.colorScheme ?? 'system'
  const rawThemeColor = String(themeSettings.themeColor ?? 'default')
  const savedThemeColor = rawThemeColor === 'amber' ? 'sera' : rawThemeColor
  const themeColor = validThemeColors.has(savedThemeColor) ? savedThemeColor : 'default'
  const announcementIntervalMs = pageSettings?.announcementEnabled
    ? (pageSettings as { announcementIntervalMs?: number | null }).announcementIntervalMs
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
            intervalMs={announcementIntervalMs}
            items={announcementItems}
            stickyTopOffset={cmsToolbarOffset}
          />
          <main data-site-main="true">{children}</main>
        </div>
      </body>
    </html>
  )
}
