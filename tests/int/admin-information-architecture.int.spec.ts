import { describe, expect, it } from 'vitest'

import { Articles } from '@/collections/Articles'
import { Categories } from '@/collections/Categories'
import { Footers } from '@/collections/Footers'
import { FormSubmissions } from '@/collections/FormSubmissions'
import { Forms } from '@/collections/Forms'
import { Headers } from '@/collections/Headers'
import { Media } from '@/collections/Media'
import { NavigationLinks } from '@/collections/NavigationLinks'
import { OperationalAuditEvents } from '@/collections/OperationalAuditEvents'
import { Pages } from '@/collections/Pages'
import { Redirects } from '@/collections/Redirects'
import { Reviews } from '@/collections/Reviews'
import { SystemPages } from '@/collections/SystemPages'
import { Tags } from '@/collections/Tags'
import { Users } from '@/collections/Users'
import { WorkQueue } from '@/collections/WorkQueue'
import { PageSettings } from '@/globals/PageSettings'
import { SEOSettings } from '@/globals/SEOSettings'
import { SiteSettings } from '@/globals/SiteSettings'
import { SystemModeSettings } from '@/globals/SystemModeSettings'
import { ThemeSettings } from '@/globals/ThemeSettings'

describe('admin information architecture', () => {
  it('assigns the approved groups and operator-facing labels', () => {
    expect(Pages.admin?.group).toBe('Website Content')
    expect(Categories.admin?.group).toBe('Website Content')
    expect(Tags.admin?.group).toBe('Website Content')
    expect(Articles.admin?.group).toBe('Website Content')
    expect(Reviews.admin?.group).toBe('Website Content')
    expect(Media.admin?.group).toBe('Website Content')

    expect(NavigationLinks.admin?.group).toBe('Website Structure')
    expect(NavigationLinks.labels?.singular).toBe('Navigation Link')
    expect(NavigationLinks.labels?.plural).toBe('Navigation Links')
    expect(Redirects.admin?.group).toBe('Website Structure')
    expect(Headers.admin?.group).toBe('Website Structure')
    expect(Footers.admin?.group).toBe('Website Structure')
    expect(SystemPages.admin?.group).toBe('Website Structure')

    expect(Forms.admin?.group).toBe('Lead Capture')
    expect(FormSubmissions.admin?.group).toBe('Lead Capture')

    expect(PageSettings.label).toBe('Website Defaults')
    expect(PageSettings.admin?.group).toBe('Site Settings')
    expect(SiteSettings.admin?.group).toBe('Site Settings')
    expect(ThemeSettings.admin?.group).toBe('Site Settings')
    expect(SEOSettings.admin?.group).toBe('Site Settings')
    expect(SystemModeSettings.label).toBe('Website Modes')
    expect(SystemModeSettings.admin?.group).toBe('Site Settings')

    expect(Users.admin?.group).toBe('Operations')
    expect(WorkQueue.labels?.singular).toBe('Action Queue Item')
    expect(WorkQueue.labels?.plural).toBe('Action Queue')
    expect(WorkQueue.admin?.group).toBe('Operations')
    expect(OperationalAuditEvents.labels?.singular).toBe('Activity Log Entry')
    expect(OperationalAuditEvents.labels?.plural).toBe('Activity Log')
    expect(OperationalAuditEvents.admin?.group).toBe('Operations')
  })
})
