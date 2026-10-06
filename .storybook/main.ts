import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: [
    '../src/stories/revamp/**/*.stories.@(ts|tsx)',
    '../src/stories/blocks/**/*.stories.@(ts|tsx)',
  ],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      // Do not import the application's withPayload configuration into Storybook.
      nextConfigPath: fileURLToPath(new URL('./next.config.mjs', import.meta.url)),
    },
  },
  core: { disableTelemetry: true },
  viteFinal: async (viteConfig) => {
    const aliases = viteConfig.resolve?.alias ?? []
    return {
      ...viteConfig,
      publicDir: false,
      resolve: {
        ...viteConfig.resolve,
        alias: [
          ...(Array.isArray(aliases)
            ? aliases
            : Object.entries(aliases).map(([find, replacement]) => ({ find, replacement }))),
          { find: '@', replacement: fileURLToPath(new URL('../src', import.meta.url)) },
        ],
      },
    }
  },
}
export default config
