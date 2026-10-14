export type FormAttachmentStorageConfig =
  | { provider: 'disabled' }
  | { provider: 'localDisk' }
  | {
      provider: 's3'
      bucket: string
      endpoint: string
      region: string
      accessKeyId: string
      secretAccessKey: string
      forcePathStyle: boolean
    }

/** Independent private bucket/credentials. Never inherit public Media URLs or ACLs. */
export function getFormAttachmentStorageConfig(
  env: NodeJS.ProcessEnv,
): FormAttachmentStorageConfig {
  const provider =
    env.FORM_ATTACHMENTS_PROVIDER?.trim() ||
    (env.NODE_ENV === 'production' ? 'disabled' : 'localDisk')
  if (provider === 'disabled') return { provider }
  if (provider === 'localDisk') {
    if (env.NODE_ENV === 'production')
      throw new Error(
        'Production form attachments require a private S3 bucket. Use FORM_ATTACHMENTS_PROVIDER=s3 or disabled.',
      )
    return { provider }
  }
  if (provider !== 's3')
    throw new Error('Unsupported FORM_ATTACHMENTS_PROVIDER. Use disabled, localDisk or s3.')
  const bucket = env.FORM_ATTACHMENTS_S3_BUCKET?.trim() || ''
  const endpoint = env.FORM_ATTACHMENTS_S3_ENDPOINT?.trim() || ''
  const region = env.FORM_ATTACHMENTS_S3_REGION?.trim() || ''
  const accessKeyId = env.FORM_ATTACHMENTS_S3_ACCESS_KEY_ID?.trim() || ''
  const secretAccessKey = env.FORM_ATTACHMENTS_S3_SECRET_ACCESS_KEY?.trim() || ''
  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey)
    throw new Error(
      'Incomplete private form attachment S3 configuration. Set all FORM_ATTACHMENTS_S3_* credentials, bucket, region and endpoint.',
    )
  if (bucket === env.S3_BUCKET?.trim())
    throw new Error('Form attachments must use a separate private bucket from public Media.')
  const url = new URL(endpoint)
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' &&
      !(
        env.NODE_ENV !== 'production' &&
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      ))
  )
    throw new Error(
      'Private attachment S3 endpoint must use HTTPS (loopback HTTP is allowed for development).',
    )
  const pathStyle = env.FORM_ATTACHMENTS_S3_FORCE_PATH_STYLE?.trim().toLowerCase() || 'true'
  if (!['true', 'false'].includes(pathStyle))
    throw new Error('FORM_ATTACHMENTS_S3_FORCE_PATH_STYLE must be true or false.')
  return {
    provider: 's3',
    bucket,
    endpoint: url.toString(),
    region,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: pathStyle === 'true',
  }
}
