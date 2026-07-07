import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Footers } from './collections/Footers'
import { FormSubmissions } from './collections/FormSubmissions'
import { Forms } from './collections/Forms'
import { Media } from './collections/Media'
import { NavigationLinks } from './collections/NavigationLinks'
import { Pages } from './collections/Pages'
import { Redirects } from './collections/Redirects'
import { Headers } from './collections/Headers'
import { SystemPages } from './collections/SystemPages'
import { createDatabaseAdapter, createEmailAdapter } from './config/providers'
import { getRuntimeConfig } from './config/runtime'
import { PageSettings } from './globals/PageSettings'
import { SEOSettings } from './globals/SEOSettings'
import { SiteSettings } from './globals/SiteSettings'
import { ThemeSettings } from './globals/ThemeSettings'
import { withTrash } from './plugins/withTrash'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const runtimeConfig = getRuntimeConfig()
const email = createEmailAdapter(runtimeConfig)

if (process.env.NODE_ENV === 'production' && !email) {
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
    NavigationLinks,
    Redirects,
    Headers,
    Footers,
    SystemPages,
    Forms,
    FormSubmissions,
    Media,
    Users,
  ],
  globals: [PageSettings, SiteSettings, ThemeSettings, SEOSettings],
  editor: lexicalEditor(),
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: createDatabaseAdapter(runtimeConfig),
  sharp,
  plugins: [withTrash()],
})
