import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { resendAdapter } from '@payloadcms/email-resend'
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
import { PageSettings } from './globals/PageSettings'
import { SEOSettings } from './globals/SEOSettings'
import { SiteSettings } from './globals/SiteSettings'
import { ThemeSettings } from './globals/ThemeSettings'
import { withTrash } from './plugins/withTrash'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isProduction = process.env.NODE_ENV === 'production'
const resendAPIKey = process.env.RESEND_API_KEY
const resendFromAddress = process.env.RESEND_FROM_EMAIL
const resendFromName = process.env.RESEND_FROM_NAME || 'Website'

if (isProduction && (!resendAPIKey || !resendFromAddress)) {
  throw new Error(
    'Missing Resend email configuration. Set RESEND_API_KEY and RESEND_FROM_EMAIL in production.',
  )
}

const email =
  resendAPIKey && resendFromAddress
    ? resendAdapter({
        apiKey: resendAPIKey,
        defaultFromAddress: resendFromAddress,
        defaultFromName: resendFromName,
        overrideRecipientAddress: process.env.RESEND_OVERRIDE_TO_EMAIL || undefined,
      })
    : undefined

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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [withTrash()],
})
