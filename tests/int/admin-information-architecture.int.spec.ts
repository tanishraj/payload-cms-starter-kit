import { describe, expect, it } from 'vitest'

import { Articles } from '@/collections/Articles'
import { Categories } from '@/collections/Categories'
import { Footers } from '@/collections/Footers'
import { FormSubmissions } from '@/collections/FormSubmissions'
import { Forms } from '@/collections/Forms'
import { GalleryAlbums } from '@/collections/GalleryAlbums'
import { Headers } from '@/collections/Headers'
import { Media } from '@/collections/Media'
import { NavigationLinks } from '@/collections/NavigationLinks'
import { NewsEvents } from '@/collections/NewsEvents'
import { OfficeLocations } from '@/collections/OfficeLocations'
import { OperationalAuditEvents } from '@/collections/OperationalAuditEvents'
import { Pages } from '@/collections/Pages'
import { Redirects } from '@/collections/Redirects'
import { ReusableSections } from '@/collections/ReusableSections'
import { Reviews } from '@/collections/Reviews'
import { SystemPages } from '@/collections/SystemPages'
import { Tags } from '@/collections/Tags'
import { Users } from '@/collections/Users'
import { WorkQueue } from '@/collections/WorkQueue'
import { AnalyticsSettings } from '@/globals/AnalyticsSettings'
import { CookieConsentSettings } from '@/globals/CookieConsentSettings'
import { NewsEventsSettings } from '@/globals/NewsEventsSettings'
import { PageSettings } from '@/globals/PageSettings'
import { SEOSettings } from '@/globals/SEOSettings'
import { SiteSettings } from '@/globals/SiteSettings'
import { SystemModeSettings } from '@/globals/SystemModeSettings'
import { ThemeSettings } from '@/globals/ThemeSettings'

describe('admin information architecture', () => {
  it('assigns the documented groups and operator-facing labels', () => {
    for (const collection of [Pages, Articles, NewsEvents, Reviews, ReusableSections]) {
      expect(collection.admin?.group).toBe('Content')
    }
    expect(Categories.admin?.group).toBe('Taxonomy')
    expect(Categories.labels?.plural).toBe('Topics')
    expect(Tags.admin?.group).toBe('Taxonomy')
    expect(NavigationLinks.admin?.group).toBe('Navigation')
    expect(Redirects.admin?.group).toBe('Navigation')
    for (const collection of [Headers, Footers, OfficeLocations, SystemPages]) {
      expect(collection.admin?.group).toBe('Site Structure')
    }
    expect(Media.admin?.group).toBe('Media')
    expect(GalleryAlbums.admin?.group).toBe('Media')
    expect(Forms.admin?.group).toBe('Forms')
    expect(FormSubmissions.admin?.group).toBe('Forms')
    for (const collection of [Users, WorkQueue, OperationalAuditEvents]) {
      expect(collection.admin?.group).toBe('Administration')
    }

    expect(PageSettings.label).toBe('Layout Defaults')
    expect(NewsEventsSettings.label).toBe('News & Events Settings')
    expect(SystemModeSettings.label).toBe('Maintenance & Modes')
    for (const global of [PageSettings, NewsEventsSettings, SystemModeSettings]) {
      expect(global.admin?.group).toBe('Configuration')
    }

    expect(SiteSettings.label).toBe('Site Identity')
    expect(ThemeSettings.label).toBe('Appearance')
    expect(SEOSettings.label).toBe('SEO & Metadata')
    expect(AnalyticsSettings.label).toBe('Analytics & Tracking')
    expect(CookieConsentSettings.label).toBe('Cookie Consent Banner')
    for (const global of [
      SiteSettings,
      ThemeSettings,
      SEOSettings,
      AnalyticsSettings,
      CookieConsentSettings,
    ]) {
      expect(global.admin?.group).toBe('Settings')
    }

    expect(WorkQueue.labels?.plural).toBe('Action Queue')
    expect(OperationalAuditEvents.labels?.plural).toBe('Audit Log')
  })
})
