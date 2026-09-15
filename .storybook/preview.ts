import type { Preview } from '@storybook/nextjs-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'

import './preview.css'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    withThemeByClassName({ themes: { light: '', dark: 'dark' }, defaultTheme: 'light' }),
  ],
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'fullscreen',
    viewport: { options: INITIAL_VIEWPORTS },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
    a11y: { test: 'todo' },
  },
}
export default preview
