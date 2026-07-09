import type { RuntimeConfig } from './runtime'

export type StarterContract = {
  database: RuntimeConfig['database']
  deployment: RuntimeConfig['deployment']
  email: RuntimeConfig['email']
  media: {
    mode: 'localDisk'
    supported: boolean
    reason: string | null
  }
}

export const getStarterContract = (config: RuntimeConfig): StarterContract => {
  const deployedToVercel = config.deployment.isProduction && config.deployment.isVercel

  return {
    database: config.database,
    deployment: config.deployment,
    email: config.email,
    media: deployedToVercel
      ? {
          mode: 'localDisk',
          supported: false,
          reason:
            'This starter uses local disk media storage. Vercel deployments require a durable media adapter before editors can upload assets safely.',
        }
      : {
          mode: 'localDisk',
          supported: true,
          reason: null,
        },
  }
}

export const assertSupportedStarterContract = (contract: StarterContract): void => {
  if (!contract.media.supported && contract.media.reason) {
    throw new Error(contract.media.reason)
  }
}
