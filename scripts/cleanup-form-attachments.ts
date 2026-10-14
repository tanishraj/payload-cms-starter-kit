import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { cleanupFormAttachments } from '../src/lib/formAttachments.server'
const payload = await getPayload({ config })
try {
  const result = await cleanupFormAttachments(payload)
  console.log(JSON.stringify(result))
  if (result.failed) process.exitCode = 1
} finally {
  await payload.destroy()
}
