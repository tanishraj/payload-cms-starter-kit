import { canDeliverPasswordRecovery } from './lib/accountRecovery'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Users } from './collections/Users'
import { TwoFactorCredentials } from './collections/TwoFactorCredentials'
import { Footers } from './collections/Footers'
import { FormSubmissions } from './collections/FormSubmissions'
import { Forms } from './collections/Forms'
import { FormAttachments } from './collections/FormAttachments'
import { GalleryAlbums } from './collections/GalleryAlbums'
import { Media } from './collections/Media'
import { NavigationLinks } from './collections/NavigationLinks'
import { NewsEventClassifications } from './collections/NewsEventClassifications'
import { NewsEvents } from './collections/NewsEvents'
import { Pages } from './collections/Pages'
import { Redirects } from './collections/Redirects'
import { Reviews } from './collections/Reviews'
import { Tags } from './collections/Tags'
import { Headers } from './collections/Headers'
import { OfficeLocations } from './collections/OfficeLocations'
import { OperationalAuditEvents } from './collections/OperationalAuditEvents'
import { WorkQueue } from './collections/WorkQueue'
import { SystemPages } from './collections/SystemPages'
import { createDatabaseAdapter, createEmailAdapter, createStoragePlugins } from './config/providers'
import { assertSupportedStarterContract, getStarterContract } from './config/starterContract'
import { runtimeConfig } from './config/runtime.server'
import { payloadUploadConfig } from './config/uploadLimits'
import { projectEditor } from './fields/bodyEditorConfig'
import { PageSettings } from './globals/PageSettings'
import { NewsEventsDetailTemplate } from './globals/NewsEventsDetailTemplate'
import { SEOSettings } from './globals/SEOSettings'
import { SiteSettings } from './globals/SiteSettings'
import { SystemModeSettings } from './globals/SystemModeSettings'
import { ThemeSettings } from './globals/ThemeSettings'
import { AnalyticsSettings } from './globals/AnalyticsSettings'
import { CookieConsentSettings } from './globals/CookieConsentSettings'
import { SearchSettings } from './globals/SearchSettings'
import { ReusableSections } from './collections/ReusableSections'
import { withFeatureDeletionAudit } from './plugins/withFeatureDeletionAudit'
import { withTrash } from './plugins/withTrash'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const starterContract = getStarterContract(runtimeConfig)
assertSupportedStarterContract(starterContract)
const email = createEmailAdapter(runtimeConfig)
const storagePlugins = createStoragePlugins(runtimeConfig)
const s3ClientUploadHandlerPath = '@payloadcms/storage-s3/client#S3ClientUploadHandler'

if (runtimeConfig.deployment.isProduction && !email && runtimeConfig.email.provider === 'resend') {
  throw new Error('Missing production email configuration.')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    dependencies: {
      [s3ClientUploadHandlerPath]: {
        path: s3ClientUploadHandlerPath,
        type: 'function',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: '@/components/admin/DashboardView#DashboardView',
        },
        login: {
          Component: '@/components/admin/TwoFactorLoginView#TwoFactorLoginView',
          path: '/login',
        },
        ...(!canDeliverPasswordRecovery(runtimeConfig.email)
          ? {
              forgot: {
                Component: '@/components/admin/TwoFactorLoginView#TwoFactorLoginView',
                path: '/forgot' as const,
              },
            }
          : {}),
      },
    },
  },
  collections: [
    // Content
    Pages,
    Articles,
    NewsEvents,
    NewsEventClassifications,
    Reviews,
    ReusableSections,
    // Taxonomy
    Categories,
    Tags,
    // Navigation
    NavigationLinks,
    Headers,
    Footers,
    OfficeLocations,
    Redirects,
    SystemPages,
    // Media
    Media,
    GalleryAlbums,
    // Forms
    Forms,
    FormSubmissions,
    FormAttachments,
    // Administration
    WorkQueue,
    OperationalAuditEvents,
    Users,
    TwoFactorCredentials,
  ],
  globals: [
    // Settings (frequently adjusted)
    SiteSettings,
    ThemeSettings,
    SEOSettings,
    AnalyticsSettings,
    CookieConsentSettings,
    // Configuration (set-and-forget)
    PageSettings,
    NewsEventsDetailTemplate,
    SearchSettings,
    SystemModeSettings,
  ],
  editor: projectEditor,
  email,
  graphQL: {
    disable: true,
  },
  cors: [runtimeConfig.application.origin],
  csrf: [runtimeConfig.application.origin],
  // Existing Page previews request depth 8 and the page-path redirect hook requests depth 10.
  maxDepth: 10,
  serverURL: runtimeConfig.application.origin,
  secret: runtimeConfig.payload.secret,
  upload: payloadUploadConfig,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: createDatabaseAdapter(runtimeConfig),
  sharp,
  plugins: [
    ...storagePlugins,
    withTrash({
      exclude: [NewsEventClassifications.slug],
    }),
    withFeatureDeletionAudit(),
  ],
})
