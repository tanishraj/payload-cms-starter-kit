import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Users } from './collections/Users'
import { Footers } from './collections/Footers'
import { FormSubmissions } from './collections/FormSubmissions'
import { Forms } from './collections/Forms'
import { GalleryAlbums } from './collections/GalleryAlbums'
import { Media } from './collections/Media'
import { NavigationLinks } from './collections/NavigationLinks'
import { NewsEvents } from './collections/NewsEvents'
import { Pages } from './collections/Pages'
import { Redirects } from './collections/Redirects'
import { Reviews } from './collections/Reviews'
import { Tags } from './collections/Tags'
import { Headers } from './collections/Headers'
import { OperationalAuditEvents } from './collections/OperationalAuditEvents'
import { WorkQueue } from './collections/WorkQueue'
import { SystemPages } from './collections/SystemPages'
import { createDatabaseAdapter, createEmailAdapter, createStoragePlugins } from './config/providers'
import { assertSupportedStarterContract, getStarterContract } from './config/starterContract'
import { getRuntimeConfig } from './config/runtime'
import { PageSettings } from './globals/PageSettings'
import { SEOSettings } from './globals/SEOSettings'
import { SiteSettings } from './globals/SiteSettings'
import { SystemModeSettings } from './globals/SystemModeSettings'
import { ThemeSettings } from './globals/ThemeSettings'
import { NewsEventsSettings } from './globals/NewsEventsSettings'
import { withTrash } from './plugins/withTrash'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const runtimeConfig = getRuntimeConfig()
const starterContract = getStarterContract(runtimeConfig)
assertSupportedStarterContract(starterContract)
const email = createEmailAdapter(runtimeConfig)
const storagePlugins = createStoragePlugins(runtimeConfig)

if (runtimeConfig.deployment.isProduction && !email && runtimeConfig.email.provider === 'resend') {
  throw new Error('Missing production email configuration.')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Pages,
    Categories,
    Tags,
    Articles,
    NewsEvents,
    Reviews,
    NavigationLinks,
    Redirects,
    Headers,
    Footers,
    SystemPages,
    Forms,
    FormSubmissions,
    Media,
    GalleryAlbums,
    OperationalAuditEvents,
    WorkQueue,
    Users,
  ],
  globals: [
    PageSettings,
    NewsEventsSettings,
    SystemModeSettings,
    SiteSettings,
    ThemeSettings,
    SEOSettings,
  ],
  editor: lexicalEditor(),
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: createDatabaseAdapter(runtimeConfig),
  sharp,
  plugins: [...storagePlugins, withTrash()],
})
