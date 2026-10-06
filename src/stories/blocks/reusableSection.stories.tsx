import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PageBlockStack } from '@/blocks/PageBlockStack'
import { getBlockThumbnailFixture } from '@/block-thumbnails/fixtures'

const meta = {
  title: 'Blocks/Reusable Section',
  component: PageBlockStack,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'reusableSection',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Reusable Section resolves a CMS relationship into the same production PageBlockStack used by pages. This story composes shared local production fixtures, without loading a relationship or copying block implementations. Edit the referenced section in Payload to update all pages that use it.',
      },
    },
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof PageBlockStack>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { children: getBlockThumbnailFixture('reusableSection') } }
export const MultipleBlocks: Story = {
  args: {
    children: [
      getBlockThumbnailFixture('reusableSection'),
      getBlockThumbnailFixture('statsStrip'),
      getBlockThumbnailFixture('bannerCta'),
    ],
  },
}
export const Empty: Story = { args: { children: null } }
