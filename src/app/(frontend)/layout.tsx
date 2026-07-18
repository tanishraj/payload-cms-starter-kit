import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import '../../styles/globals.css'

import type { Metadata } from 'next'
import { AdminSessionBar } from '@/components/admin/AdminSessionBar'
import { GlobalAnnouncement } from '@/components/global/GlobalAnnouncement'
import { GlobalFooter } from '@/components/global/GlobalFooter'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import {
  type BlockAppearance,
  resolveBlockAppearanceClasses,
} from '@/blocks/shared/blockAppearance'
import { getCurrentCMSUser } from '@/lib/cmsSession'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { getRobotsMetadata } from '@/lib/seo'
import { getSiteURL } from '@/lib/siteUrl'
import { defaultWebsiteTheme, isWebsiteTheme } from '@/lib/themes/websiteThemes'
import type { Footer, Header } from '@/payload-types'

export const dynamic = 'force-dynamic'

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
      depth: 2,
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
  const activeFooterID =
    typeof pageSettings?.activeFooter === 'string' || typeof pageSettings?.activeFooter === 'number'
      ? pageSettings.activeFooter
      : typeof pageSettings?.activeFooter === 'object' && pageSettings.activeFooter !== null
        ? pageSettings.activeFooter.id
        : null

  const activeFooterResult =
    activeFooterID == null
      ? null
      : await payload.find({
          collection: 'footers',
          where: {
            and: [
              {
                id: {
                  equals: activeFooterID,
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

  const activeFooter = (activeFooterResult?.docs[0] ?? null) as Footer | null

  return {
    activeFooter,
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
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
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
  const { activeFooter, activeHeader, pageSettings, siteSettings, themeSettings } = frontendGlobals

  const colorScheme = themeSettings.colorScheme ?? 'system'
  const rawThemeColor = String(themeSettings.themeColor ?? defaultWebsiteTheme)
  const savedThemeColor = rawThemeColor === 'amber' ? 'sera' : rawThemeColor
  const themeColor = isWebsiteTheme(savedThemeColor) ? savedThemeColor : defaultWebsiteTheme
  const announcementSettings = pageSettings?.announcementEnabled ? pageSettings : null
  const announcementDisplayMode = announcementSettings?.announcementDisplayMode
  const announcementAppearance = announcementSettings?.announcementAppearance
  const announcementIntervalMs = announcementSettings?.announcementIntervalMs
  const announcementLabel = announcementSettings?.announcementLabel
  const announcementMarqueeDurationMs = announcementSettings?.announcementMarqueeDurationMs
  const announcementItems = announcementSettings?.announcementItems
  const announcementDismissible = announcementSettings?.announcementDismissible
  const announcementHideOnScroll = announcementSettings?.announcementHideOnScroll
  const pageAppearance = pageSettings?.pageAppearance as BlockAppearance | null | undefined
  const privacyPolicyPage =
    typeof siteSettings.privacyPolicyPage === 'object' && siteSettings.privacyPolicyPage !== null
      ? siteSettings.privacyPolicyPage
      : null
  const termsAndConditionsPage =
    typeof siteSettings.termsAndConditionsPage === 'object' &&
    siteSettings.termsAndConditionsPage !== null
      ? siteSettings.termsAndConditionsPage
      : null
  const htmlClassName = colorScheme === 'dark' ? 'dark' : undefined
  const htmlStyle =
    colorScheme === 'system'
      ? ({ colorScheme: 'light dark' } as React.CSSProperties)
      : ({ colorScheme } as React.CSSProperties)
  const { className: pageBodyClassName } = resolveBlockAppearanceClasses(pageAppearance)
  const cmsToolbarOffset = currentUser ? '3rem' : '0px'
  // Only a persistent (non-hide-on-scroll) announcement reserves space below it;
  // the bar collapses --global-announcement-height to 0 when dismissed. The
  // fallback keeps the correct offset during SSR and before hydration.
  const headerReservesAnnouncement = Boolean(announcementItems?.length) && !announcementHideOnScroll
  const headerTopOffset = `calc(${cmsToolbarOffset} + var(--global-announcement-height, ${headerReservesAnnouncement ? '2.5rem' : '0px'}))`
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
      <body className={pageBodyClassName}>
        <AdminSessionBar user={currentUser} />
        <div style={contentShellStyle}>
          <GlobalAnnouncement
            displayMode={announcementDisplayMode}
            appearance={announcementAppearance}
            intervalMs={announcementIntervalMs}
            items={announcementItems}
            label={announcementLabel}
            marqueeDurationMs={announcementMarqueeDurationMs}
            stickyTopOffset={cmsToolbarOffset}
            dismissible={announcementDismissible}
            hideOnScroll={announcementHideOnScroll}
          />
          <GlobalHeader
            header={activeHeader}
            siteLogo={siteSettings.logo}
            siteName={siteSettings.siteName}
            stickyTopOffset={headerTopOffset}
          />
          <main data-site-main="true">{children}</main>
          <GlobalFooter
            footer={activeFooter}
            privacyPolicyPage={privacyPolicyPage}
            termsAndConditionsPage={termsAndConditionsPage}
            siteAddress={siteSettings.address}
            siteEmail={siteSettings.contactEmail}
            siteLogo={siteSettings.logo}
            siteName={siteSettings.siteName}
            sitePhone={siteSettings.contactPhone}
            siteSocialLinks={siteSettings.socialLinks}
          />
        </div>
      </body>
    </html>
  )
}
