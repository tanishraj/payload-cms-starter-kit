import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Logos20 } from '@/components/logos20'

const logos = ['North Studio', 'Common Ground', 'Fieldwork', 'Open House'].map((name, index) => ({
  id: `sample-${index}`,
  name,
  image: { src: '/block-thumbnail-assets/brand-mark.svg', alt: name, width: 160, height: 64 },
}))
const meta = {
  title: 'Existing blocks/Logos20',
  component: Logos20,
  parameters: {
    docs: {
      description: {
        component:
          'Source: @shadcnblocks/logos20 — https://www.shadcnblocks.com/block/logos20. Existing project adaptation used to verify the Storybook foundation. Sample organizations and local artwork; no CMS connection. Replacement blocks will receive their own stories.',
      },
    },
  },
  args: {
    title: 'Our partners',
    description: 'A sample of the teams we work with.',
    rows: [
      { id: 'first', logos },
      { id: 'second', logos: [...logos].reverse() },
    ],
    enableMotion: true,
    showPauseControl: true,
    showLabels: true,
    grayscale: false,
    logoHeight: 'md',
    speed: 'normal',
    contentAlignment: 'center',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    eyebrow: { control: 'text' },
    enableMotion: { control: 'boolean' },
    showPauseControl: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    grayscale: { control: 'boolean' },
    speed: { control: 'select', options: ['slow', 'normal', 'fast'] },
    logoHeight: { control: 'select', options: ['sm', 'md', 'lg'] },
    contentAlignment: { control: 'select', options: ['left', 'center', 'right'] },
  },
} satisfies Meta<typeof Logos20>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Static: Story = { args: { enableMotion: false } }
export const LongText: Story = {
  args: {
    title: 'Working together with organizations across communities and disciplines',
    description:
      'Longer sample content helps check wrapping and spacing at narrow viewport widths before a block is used on a real page.',
  },
}
export const Empty: Story = { args: { rows: [] } }
export const MissingImage: Story = {
  args: {
    enableMotion: false,
    rows: [
      {
        id: 'missing',
        logos: [
          {
            ...logos[0],
            image: { ...logos[0].image, src: '/storybook-intentionally-missing.svg' },
          },
        ],
      },
    ],
  },
}
