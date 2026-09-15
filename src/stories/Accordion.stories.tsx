import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const meta = {
  title: 'Existing components/Accordion',
  component: Accordion,
  args: { type: 'single', collapsible: true },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Source: @shadcn/accordion — https://ui.shadcn.com/docs/components/radix/accordion. Existing project adaptation. Use the canvas to test keyboard and pointer interaction.',
      },
    },
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="preview">
        <AccordionTrigger>What does this preview show?</AccordionTrigger>
        <AccordionContent>The real component, rendered with sample content.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="cms">
        <AccordionTrigger>Does editing a story update the CMS?</AccordionTrigger>
        <AccordionContent>
          Story controls only affect this preview. Use Payload Live Preview for saved content.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'What does this preview show?' })
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(
      canvas.getByText('The real component, rendered with sample content.'),
    ).toBeVisible()
    await userEvent.keyboard('{Enter}')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}
