import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import '../../styles/globals.css'

import type { Metadata } from 'next'
import { AdminSessionBar } from '@/components/admin/AdminSessionBar'
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

  const [themeSettings, seoSettings, siteSettings] = await Promise.all([
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
  ])
  return {
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
  const { themeSettings } = frontendGlobals

  const colorScheme = themeSettings.colorScheme ?? 'system'
  const rawThemeColor = String(themeSettings.themeColor ?? 'default')
  const savedThemeColor = rawThemeColor === 'amber' ? 'sera' : rawThemeColor
  const themeColor = validThemeColors.has(savedThemeColor) ? savedThemeColor : 'default'
  const htmlClassName = colorScheme === 'dark' ? 'dark' : undefined
  const htmlStyle =
    colorScheme === 'system'
      ? ({ colorScheme: 'light dark' } as React.CSSProperties)
      : ({ colorScheme } as React.CSSProperties)
  const cmsToolbarOffset = currentUser ? '2.5rem' : '0px'
  const bodyStyle = {
    '--cms-toolbar-offset': cmsToolbarOffset,
  } as React.CSSProperties
  const mainStyle = { paddingTop: cmsToolbarOffset } as React.CSSProperties

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
      <body style={bodyStyle}>
        <AdminSessionBar user={currentUser} />
        <main
          data-site-main="true"
          style={mainStyle}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
