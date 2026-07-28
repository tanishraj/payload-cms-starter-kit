import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import React from 'react'

import '../../styles/globals.css'

import type { Metadata } from 'next'
import { AdminSessionBar } from '@/components/admin/AdminSessionBar'
import { CookieConsentBanner } from '@/components/global/CookieConsentBanner'
import { SearchDialog } from '@/components/global/SearchDialog'
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
import type { Footer, Header, Page } from '@/payload-types'
import { CMS_CACHE_TAGS } from '@/hooks/revalidateCmsContent'

export const dynamic = 'force-dynamic'

const defaultSiteURL = getSiteURL()

const _getFrontendGlobals = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const [themeSettings, seoSettings, siteSettings, pageSettings, analyticsSettings] =
    await Promise.all([
      payload.findGlobal({ slug: 'theme-settings', depth: 0 }),
      payload.findGlobal({ slug: 'seo-settings', depth: 1 }),
      payload.findGlobal({ slug: 'site-settings', depth: 2 }),
      payload.findGlobal({ slug: 'page-settings', depth: 0 }),
      payload.findGlobal({ slug: 'analytics-settings', depth: 0 }),
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
    analyticsSettings,
    pageSettings,
    seoSettings,
    siteSettings,
    themeSettings,
  }
}

const getFrontendGlobals = unstable_cache(_getFrontendGlobals, ['frontend-globals'], {
  tags: [CMS_CACHE_TAGS.globals],
  revalidate: false,
})

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
  const cookieStore = await cookies()
  const analyticsConsent = cookieStore.get('analytics_consent')?.value
  const hasAnalyticsConsent = analyticsConsent === 'granted'

  const [frontendGlobals, currentUser] = await Promise.all([
    getFrontendGlobals(),
    getCurrentCMSUser(),
  ])
  const { activeFooter, activeHeader, analyticsSettings, pageSettings, siteSettings, themeSettings } =
    frontendGlobals


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
  const privacyPolicyUrl =
    privacyPolicyPage && typeof privacyPolicyPage === 'object' && 'slug' in privacyPolicyPage
      ? `/${(privacyPolicyPage as Page).slug}`
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
      <head>
        {/* Google Tag Manager — only injected after analytics consent */}
        {hasAnalyticsConsent && analyticsSettings?.gtmEnabled && analyticsSettings.gtmContainerId ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analyticsSettings.gtmContainerId}');`,
            }}
          />
        ) : null}
        {/* GA4 standalone — only when GTM is off and consent is granted */}
        {hasAnalyticsConsent && !analyticsSettings?.gtmEnabled && analyticsSettings?.ga4Enabled && analyticsSettings.ga4MeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsSettings.ga4MeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analyticsSettings.ga4MeasurementId}');`,
              }}
            />
          </>
        ) : null}
        {/* RSS feed autodiscovery */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteSettings.siteName} — Articles`}
          href="/articles/feed.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteSettings.siteName} — News & Events`}
          href="/news-events/feed.xml"
        />
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteSettings.siteName,
              description: siteSettings.siteDescription || undefined,
              url: defaultSiteURL,
              logo: getMediaAbsoluteUrl(siteSettings.logo) || undefined,
              email: siteSettings.contactEmail || undefined,
              telephone: siteSettings.contactPhone || undefined,
              address: siteSettings.address
                ? { '@type': 'PostalAddress', streetAddress: siteSettings.address }
                : undefined,
            }).replace(/</g, '\\u003c'),
          }}
        />
        {/* WebSite JSON-LD with SearchAction — enables Google Sitelinks search box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteSettings.siteName,
              url: defaultSiteURL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${defaultSiteURL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className={pageBodyClassName}>
        {/* Skip navigation — visually hidden until focused */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring focus:outline-none"
        >
          Skip to main content
        </a>
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
          <main id="main-content" data-site-main="true">{children}</main>
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
        <CookieConsentBanner privacyPolicyUrl={privacyPolicyUrl} />
        <SearchDialog />
      </body>
    </html>
  )
}
