import config from '@/payload.config'
import { getPayload } from 'payload'

export async function getPayloadClient() {
  const payloadConfig = await config

  return getPayload({ config: payloadConfig })
}

export async function getAdminPath() {
  const payloadConfig = await config

  return payloadConfig.routes.admin
}
