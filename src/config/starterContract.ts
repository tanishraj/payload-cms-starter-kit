import type { RuntimeConfig } from './runtime'

export type StarterContract = {
  application: RuntimeConfig['application']
  auth: RuntimeConfig['auth']
  database: RuntimeConfig['database']
  deployment: RuntimeConfig['deployment']
  email: RuntimeConfig['email']
  media: {
    mode: RuntimeConfig['media']['provider']
    supported: boolean
    reason: string | null
  }
  operations: {
    mediaReconcileTokenConfigured: boolean
  }
}

export const getStarterContract = (config: RuntimeConfig): StarterContract => {
  const deployedToVercel = config.deployment.isProduction && config.deployment.isVercel

  return {
    application: config.application,
    auth: config.auth,
    database: config.database,
    deployment: config.deployment,
    email: config.email,
    media:
      deployedToVercel && config.media.provider === 'localDisk'
        ? {
            mode: 'localDisk',
            supported: false,
            reason:
              'This starter uses local disk media storage. Vercel deployments require a durable media adapter before editors can upload assets safely.',
          }
        : {
            mode: config.media.provider,
            supported: true,
            reason: null,
          },
    operations: {
      mediaReconcileTokenConfigured: Boolean(config.operations.mediaReconcileToken),
    },
  }
}

export const assertSupportedStarterContract = (contract: StarterContract): void => {
  if (!contract.media.supported && contract.media.reason) {
    throw new Error(contract.media.reason)
  }
}
